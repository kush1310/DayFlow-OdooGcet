/**
 * ADD THESE ENDPOINTS TO Backend.cjs
 * Insert after line 1164 (// ==================== EMPLOYEE MANAGEMENT ROUTES (Admin))
 */

// Add Employee Endpoint with Email Notification (Admin only)
app.post('/api/employees/add', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { employeeId, email, firstName, lastName, department, position, phone, joiningDate, basicSalary, allowances, deductions } = req.body;

        // Validation
        if (!employeeId || !email || !firstName || !lastName) {
            return res.status(400).json({ error: 'Employee ID, email, first name, and last name are required' });
        }

        // Check if employee exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR employee_id = ?', [email, employeeId]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Employee with this email or ID already exists' });
        }

        // Generate temporary password: firstname@123
        const tempPassword = `${firstName.toLowerCase()}@123`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create employee
        const [result] = await db.query(`
            INSERT INTO users (employee_id, email, password, first_name, last_name, role, department, position, phone, joining_date, basic_salary, allowances, deductions)
            VALUES (?, ?, ?, ?, ?, 'employee', ?, ?, ?, ?, ?, ?, ?)
        `, [employeeId, email, hashedPassword, firstName, lastName, department || 'General', position || 'Staff', phone || '', joiningDate || new Date().toISOString().split('T')[0], basicSalary || 50000, allowances || 10000, deductions || 5000]);

        const userId = result.insertId;

        // Create leave balance for current year
        const currentYear = new Date().getFullYear();
        await db.query('INSERT INTO leave_balances (user_id, year) VALUES (?, ?)', [userId, currentYear]);

        // Send welcome email with credentials
        const emailHtml = getNewEmployeeEmail(`${firstName} ${lastName}`, employeeId, email, tempPassword);
        await sendEmail(email, 'Welcome to DayFlow HR - Your Account Details', emailHtml);

        res.status(201).json({
            message: 'Employee added successfully and welcome email sent',
            employee: {
                id: userId,
                employeeId,
                email,
                firstName,
                lastName
            }
        });
    } catch (error) {
        console.error('Add employee error:', error);
        res.status(500).json({ error: 'Failed to add employee', details: error.message });
    }
});

// HR Permissions Endpoints

// Grant permission to employee
app.post('/api/permissions/grant', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId, permissionType } = req.body;

        if (!userId || !permissionType) {
            return res.status(400).json({ error: 'User ID and permission type are required' });
        }

        // Check if permission already exists
        const [existing] = await db.query('SELECT * FROM hr_permissions WHERE user_id = ? AND permission_type = ?', [userId, permissionType]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Permission already granted' });
        }

        await db.query('INSERT INTO hr_permissions (user_id, permission_type, granted_by) VALUES (?, ?, ?)',
            [userId, permissionType, req.user.id]);

        res.json({ message: 'Permission granted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to grant permission', details: error.message });
    }
});

// Revoke permission
app.delete('/api/permissions/revoke/:userId/:permission', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId, permission } = req.params;

        await db.query('DELETE FROM hr_permissions WHERE user_id = ? AND permission_type = ?', [userId, permission]);

        res.json({ message: 'Permission revoked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke permission', details: error.message });
    }
});

// Get user permissions
app.get('/api/permissions/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const [permissions] = await db.query('SELECT permission_type FROM hr_permissions WHERE user_id = ?', [userId]);

        res.json({ permissions: permissions.map(p => p.permission_type) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch permissions', details: error.message });
    }
});

// List all users with their permissions (Admin)
app.get('/api/permissions/list', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [usersWithPermissions] = await db.query(`
            SELECT u.id, u.employee_id, u.email, u.first_name, u.last_name, u.role,
                   GROUP_CONCAT(hp.permission_type) as permissions
            FROM users u
            LEFT JOIN hr_permissions hp ON u.id = hp.user_id
            WHERE u.role = 'employee'
            GROUP BY u.id
        `);

        res.json({ users: usersWithPermissions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch permissions list', details: error.message });
    }
});

/**
 * ADD THIS EMAIL TEMPLATE FUNCTION (after getWelcomeEmail function, around line 377)
 */
function getNewEmployeeEmail(userName, employeeId, email, tempPassword) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
        .password-box { background: #fef3c7; padding: 15px; border-radius: 5px; border: 2px dashed #f59e0b; margin: 15px 0; }
        .warning { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to DayFlow!</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>You have been added to the DayFlow HR System. Your account has been successfully created by our HR team.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Employee ID:</strong> ${employeeId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <div class="password-box">
              <p><strong>Temporary Password:</strong> <code style="font-size: 18px; font-weight: bold;">${tempPassword}</code></p>
            </div>
            <p class="warning">⚠️ IMPORTANT: Please change your password on first login for security purposes.</p>
          </div>
          
          <p>You can now access your dashboard at <a href="http://localhost:5173/auth">http://localhost:5173/auth</a> to:</p>
          <ul>
            <li>View and manage your profile</li>
            <li>Track attendance</li>
            <li>Apply for leave</li>
            <li>View salary details</li>
          </ul>
          
          <p>If you have any questions, please contact your HR department.</p>
          <p>Best regards,<br>DayFlow HR Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * ADD THIS TO CREATE TABLES FUNCTION (around line 215, after email_logs table)
 */
// HR Permissions table
await db.query(`
  CREATE TABLE IF NOT EXISTS hr_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission_type ENUM('view_attendance', 'approve_leave', 'manage_payroll', 'add_employee') NOT NULL,
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id),
    UNIQUE KEY unique_user_permission (user_id, permission_type)
  )
`);
