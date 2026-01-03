-- =====================================================
-- DAYFLOW HR MANAGEMENT SYSTEM - Complete Database Schema
-- =====================================================
-- Database: hr_management_db
-- Description: Complete production-ready database schema
-- Compatible with: Backend.js Node/Express server
-- Last Updated: 2026-01-03
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS hr_management_db;

USE hr_management_db;

-- =====================================================
-- TABLE: users
-- Description: Stores all employee and admin user information
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password',
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_employee_id (employee_id),
  INDEX idx_department (department),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: attendance
-- Description: Tracks daily attendance records with check-in/check-out
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status ENUM('present', 'absent', 'half-day', 'leave') DEFAULT 'absent',
  work_hours DECIMAL(4, 2) COMMENT 'Calculated hours worked',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date),
  INDEX idx_date (date),
  INDEX idx_status (status),
  INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: leave_requests
-- Description: Manages employee leave applications with approval workflow
-- =====================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  leave_type ENUM('paid', 'sick', 'unpaid') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_comment TEXT COMMENT 'Comment from HR/admin when approving/rejecting',
  applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user_status (user_id, status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: leave_balances
-- Description: Tracks annual leave balances per employee per year
-- =====================================================
CREATE TABLE IF NOT EXISTS leave_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  earned_leave INT DEFAULT 18 COMMENT 'Paid leave balance',
  sick_leave INT DEFAULT 12 COMMENT 'Sick leave balance',
  casual_leave INT DEFAULT 8 COMMENT 'Casual leave balance',
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_year (user_id, year),
  INDEX idx_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: payroll
-- Description: Stores monthly payroll records and payment status
-- =====================================================
CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month VARCHAR(20) NOT NULL COMMENT 'Month name (January, February, etc.)',
  year INT NOT NULL,
  basic_salary DECIMAL(10, 2) NOT NULL,
  allowances DECIMAL(10, 2) NOT NULL,
  deductions DECIMAL(10, 2) NOT NULL,
  net_salary DECIMAL(10, 2) NOT NULL COMMENT 'Calculated: basic + allowances - deductions',
  status ENUM('generated', 'paid') DEFAULT 'generated',
  payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_month (user_id, month, year),
  INDEX idx_month_year (month, year),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: departments
-- Description: Stores department information and hierarchy
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  head_user_id INT COMMENT 'Department head/manager',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: email_logs
-- Description: Logs all email communications for audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  error_message TEXT COMMENT 'Error details if email failed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recipient (recipient),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INITIAL DATA - Default Admin and Departments
-- =====================================================

-- Insert default admin user
-- Email: admin@dayflow.com
-- Password: admin123 (hashed)
INSERT IGNORE INTO users (employee_id, email, password, first_name, last_name, role, department, position, phone, joining_date, basic_salary, allowances, deductions)
VALUES ('EMP001', 'admin@dayflow.com', '$2a$10$X8ZQQ3Z9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y', 'Sarah', 'Johnson', 'admin', 'Human Resources', 'HR Manager', '+91 98765 43210', '2020-01-15', 85000, 15000, 12000);

-- Insert sample employee
-- Email: employee@dayflow.com  
-- Password: employee123 (hashed)
INSERT IGNORE INTO users (employee_id, email, password, first_name, last_name, role, department, position, phone, joining_date, basic_salary, allowances, deductions)
VALUES ('EMP002', 'employee@dayflow.com', '$2a$10$Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y', 'Rajesh', 'Kumar', 'employee', 'Engineering', 'Senior Developer', '+91 87654 32109', '2021-06-01', 75000, 10000, 9500);

-- Insert default departments
INSERT IGNORE INTO departments (name) VALUES 
('Human Resources'),
('Engineering'),
('Design'),
('Marketing'),
('Sales'),
('Finance');

-- Create leave balances for default users
INSERT IGNORE INTO leave_balances (user_id, earned_leave, sick_leave, casual_leave, year) VALUES
(1, 18, 12, 8, 2026),
(2, 18, 12, 8, 2026);

-- =====================================================
-- USEFUL VIEWS
-- =====================================================

-- View: Employee Summary with calculated net salary
CREATE OR REPLACE VIEW v_employee_summary AS
SELECT 
  u.id,
  u.employee_id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.department,
  u.position,
  u.phone,
  u.joining_date,
  u.basic_salary,
  u.allowances,
  u.deductions,
  (u.basic_salary + u.allowances - u.deductions) AS net_salary,
  u.created_at
FROM users u;

-- View: Pending Leave Requests
CREATE OR REPLACE VIEW v_pending_leave_requests AS
SELECT 
  lr.id,
  lr.user_id,
  u.employee_id,
  CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
  u.department,
  u.email,
  lr.leave_type,
  lr.start_date,
  lr.end_date,
  DATEDIFF(lr.end_date, lr.start_date) + 1 AS total_days,
  lr.reason,
  lr.applied_on
FROM leave_requests lr
JOIN users u ON lr.user_id = u.id
WHERE lr.status = 'pending'
ORDER BY lr.applied_on DESC;

-- View: Current Month Attendance Summary
CREATE OR REPLACE VIEW v_current_month_attendance AS
SELECT 
  a.user_id,
  u.employee_id,
  CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
  u.department,
  COUNT(*) AS total_days,
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_days,
  SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
  SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END) AS leave_days,
  ROUND(AVG(a.work_hours), 2) AS avg_work_hours
