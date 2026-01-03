/**
 * ============================================
 * DAYFLOW - HR Management System Backend
 * Complete Backend Implementation
 * ============================================
 * Features:
 * - Authentication & Authorization (JWT)
 * - Employee Profile Management
 * - Attendance Tracking (Check-in/Check-out)
 * - Leave Management (with Email Notifications)
 * - Payroll Management (with PDF Generation)
 * - Admin Dashboard & Analytics
 * - Email Notifications (Nodemailer)
 * ============================================
 */

// ==================== DEPENDENCIES ====================
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// ==================== CONFIGURATION ====================
const app = express();
const PORT = process.env.PORT || 5000;

// Configuration Constants  
const CONFIG = {
    DB_HOST: 'localhost',
    DB_USER: 'root',
    DB_PASSWORD: '',
    DB_NAME: 'hrms',
    DB_PORT: 3306,
    JWT_SECRET: 'dayflow-hr-secret-key-2026-secure',
    JWT_EXPIRES_IN: '7d',
    EMAIL_HOST: 'smtp-relay.brevo.com',
    EMAIL_PORT: 587,
    EMAIL_USER: 'kush.work1310@gmail.com',
    EMAIL_PASSWORD: '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',
    EMAIL_FROM: 'DayFlow HR <kush.work1310@gmail.com>',
    FRONTEND_URL: 'http://localhost:5173'
};

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', 'http://192.168.56.1:8080', 'http://192.168.19.144:8080'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ==================== DATABASE CONNECTION ====================
let db;

async function initializeDatabase() {
    try {
        // Connect without database first
        const connection = await mysql.createConnection({
            host: CONFIG.DB_HOST,
            user: CONFIG.DB_USER,
            password: CONFIG.DB_PASSWORD,
            port: CONFIG.DB_PORT
        });

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${CONFIG.DB_NAME}`);
        await connection.end();

        // Connect to the database
        db = await mysql.createConnection({
            host: CONFIG.DB_HOST,
            user: CONFIG.DB_USER,
            password: CONFIG.DB_PASSWORD,
            database: CONFIG.DB_NAME,
            port: CONFIG.DB_PORT
        });

        console.log('✅ Database connected successfully');
        await createTables();
        await seedDefaultData();
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
}

// ==================== DATABASE SCHEMA ====================
async function createTables() {
    try {
        // Users table
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'employee') DEFAULT 'employee',
        department VARCHAR(100),
        position VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        joining_date DATE,
        basic_salary DECIMAL(10, 2) DEFAULT 50000.00,
        allowances DECIMAL(10, 2) DEFAULT 10000.00,
        deductions DECIMAL(10, 2) DEFAULT 5000.00,
        profile_picture VARCHAR(255),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        // Attendance table
        await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status ENUM('present', 'absent', 'half-day', 'leave') DEFAULT 'absent',
        work_hours DECIMAL(4, 2),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, date)
      )
    `);

        // Leave requests table
        await db.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        leave_type ENUM('paid', 'sick', 'unpaid') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        admin_comment TEXT,
        applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

        // Leave balances table
        await db.query(`
      CREATE TABLE IF NOT EXISTS leave_balances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        earned_leave INT DEFAULT 18,
        sick_leave INT DEFAULT 12,
        casual_leave INT DEFAULT 8,
        year INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_year (user_id, year)
      )
    `);

        // Payroll table
        await db.query(`
      CREATE TABLE IF NOT EXISTS payroll (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        month VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        basic_salary DECIMAL(10, 2) NOT NULL,
        allowances DECIMAL(10, 2) NOT NULL,
        deductions DECIMAL(10, 2) NOT NULL,
        net_salary DECIMAL(10, 2) NOT NULL,
        status ENUM('generated', 'paid') DEFAULT 'generated',
        payment_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_month (user_id, month, year)
      )
    `);

        // Departments table
        await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        head_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Email notifications log
        await db.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT,
        status ENUM('sent', 'failed') DEFAULT 'sent',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('✅ Database tables created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
    }
}

// ==================== SEED DEFAULT DATA ====================
async function seedDefaultData() {
    try {
        // Check if admin exists
        const [existingAdmin] = await db.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');

        if (existingAdmin.length === 0) {
            // Create single admin user
            const hashedPassword = await bcrypt.hash('kush2026', 10);
            await db.query(`
        INSERT INTO users (employee_id, email, password, first_name, last_name, role, department, position, phone, joining_date, basic_salary, allowances, deductions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ['ADMIN001', 'kush@dayflow.com', hashedPassword, 'Kush', 'Shah', 'admin', 'Management', 'System Administrator', '+91 99999 99999', '2026-01-01', 100000, 20000, 15000]);

            console.log('✅ Admin user created (kush@dayflow.com)');
        }

        // Seed departments
        const departments = ['Human Resources', 'Engineering', 'Design', 'Marketing', 'Sales', 'Finance'];
        for (const dept of departments) {
            await db.query('INSERT IGNORE INTO departments (name) VALUES (?)', [dept]);
        }

        console.log('✅ Default data seeded successfully');
    } catch (error) {
        console.error('Error seeding data:', error.message);
    }
}

// ==================== EMAIL SERVICE ====================
const transporter = nodemailer.createTransport({
    host: CONFIG.EMAIL_HOST,
    port: CONFIG.EMAIL_PORT,
    secure: false,
    auth: {
        user: CONFIG.EMAIL_USER,
        pass: CONFIG.EMAIL_PASSWORD
    }
});

async function sendEmail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: CONFIG.EMAIL_FROM,
            to: to,
            subject: subject,
            html: html
        });

        await db.query('INSERT INTO email_logs (recipient, subject, body, status) VALUES (?, ?, ?, ?)',
            [to, subject, html, 'sent']);

        console.log(`✅ Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        await db.query('INSERT INTO email_logs (recipient, subject, body, status, error_message) VALUES (?, ?, ?, ?, ?)',
            [to, subject, html, 'failed', error.message]);
        return false;
    }
}

// Email templates
function getLeaveStatusEmail(userName, leaveType, startDate, endDate, status, adminComment) {
    const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
    const statusIcon = status === 'approved' ? '✅' : '❌';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 10px 20px; background: ${statusColor}; color: white; border-radius: 5px; font-weight: bold; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 DayFlow HR Suite</h1>
          <p>Leave Request Update</p>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>Your leave request has been <span class="status-badge">${statusIcon} ${status.toUpperCase()}</span></p>
          
          <div class="details">
            <h3>Leave Details:</h3>
            <p><strong>Type:</strong> ${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} Leave</p>
            <p><strong>Duration:</strong> ${startDate} to ${endDate}</p>
            ${adminComment ? `<p><strong>Admin Comment:</strong> ${adminComment}</p>` : ''}
          </div>
          
          <p>You can view more details by logging into your DayFlow account.</p>
          <p>Best regards,<br>DayFlow HR Team</p>
        </div>
        <div class="footer">
          <p>Made in India 🇮🇳 | DayFlow HR Suite © 2026</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getWelcomeEmail(userName, employeeId, email) {
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to DayFlow!</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>Welcome to DayFlow HR Suite! Your account has been successfully created.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Employee ID:</strong> ${employeeId}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <p>You can now access your dashboard to:</p>
          <ul>
            <li>View and manage your profile</li>
            <li>Track attendance</li>
            <li>Apply for leave</li>
            <li>View salary details</li>
          </ul>
          
          <p>Best regards,<br>DayFlow HR Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ==================== JWT MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, CONFIG.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ==================== AUTHENTICATION ROUTES ====================

// Sign Up
app.post('/api/auth/register', async (req, res) => {
    try {
        const { employeeId, email, password, firstName, lastName, role, department, position, phone } = req.body;

        // Validation
        if (!employeeId || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR employee_id = ?', [email, employeeId]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email or Employee ID already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.query(`
      INSERT INTO users (employee_id, email, password, first_name, last_name, role, department, position, phone, joining_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
    `, [employeeId, email, hashedPassword, firstName, lastName, role || 'employee', department || 'General', position || 'Staff', phone || '']);

        const userId = result.insertId;

        // Create leave balance for current year
        const currentYear = new Date().getFullYear();
        await db.query('INSERT INTO leave_balances (user_id, year) VALUES (?, ?)', [userId, currentYear]);

        // Send welcome email
        sendEmail(email, 'Welcome to DayFlow HR Suite', getWelcomeEmail(`${firstName} ${lastName}`, employeeId, email));

        // Get created user
        const [newUser] = await db.query('SELECT id, employee_id, email, first_name, last_name, role, department, position FROM users WHERE id = ?', [userId]);

        // Generate token
        const token = jwt.sign({ id: newUser[0].id, email: newUser[0].email, role: newUser[0].role }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser[0]
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

// Sign In
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });

        // Remove password from response
        delete user.password;

        res.json({
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// ==================== USER PROFILE ROUTES ====================

// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, employee_id, email, first_name, last_name, role, department, position, phone, address, joining_date, basic_salary, allowances, deductions, profile_picture FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        // Ensure numbers
        user.basic_salary = Number(user.basic_salary);
        user.allowances = Number(user.allowances);
        user.deductions = Number(user.deductions);

        // Map database fields to frontend camelCase if needed, or rely on frontend to map snake_case
        // But the frontend seems to expect camelCase e.g. basicSalary
        const mappedUser = {
            ...user,
            basicSalary: user.basic_salary,
            joiningDate: user.joining_date,
            employeeId: user.employee_id,
            firstName: user.first_name,
            lastName: user.last_name,
            profilePicture: user.profile_picture
        };

        res.json({ user: mappedUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
});

// Update current user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, address, profilePicture } = req.body;

        await db.query(`
      UPDATE users 
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          profile_picture = COALESCE(?, profile_picture)
      WHERE id = ?
    `, [firstName, lastName, phone, address, profilePicture, req.user.id]);

        const [updated] = await db.query('SELECT id, employee_id, email, first_name, last_name, role, department, position, phone, address, joining_date, profile_picture FROM users WHERE id = ?', [req.user.id]);

        res.json({ message: 'Profile updated successfully', user: updated[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
});

// ==================== EMPLOYEES ====================

// Get all employees
app.get('/api/employees', authenticateToken, async (req, res) => {
    try {
        const { department, search } = req.query;

        let query = 'SELECT id, employee_id, email, first_name, last_name, role, department, position, phone, joining_date FROM users WHERE 1=1';
        const params = [];

        if (department && department !== 'all') {
            query += ' AND department = ?';
            params.push(department);
        }

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const [users] = await db.query(query, params);
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
    }
});

// Add new employee
app.post('/api/employees/add', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { employeeId, email, firstName, lastName, department, position, phone, joiningDate, basicSalary, allowances, deductions } = req.body;

        // Validation
        if (!employeeId || !email || !firstName || !lastName) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        // Check unique
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR employee_id = ?', [email, employeeId]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email or Employee ID already exists' });
        }

        // Generate default password (e.g., first name + 123)
        const defaultPassword = `${firstName.toLowerCase()}123`;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await db.query(`
      INSERT INTO users (employee_id, email, password, first_name, last_name, role, department, position, phone, joining_date, basic_salary, allowances, deductions)
      VALUES (?, ?, ?, ?, ?, 'employee', ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, email, hashedPassword, firstName, lastName, department, position, phone, joiningDate || new Date(), basicSalary || 50000, allowances || 10000, deductions || 5000]);

        // Send welcome email
        sendEmail(email, 'Welcome to DayFlow Team', getWelcomeEmail(`${firstName} ${lastName}`, employeeId, email));

        res.status(201).json({ message: 'Employee added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add employee', details: error.message });
    }
});

// Get departments list
app.get('/api/employees/departments', authenticateToken, async (req, res) => {
    try {
        // Get from departments table
        const [depts] = await db.query('SELECT name FROM departments ORDER BY name');

        // Also get any departments currently assigned to users that might not be in the departments table
        const [userDepts] = await db.query('SELECT DISTINCT department FROM users WHERE department IS NOT NULL');

        const allDepts = new Set([...depts.map(d => d.name), ...userDepts.map(u => u.department)]);

        res.json({ departments: Array.from(allDepts).sort() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments', details: error.message });
    }
});

// Get positions list for autocomplete
app.get('/api/employees/positions', authenticateToken, async (req, res) => {
    try {
        const [positions] = await db.query('SELECT DISTINCT position FROM users WHERE position IS NOT NULL AND position != "" ORDER BY position');
        res.json({ positions: positions.map(p => p.position) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch positions', details: error.message });
    }
});

// Get employee statistics (Department distribution)
app.get('/api/employees/statistics', authenticateToken, async (req, res) => {
    try {
        const [stats] = await db.query(`
            SELECT department, COUNT(*) as count 
            FROM users 
            WHERE department IS NOT NULL 
            GROUP BY department
        `);

        res.json({ departments: stats.map(s => ({ name: s.department, value: s.count })) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
    }
});

// ==================== ANALYTICS ====================

app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
    // Determine user role and return appropriate data
    // For now returning basic stats
    res.json({ message: 'Analytics dashboard data' });
});

// Get attendance analytics
app.get('/api/analytics/attendance', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Logic to fetch attendance stats over time
        // Using last 6 months grouping

        const query = `
            SELECT 
                DATE_FORMAT(date, '%b') as month,
                SUM(CASE WHEN status = 'present' OR status = 'half-day' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as 'leave'
            FROM attendance
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(date), MONTH(date), DATE_FORMAT(date, '%b')
            ORDER BY YEAR(date), MONTH(date)
        `;

        const [data] = await db.query(query);

        // Calculate aggregate stats
        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_count,
                AVG(work_hours) as avg_hours
            FROM attendance
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);

        // Get total active users for percentages
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role="employee"');
        const activeUsers = userCount[0].count || 1;

        const avgAttendance = summary[0].total_records > 0
            ? Math.round((summary[0].present_count / summary[0].total_records) * 100)
            : 0;

        const leaveRate = summary[0].total_records > 0
            ? Math.round((summary[0].leave_count / summary[0].total_records) * 100)
            : 0;

        res.json({
            data,
            stats: {
                avgAttendance: `${avgAttendance}%`,
                leaveRate: `${leaveRate}%`,
                avgHours: `${Number(summary[0].avg_hours || 0).toFixed(1)}h`,
                growth: '+0%' // Placeholder for now
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance analytics', details: error.message });
    }
});

// Get leave trends
app.get('/api/analytics/leave-trends', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE_FORMAT(start_date, '%b') as month,
                SUM(CASE WHEN leave_type = 'paid' THEN 1 ELSE 0 END) as earned,
                SUM(CASE WHEN leave_type = 'sick' THEN 1 ELSE 0 END) as sick,
                SUM(CASE WHEN leave_type = 'unpaid' THEN 1 ELSE 0 END) as casual
            FROM leave_requests
            WHERE status = 'approved' AND start_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY YEAR(start_date), MONTH(start_date), DATE_FORMAT(start_date, '%b')
            ORDER BY YEAR(start_date), MONTH(start_date)
        `;

        const [trends] = await db.query(query);
        res.json({ trends });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave trends', details: error.message });
    }
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { department, search } = req.query;

        let query = 'SELECT id, employee_id, email, first_name, last_name, role, department, position, phone, joining_date FROM users WHERE 1=1';
        const params = [];

        if (department && department !== 'all') {
            query += ' AND department = ?';
            params.push(department);
        }

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const [users] = await db.query(query, params);
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Update user (Admin only)
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, department, position, phone, address, basicSalary, allowances, deductions } = req.body;

        await db.query(`
      UPDATE users 
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          department = COALESCE(?, department),
          position = COALESCE(?, position),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          basic_salary = COALESCE(?, basic_salary),
          allowances = COALESCE(?, allowances),
          deductions = COALESCE(?, deductions)
      WHERE id = ?
    `, [firstName, lastName, department, position, phone, address, basicSalary, allowances, deductions, id]);

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// ==================== LEAVE MANAGEMENT ROUTES ====================

// Submit leave request
app.post('/api/leaves/request', authenticateToken, async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate) {
            return res.status(400).json({ error: 'Leave type, start date, and end date are required' });
        }

        // Insert leave request
        const [result] = await db.query(`
      INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [req.user.id, leaveType, startDate, endDate, reason || '']);

        // Get user details for response
        const [user] = await db.query('SELECT first_name, last_name FROM users WHERE id = ?', [req.user.id]);

        res.status(201).json({
            message: 'Leave request submitted successfully',
            leaveRequest: {
                id: result.insertId,
                userName: `${user[0].first_name} ${user[0].last_name}`,
                leaveType,
                startDate,
                endDate,
                reason,
                status: 'pending'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit leave request', details: error.message });
    }
});

// Get my leave requests
app.get('/api/leaves/my-requests', authenticateToken, async (req, res) => {
    try {
        const [leaves] = await db.query(`
      SELECT lr.*, u.first_name, u.last_name 
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE lr.user_id = ?
      ORDER BY lr.applied_on DESC
    `, [req.user.id]);

        const formattedLeaves = leaves.map(leave => ({
            id: leave.id,
            userId: leave.user_id,
            userName: `${leave.first_name} ${leave.last_name}`,
            leaveType: leave.leave_type,
            startDate: leave.start_date,
            endDate: leave.end_date,
            reason: leave.reason,
            status: leave.status,
            adminComment: leave.admin_comment,
            appliedOn: leave.applied_on
        }));

        res.json({ leaves: formattedLeaves });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave requests', details: error.message });
    }
});

// Get leave balance
app.get('/api/leaves/balance', authenticateToken, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const [balance] = await db.query('SELECT * FROM leave_balances WHERE user_id = ? AND year = ?', [req.user.id, currentYear]);

        if (balance.length === 0) {
            // Create balance if not exists
            await db.query('INSERT INTO leave_balances (user_id, year) VALUES (?, ?)', [req.user.id, currentYear]);
            return res.json({ earnedLeave: 18, sickLeave: 12, casualLeave: 8 });
        }

        res.json({
            earnedLeave: balance[0].earned_leave,
            sickLeave: balance[0].sick_leave,
            casualLeave: balance[0].casual_leave
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave balance', details: error.message });
    }
});

// Get all pending leave requests (Admin only)
app.get('/api/leaves/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [leaves] = await db.query(`
      SELECT lr.*, u.first_name, u.last_name, u.email
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE lr.status = 'pending'
      ORDER BY lr.applied_on DESC
    `);

        const formattedLeaves = leaves.map(leave => ({
            id: leave.id,
            userId: leave.user_id,
            userName: `${leave.first_name} ${leave.last_name}`,
            userEmail: leave.email,
            leaveType: leave.leave_type,
            startDate: leave.start_date,
            endDate: leave.end_date,
            reason: leave.reason,
            status: leave.status,
            appliedOn: leave.applied_on
        }));

        res.json({ leaves: formattedLeaves });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending leaves', details: error.message });
    }
});

// Get all leave requests (Admin only)
app.get('/api/leaves/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
      SELECT lr.*, u.first_name, u.last_name, u.email
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
    `;

        const params = [];
        if (status && status !== 'all') {
            query += ' WHERE lr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY lr.applied_on DESC';

        const [leaves] = await db.query(query, params);

        const formattedLeaves = leaves.map(leave => ({
            id: leave.id,
            userId: leave.user_id,
            userName: `${leave.first_name} ${leave.last_name}`,
            userEmail: leave.email,
            leaveType: leave.leave_type,
            startDate: leave.start_date,
            endDate: leave.end_date,
            reason: leave.reason,
            status: leave.status,
            adminComment: leave.admin_comment,
            appliedOn: leave.applied_on
        }));

        res.json({ leaves: formattedLeaves });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave requests', details: error.message });
    }
});

// Approve leave request (Admin only) - WITH EMAIL NOTIFICATION
app.put('/api/leaves/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { adminComment } = req.body;

        // Get leave details
        const [leave] = await db.query(`
      SELECT lr.*, u.email, u.first_name, u.last_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE lr.id = ?
    `, [id]);

        if (leave.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Update leave status
        await db.query('UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?', ['approved', adminComment || 'Approved', id]);

        // Calculate leave days
        const start = new Date(leave[0].start_date);
        const end = new Date(leave[0].end_date);
        const leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Update leave balance
        const currentYear = new Date().getFullYear();
        const leaveTypeColumn = leave[0].leave_type === 'paid' ? 'earned_leave' :
            leave[0].leave_type === 'sick' ? 'sick_leave' : 'casual_leave';

        if (leave[0].leave_type !== 'unpaid') {
            await db.query(`
        UPDATE leave_balances 
        SET ${leaveTypeColumn} = ${leaveTypeColumn} - ? 
        WHERE user_id = ? AND year = ?
      `, [leaveDays, leave[0].user_id, currentYear]);
        }

        // Send email notification
        const userName = `${leave[0].first_name} ${leave[0].last_name}`;
        const emailHtml = getLeaveStatusEmail(
            userName,
            leave[0].leave_type,
            leave[0].start_date,
            leave[0].end_date,
            'approved',
            adminComment || 'Approved'
        );

        sendEmail(leave[0].email, 'Leave Request Approved ✅', emailHtml);

        res.json({ message: 'Leave request approved successfully', emailSent: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve leave', details: error.message });
    }
});

// Reject leave request (Admin only) - WITH EMAIL NOTIFICATION
app.put('/api/leaves/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { adminComment } = req.body;

        // Get leave details
        const [leave] = await db.query(`
      SELECT lr.*, u.email, u.first_name, u.last_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      WHERE lr.id = ?
    `, [id]);

        if (leave.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Update leave status
        await db.query('UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?', ['rejected', adminComment || 'Not approved', id]);

        // Send email notification
        const userName = `${leave[0].first_name} ${leave[0].last_name}`;
        const emailHtml = getLeaveStatusEmail(
            userName,
            leave[0].leave_type,
            leave[0].start_date,
            leave[0].end_date,
            'rejected',
            adminComment || 'Not approved'
        );

        sendEmail(leave[0].email, 'Leave Request Update ⚠️', emailHtml);

        res.json({ message: 'Leave request rejected', emailSent: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject leave', details: error.message });
    }
});

// ==================== ATTENDANCE ROUTES ====================

// Check-in
app.post('/api/attendance/check-in', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const checkInTime = new Date().toTimeString().split(' ')[0];

        // Check if already checked in today
        const [existing] = await db.query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [req.user.id, today]);

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        // Insert attendance record
        await db.query('INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, ?)',
            [req.user.id, today, checkInTime, 'present']);

        res.json({ message: 'Check-in successful', checkIn: checkInTime });
    } catch (error) {
        res.status(500).json({ error: 'Check-in failed', details: error.message });
    }
});

// Check-out
app.post('/api/attendance/check-out', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const checkOutTime = new Date().toTimeString().split(' ')[0];

        // Get today's attendance
        const [attendance] = await db.query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [req.user.id, today]);

        if (attendance.length === 0) {
            return res.status(400).json({ error: 'No check-in found for today' });
        }

        if (attendance[0].check_out) {
            return res.status(400).json({ error: 'Already checked out today' });
        }

        // Calculate work hours
        const checkIn = new Date(`1970-01-01T${attendance[0].check_in}`);
        const checkOut = new Date(`1970-01-01T${checkOutTime}`);
        const workHours = (checkOut - checkIn) / (1000 * 60 * 60);

        // Determine status
        let status = 'present';
        if (workHours < 4) {
            status = 'half-day';
        }

        // Update attendance
        await db.query('UPDATE attendance SET check_out = ?, work_hours = ?, status = ? WHERE id = ?',
            [checkOutTime, workHours.toFixed(2), status, attendance[0].id]);

        res.json({ message: 'Check-out successful', checkOut: checkOutTime, workHours: workHours.toFixed(2) });
    } catch (error) {
        res.status(500).json({ error: 'Check-out failed', details: error.message });
    }
});

// Get my attendance records
app.get('/api/attendance/my-records', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, limit = 30 } = req.query;

        let query = 'SELECT * FROM attendance WHERE user_id = ?';
        const params = [req.user.id];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY date DESC LIMIT ?';
        params.push(parseInt(limit));

        const [records] = await db.query(query, params);
        res.json({ records });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
    }
});

// Get attendance summary
app.get('/api/attendance/summary', authenticateToken, async (req, res) => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);

        const [summary] = await db.query(`
      SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentDays,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absentDays,
        SUM(CASE WHEN status = 'half-day' THEN 1 ELSE 0 END) as halfDays,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leaveDays,
        AVG(work_hours) as avgWorkHours
      FROM attendance 
      WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
    `, [req.user.id, currentMonth]);

        res.json({ summary: summary[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary', details: error.message });
    }
});

// Get all attendance (Admin only)
app.get('/api/attendance/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { date, userId } = req.query;

        let query = `
      SELECT a.*, u.first_name, u.last_name, u.employee_id
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
        const params = [];

        if (date) {
            query += ' AND a.date = ?';
            params.push(date);
        }

        if (userId) {
            query += ' AND a.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY a.date DESC, u.first_name ASC';

        const [records] = await db.query(query, params);
        res.json({ records });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance', details: error.message });
    }
});

// ==================== PAYROLL ROUTES ====================

// Get salary details
app.get('/api/payroll/salary', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT basic_salary, allowances, deductions FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        res.json({
            basicSalary: Number(user.basic_salary),
            allowances: Number(user.allowances),
            deductions: Number(user.deductions)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch salary', details: error.message });
    }
});

// Get payslip history
app.get('/api/payroll/payslips', authenticateToken, async (req, res) => {
    try {
        const [payslips] = await db.query('SELECT * FROM payroll WHERE user_id = ? ORDER BY year DESC, month DESC', [req.user.id]);
        res.json({ payslips });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payslips', details: error.message });
    }
});

// Download payslip PDF
app.get('/api/payroll/payslip/:month/:year', authenticateToken, async (req, res) => {
    try {
        const { month, year } = req.params;

        // Get user details
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = user[0];
        const monthlySalary = {
            basic: parseFloat(userData.basic_salary) / 12,
            allowances: parseFloat(userData.allowances) / 12,
            deductions: parseFloat(userData.deductions) / 12
        };
        const netSalary = monthlySalary.basic + monthlySalary.allowances - monthlySalary.deductions;

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Payslip_${month}_${year}_${userData.employee_id}.pdf`);

        doc.pipe(res);

        // Header
        doc.rect(0, 0, 612, 100).fill('#667eea');
        doc.fillColor('#ffffff')
            .fontSize(28)
            .font('Helvetica-Bold')
            .text('DAYFLOW HR SUITE', 50, 30, { align: 'center' });
        doc.fontSize(14)
            .font('Helvetica')
            .text(`Payslip for ${month} ${year}`, 50, 65, { align: 'center' });

        // Employee Details
        doc.fillColor('#000000')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('Employee Details', 50, 130);

        doc.fontSize(11)
            .font('Helvetica')
            .text(`Name: ${userData.first_name} ${userData.last_name}`, 50, 155)
            .text(`Employee ID: ${userData.employee_id}`, 50, 172)
            .text(`Department: ${userData.department}`, 50, 189)
            .text(`Position: ${userData.position}`, 50, 206)
            .text(`Pay Period: ${month} ${year}`, 350, 155)
            .text(`Pay Date: ${new Date().toLocaleDateString('en-IN')}`, 350, 172);

        // Earnings Table
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('Earnings', 50, 240);

        let y = 260;
        doc.fontSize(10).font('Helvetica');

        const earnings = [
            ['Basic Salary', `₹${monthlySalary.basic.toFixed(2)}`],
            ['House Rent Allowance', `₹${(monthlySalary.allowances * 0.5).toFixed(2)}`],
            ['Conveyance Allowance', `₹${(monthlySalary.allowances * 0.3).toFixed(2)}`],
            ['Special Allowance', `₹${(monthlySalary.allowances * 0.2).toFixed(2)}`],
            ['Gross Earnings', `₹${(monthlySalary.basic + monthlySalary.allowances).toFixed(2)}`]
        ];

        earnings.forEach(([label, value]) => {
            doc.text(label, 50, y);
            doc.text(value, 250, y, { width: 90, align: 'right' });
            y += 20;
        });

        // Deductions Table
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('Deductions', 360, 240);

        y = 260;
        doc.fontSize(10).font('Helvetica');

        const deductions = [
            ['Provident Fund', `₹${(monthlySalary.deductions * 0.4).toFixed(2)}`],
            ['Professional Tax', '₹200.00'],
            ['Income Tax (TDS)', `₹${(monthlySalary.deductions * 0.5).toFixed(2)}`],
            ['ESI', `₹${(monthlySalary.deductions * 0.1).toFixed(2)}`],
            ['Total Deductions', `₹${monthlySalary.deductions.toFixed(2)}`]
        ];

        deductions.forEach(([label, value]) => {
            doc.text(label, 360, y);
            doc.text(value, 510, y, { width: 90, align: 'right' });
            y += 20;
        });

        // Net Salary
        doc.rect(50, 400, 500, 60).strokeColor('#10b981').stroke();
        doc.fillColor('#10b981')
            .fontSize(16)
            .font('Helvetica-Bold')
            .text('Net Salary Payable', 60, 415);
        doc.fontSize(20)
            .text(`₹${netSalary.toFixed(2)}`, 60, 438);

        // Footer
        doc.fillColor('#666666')
            .fontSize(9)
            .font('Helvetica')
            .text('This is a computer generated payslip and does not require signature.', 50, 720, { align: 'center' })
            .text('DayFlow HR Suite | Made in India 🇮🇳', 50, 735, { align: 'center' });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate payslip', details: error.message });
    }
});