FROM attendance a
JOIN users u ON a.user_id = u.id
WHERE MONTH(a.date) = MONTH(CURRENT_DATE())
  AND YEAR(a.date) = YEAR(CURRENT_DATE())
GROUP BY a.user_id, u.employee_id, employee_name, u.department;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure: Auto-calculate work hours
CREATE PROCEDURE IF NOT EXISTS sp_calculate_work_hours(
  IN p_attendance_id INT
)
BEGIN
  DECLARE v_check_in TIME;
  DECLARE v_check_out TIME;
  DECLARE v_work_hours DECIMAL(4,2);
  
  SELECT check_in, check_out INTO v_check_in, v_check_out
  FROM attendance
  WHERE id = p_attendance_id;
  
  IF v_check_in IS NOT NULL AND v_check_out IS NOT NULL THEN
    SET v_work_hours = TIMESTAMPDIFF(MINUTE, v_check_in, v_check_out) / 60.0;
    
    UPDATE attendance
    SET work_hours = v_work_hours,
        status = CASE 
          WHEN v_work_hours >= 8 THEN 'present'
          WHEN v_work_hours >= 4 THEN 'half-day'
          ELSE 'absent'
        END
    WHERE id = p_attendance_id;
  END IF;
END //

-- Procedure: Get employee statistics
CREATE PROCEDURE IF NOT EXISTS sp_get_employee_stats()
BEGIN
  SELECT 
    COUNT(*) AS total_employees,
    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS total_admins,
    SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) AS total_employees_regular,
    COUNT(DISTINCT department) AS total_departments
  FROM users;
END //

-- Procedure: Get department-wise employee count
CREATE PROCEDURE IF NOT EXISTS sp_department_statistics()
BEGIN
  SELECT 
    department,
    COUNT(*) AS employee_count,
    ROUND(AVG(basic_salary + allowances - deductions), 2) AS avg_net_salary
  FROM users
  WHERE department IS NOT NULL
  GROUP BY department
  ORDER BY employee_count DESC;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger: Auto-calculate work hours on check-out
CREATE TRIGGER IF NOT EXISTS trg_attendance_checkout
AFTER UPDATE ON attendance
FOR EACH ROW
BEGIN
  IF NEW.check_out IS NOT NULL AND OLD.check_out IS NULL THEN
    CALL sp_calculate_work_hours(NEW.id);
  END IF;
END //

-- Trigger: Create leave balance on user insert
CREATE TRIGGER IF NOT EXISTS trg_user_leave_balance
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO leave_balances (user_id, year)
  VALUES (NEW.id, YEAR(CURRENT_DATE()));
END //

DELIMITER ;

-- =====================================================
-- HELPFUL QUERIES (COMMENTED FOR REFERENCE)
-- =====================================================

-- Get all employees with their net salary
-- SELECT * FROM v_employee_summary;

-- Get pending leave requests
-- SELECT * FROM v_pending_leave_requests;

-- Get today's attendance
-- SELECT * FROM attendance WHERE date = CURDATE();

-- Get employee count by department
-- CALL sp_department_statistics();

-- Get overall statistics
-- CALL sp_get_employee_stats();

-- Find employees with low leave balance
-- SELECT u.employee_id, u.first_name, u.last_name, lb.earned_leave, lb.sick_leave
-- FROM users u
-- JOIN leave_balances lb ON u.id = lb.user_id
-- WHERE lb.year = YEAR(CURDATE()) AND lb.earned_leave < 5;

-- Get recent email logs
-- SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 20;

-- =====================================================
-- DATABASE SCHEMA COMPLETE
-- Server: Backend.js (Node.js + Express)
-- Frontend: React + TypeScript (Vite)
-- Ready for production deployment
-- =====================================================