// Update employee salary (Admin only)
app.put('/api/payroll/update/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { basicSalary, allowances, deductions } = req.body;

        await db.query(`
      UPDATE users 
      SET basic_salary = COALESCE(?, basic_salary),
          allowances = COALESCE(?, allowances),
          deductions = COALESCE(?, deductions)
      WHERE id = ?
    `, [basicSalary, allowances, deductions, userId]);

        res.json({ message: 'Salary updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update salary', details: error.message });
    }
});

// ==================== EMPLOYEE MANAGEMENT ROUTES (Admin)====================

// Get all employees with filters
app.get('/api/employees', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { department, search } = req.query;

        let query = 'SELECT id, employee_id, email, first_name, last_name, role, department, position, phone, joining_date FROM users WHERE 1=1';
        const params = [];

        if (department && department !== 'all') {
            query += ' AND department = ?';
            params.push(department);
        }

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_id LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY first_name ASC';

        const [employees] = await db.query(query, params);

        // Transform to camelCase for frontend
        const transformedEmployees = employees.map(emp => ({
            id: emp.id,
            employeeId: emp.employee_id,
            email: emp.email,
            firstName: emp.first_name,
            lastName: emp.last_name,
            role: emp.role,
            department: emp.department,
            position: emp.position,
            phone: emp.phone,
            joiningDate: emp.joining_date
        }));

        res.json({ employees: transformedEmployees });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
    }
});

// Add new employee (Admin only) - WITH EMAIL NOTIFICATION
app.post('/api/employees/add', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { employeeId, email, firstName, lastName, department, position, phone, joiningDate, basicSalary, allowances, deductions } = req.body;

        // Validation
        if (!employeeId || !email || !firstName || !lastName) {
            return res.status(400).json({ error: 'Employee ID, email, first name, and last name are required' });
        }

        // Check if employee already exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR employee_id = ?', [email, employeeId]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email or Employee ID already exists' });
        }

        // Generate a random password (will be sent via email)
        const randomPassword = `welcome${Math.floor(100000 + Math.random() * 900000)}`;
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

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
        const welcomeEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .credentials { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to DayFlow HR Suite!</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${firstName} ${lastName},</p>
                        <p>Welcome to DayFlow! Your employee account has been successfully created.</p>
                        
                        <div class="credentials">
                            <h3>Your Login Credentials:</h3>
                            <p><strong>Employee ID:</strong> ${employeeId}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Temporary Password:</strong> ${randomPassword}</p>
                            <p style="color: #ef4444; font-size: 14px;">⚠️ Please change your password after first login</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>Your Profile Details:</h3>
                            <p><strong>Department:</strong> ${department || 'General'}</p>
                            <p><strong>Position:</strong> ${position || 'Staff'}</p>
                            <p><strong>Joining Date:</strong> ${joiningDate || new Date().toISOString().split('T')[0]}</p>
                        </div>
                        
                        <p>You can now access your dashboard to:</p>
                        <ul>
                            <li>View and manage your profile</li>
                            <li>Track attendance</li>
                            <li>Apply for leave</li>
                            <li>View salary details</li>
                        </ul>
                        
                        <p>If you have any questions, please contact your HR administrator.</p>
                        <p>Best regards,<br>DayFlow HR Team</p>
                    </div>
                    <div class="footer">
                        <p>Made in India 🇮🇳 | DayFlow HR Suite © 2026</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail(email, 'Welcome to DayFlow - Your Account Details', welcomeEmailHtml);

        // Get created employee
        const [newEmployee] = await db.query('SELECT id, employee_id, email, first_name, last_name, role, department, position, phone, joining_date FROM users WHERE id = ?', [userId]);

        // Transform to camelCase
        const transformedEmployee = {
            id: newEmployee[0].id,
            employeeId: newEmployee[0].employee_id,
            email: newEmployee[0].email,
            firstName: newEmployee[0].first_name,
            lastName: newEmployee[0].last_name,
            role: newEmployee[0].role,
            department: newEmployee[0].department,
            position: newEmployee[0].position,
            phone: newEmployee[0].phone,
            joiningDate: newEmployee[0].joining_date
        };

        res.status(201).json({
            message: 'Employee added successfully. Welcome email sent.',
            employee: transformedEmployee,
            temporaryPassword: randomPassword
        });
    } catch (error) {
        console.error('Add employee error:', error);
        res.status(500).json({ error: 'Failed to add employee', details: error.message });
    }
});

// Get departments
app.get('/api/employees/departments', authenticateToken, async (req, res) => {
    try {
        const [departments] = await db.query('SELECT DISTINCT department FROM users WHERE department IS NOT NULL ORDER BY department');
        res.json({ departments: departments.map(d => d.department) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments', details: error.message });
    }
});

// Get employee statistics (Admin only)
app.get('/api/employees/statistics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [stats] = await db.query(`
      SELECT 
        COUNT(*) as totalEmployees,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) as employees
      FROM users
    `);

        const [deptStats] = await db.query(`
      SELECT department, COUNT(*) as count
      FROM users
      GROUP BY department
      ORDER BY count DESC
    `);

        res.json({
            statistics: stats[0],
            departmentBreakdown: deptStats
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
    }
});

// ==================== ANALYTICS & DASHBOARD ROUTES ====================

// Get dashboard statistics
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Total employees
        const [totalEmp] = await db.query('SELECT COUNT(*) as count FROM users');

        // Present today
        const [presentToday] = await db.query('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status IN ("present", "half-day")', [today]);

        // On leave today
        const [onLeave] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM leave_requests 
      WHERE status = 'approved' 
      AND ? BETWEEN start_date AND end_date
    `, [today]);

        // Pending leave requests
        const [pending] = await db.query('SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending"');

        res.json({
            totalEmployees: totalEmp[0].count,
            presentToday: presentToday[0].count,
            onLeave: onLeave[0].count,
            pendingRequests: pending[0].count
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
    }
});

// Get attendance analytics
app.get('/api/analytics/attendance', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = `
      SELECT 
        date,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'half-day' THEN 1 ELSE 0 END) as halfDay,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as onLeave
      FROM attendance
    `;

        const params = [];
        if (startDate && endDate) {
            query += ' WHERE date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' GROUP BY date ORDER BY date DESC LIMIT 30';

        const [analytics] = await db.query(query, params);
        res.json({ analytics });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch attendance analytics', details: error.message });
    }
});

// Get leave trends
app.get('/api/analytics/leave-trends', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [trends] = await db.query(`
      SELECT 
        DATE_FORMAT(applied_on, '%Y-%m') as month,
        leave_type,
        COUNT(*) as count
      FROM leave_requests
      WHERE applied_on >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month, leave_type
      ORDER BY month DESC
    `);

        res.json({ trends });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leave trends', details: error.message });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'DayFlow HR Backend is running',
        timestamp: new Date().toISOString()
    });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ==================== SERVER STARTUP ====================
async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log('\n🚀 ============================================');
            console.log('   DAYFLOW HR MANAGEMENT SYSTEM BACKEND');
            console.log('   ============================================');
            console.log(`   ✅ Server running on http://localhost:${PORT}`);
            console.log(`   ✅ Database: ${CONFIG.DB_NAME}`);
            console.log(`   ✅ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('   ============================================');
            console.log('   📋 Default Admin Credentials:');
            console.log('   Email: kush@dayflow.com');
            console.log('   Password: kush2026');
            console.log('   ============================================\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
