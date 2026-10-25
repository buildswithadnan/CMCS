-- CMCS Seed Data
-- Initial roles, departments, permissions, and users

-- ============================================================================
-- 1. SEED PERMISSIONS
-- ============================================================================
INSERT INTO permissions (name, description, category) VALUES
  -- General
  ('view_all', 'View all system data', 'general'),
  ('edit_all', 'Edit all system data', 'general'),
  
  -- Projects
  ('view_projects', 'View projects', 'projects'),
  ('create_projects', 'Create new projects', 'projects'),
  ('edit_projects', 'Edit projects', 'projects'),
  ('delete_projects', 'Delete projects', 'projects'),
  ('approve_projects', 'Approve/reject projects', 'projects'),
  
  -- Finance
  ('view_finance', 'View financial data', 'finance'),
  ('create_quotations', 'Create quotations', 'finance'),
  ('approve_quotations', 'Approve quotations', 'finance'),
  ('create_invoices', 'Create invoices', 'finance'),
  ('approve_invoices', 'Approve invoices', 'finance'),
  ('manage_expenses', 'Manage expenses', 'finance'),
  ('approve_expenses', 'Approve expenses', 'finance'),
  ('manage_payments', 'Manage payments', 'finance'),
  ('manage_salaries', 'Manage salary payments', 'finance'),
  
  -- Tasks
  ('view_all_tasks', 'View all tasks', 'tasks'),
  ('create_tasks', 'Create tasks', 'tasks'),
  ('view_own_tasks', 'View own assigned tasks', 'tasks'),
  ('manage_tasks', 'Manage task assignments', 'tasks'),
  
  -- Employees
  ('view_employees', 'View employee data', 'employees'),
  ('manage_employees', 'Create/edit employees', 'employees'),
  ('view_attendance', 'View attendance records', 'employees'),
  ('log_attendance', 'Log own attendance', 'employees'),
  ('view_salaries', 'View salary information', 'employees'),
  ('manage_leave', 'Manage leave requests', 'employees'),
  ('request_leave', 'Request leave', 'employees'),
  
  -- Equipment
  ('view_equipment', 'View equipment', 'equipment'),
  ('manage_equipment', 'Manage equipment', 'equipment'),
  ('view_schedule', 'View own schedule', 'schedule'),
  
  -- System
  ('manage_users', 'Create/edit/delete users', 'system'),
  ('manage_roles', 'Manage roles and permissions', 'system'),
  ('view_audit_logs', 'View audit logs', 'system'),
  ('system_settings', 'Manage system settings', 'system'),
  ('backup', 'Perform system backups', 'system')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. SEED ROLES
-- ============================================================================
INSERT INTO roles (name, description, color, is_system_role) VALUES
  ('CEO / Founder Manager', 'Full system access and final approval authority', '#7c3aed', true),
  ('Head of Operations', 'Manages operational workflows and project submissions', '#2563eb', true),
  ('Finance Officer', 'Manages quotations, invoices, payments and expenses', '#16a34a', true),
  ('Technical Employee', 'Executes technical assignments and logs attendance', '#0891b2', true),
  ('Production Manager', 'Oversees production tasks and team attendance', '#d97706', true),
  ('HR Manager', 'Manages employee records, contracts and leave', '#db2777', true),
  ('System Administrator', 'Manages system settings, backups and user accounts', '#1e40af', true),
  ('Administration Employee', 'Handles documents, assets, and office maintenance', '#059669', true),
  ('Employee', 'Basic employee access', '#6b7280', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. SEED DEPARTMENTS
-- ============================================================================
INSERT INTO departments (name, code, status) VALUES
  ('Executive', 'CEO', 'active'),
  ('Operations', 'HOO', 'active'),
  ('Finance', 'FIN', 'active'),
  ('Technical', 'TECH', 'active'),
  ('Production', 'PROD', 'active'),
  ('Human Resources', 'HR', 'active'),
  ('Administration', 'ADM', 'active')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 4. ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- CEO: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'CEO / Founder Manager'
ON CONFLICT DO NOTHING;

-- Head of Operations
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Head of Operations'
  AND p.name IN (
    'view_all', 'view_projects', 'create_projects', 'edit_projects',
    'view_finance', 'view_all_tasks', 'create_tasks', 'manage_tasks',
    'view_employees', 'view_attendance', 'view_equipment'
  )
ON CONFLICT DO NOTHING;

-- Finance Officer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Finance Officer'
  AND p.name IN (
    'view_projects', 'view_finance', 'create_quotations', 'create_invoices',
    'manage_expenses', 'manage_payments', 'manage_salaries',
    'view_employees', 'view_salaries'
  )
ON CONFLICT DO NOTHING;

-- Technical Employee
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Technical Employee'
  AND p.name IN (
    'view_own_tasks', 'log_attendance', 'view_schedule', 'request_leave', 'view_equipment'
  )
ON CONFLICT DO NOTHING;

-- Production Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Production Manager'
  AND p.name IN (
    'view_projects', 'view_all_tasks', 'create_tasks',
    'log_attendance', 'view_attendance', 'view_employees', 'view_equipment'
  )
ON CONFLICT DO NOTHING;

-- HR Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'HR Manager'
  AND p.name IN (
    'view_employees', 'manage_employees', 'view_attendance',
    'view_salaries', 'manage_leave', 'view_projects'
  )
ON CONFLICT DO NOTHING;

-- System Administrator
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'System Administrator'
  AND p.name IN (
    'manage_users', 'manage_roles', 'view_audit_logs',
    'system_settings', 'backup', 'view_employees'
  )
ON CONFLICT DO NOTHING;

-- Administration Employee
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Administration Employee'
  AND p.name IN (
    'view_employees', 'log_attendance', 'request_leave', 'view_schedule'
  )
ON CONFLICT DO NOTHING;

-- Employee (basic)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'Employee'
  AND p.name IN (
    'view_own_tasks', 'log_attendance', 'request_leave', 'view_schedule'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. SEED INITIAL USERS
-- Password: ChinarCEO@2026 (for all users - hash generated with bcrypt)
-- NOTE: These passwords should be changed on first login in production!
-- ============================================================================

-- Password hash for all test accounts (password: ChinarCEO@2026)
-- Generated with: bcrypt.hash('ChinarCEO@2026', 10)
DO $$
DECLARE
  pwd_hash TEXT := '$2b$10$7COkhwI9OW61qDPCfWTEmu9Spe2NX/UjiIaYyH8QgdGz/u7C4mGCy';
BEGIN
  -- CEO
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-CEO-001', 'ceo@chinar.tv', pwd_hash, 'Ahmad', 'Khan',
    r.id, d.id, '2023-01-01', 'active'
  FROM roles r, departments d
  WHERE r.name = 'CEO / Founder Manager' AND d.code = 'CEO'
  ON CONFLICT (employee_id) DO NOTHING;

  -- Head of Operations
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-HOO-001', 'hoo@chinar.tv', pwd_hash, 'Wali', 'Khan',
    r.id, d.id, '2023-03-01', 'active'
  FROM roles r, departments d
  WHERE r.name = 'Head of Operations' AND d.code = 'HOO'
  ON CONFLICT (employee_id) DO NOTHING;

  -- Finance Officer
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-FIN-001', 'finance@chinar.tv', pwd_hash, 'Farid', 'Ahmad',
    r.id, d.id, '2023-06-15', 'active'
  FROM roles r, departments d
  WHERE r.name = 'Finance Officer' AND d.code = 'FIN'
  ON CONFLICT (employee_id) DO NOTHING;

  -- Technical Employee
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-TECH-001', 'technical@chinar.tv', pwd_hash, 'Shoaib', 'Ahmad',
    r.id, d.id, '2023-09-01', 'active'
  FROM roles r, departments d
  WHERE r.name = 'Technical Employee' AND d.code = 'TECH'
  ON CONFLICT (employee_id) DO NOTHING;

  -- Production Manager
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-PROD-001', 'production@chinar.tv', pwd_hash, 'Hafizullah', 'Khan',
    r.id, d.id, '2024-02-01', 'active'
  FROM roles r, departments d
  WHERE r.name = 'Production Manager' AND d.code = 'PROD'
  ON CONFLICT (employee_id) DO NOTHING;

  -- HR Manager
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-HR-001', 'hr@chinar.tv', pwd_hash, 'Zainab', 'Ahmad',
    r.id, d.id, '2024-04-10', 'active'
  FROM roles r, departments d
  WHERE r.name = 'HR Manager' AND d.code = 'HR'
  ON CONFLICT (employee_id) DO NOTHING;

  -- System Administrator
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-ADM-001', 'admin@chinar.tv', pwd_hash, 'Mohammad', 'Wali',
    r.id, d.id, '2025-01-01', 'active'
  FROM roles r, departments d
  WHERE r.name = 'System Administrator' AND d.code = 'ADM'
  ON CONFLICT (employee_id) DO NOTHING;

  -- Administration Employee
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-ADMIN-001', 'admin.employee@chinar.tv', pwd_hash, 'Maryam', 'Rahimi',
    r.id, d.id, '2025-01-01', 'active'
  FROM roles r, departments d
  WHERE r.name = 'Administration Employee' AND d.code = 'ADM'
  ON CONFLICT (employee_id) DO NOTHING;

  -- Regular Employee
  INSERT INTO users (employee_id, email, password_hash, first_name, last_name, role_id, department_id, joining_date, status)
  SELECT 'CHN-EMP-001', 'employee@chinar.tv', pwd_hash, 'Ahmad', 'Rahimi',
    r.id, d.id, '2025-01-01', 'active'
  FROM roles r, departments d
  WHERE r.name = 'Employee' AND d.code = 'PROD'
  ON CONFLICT (employee_id) DO NOTHING;
END $$;

-- ============================================================================
-- 6. UPDATE DEPARTMENT HEADS
-- ============================================================================
UPDATE departments d
SET head_user_id = u.id
FROM users u
WHERE d.code = 'CEO' AND u.employee_id = 'CHN-CEO-001';

UPDATE departments d
SET head_user_id = u.id
FROM users u
WHERE d.code = 'HOO' AND u.employee_id = 'CHN-HOO-001';

UPDATE departments d
SET head_user_id = u.id
FROM users u
WHERE d.code = 'FIN' AND u.employee_id = 'CHN-FIN-001';

UPDATE departments d
SET head_user_id = u.id
FROM users u
WHERE d.code = 'TECH' AND u.employee_id = 'CHN-TECH-001';

UPDATE departments d
SET head_user_id = u.id
FROM users u
WHERE d.code = 'PROD' AND u.employee_id = 'CHN-PROD-001';

UPDATE departments d
SET head_user_id = u.id
FROM users u
WHERE d.code = 'HR' AND u.employee_id = 'CHN-HR-001';

UPDATE departments d
SET head_user_id = u.id
FROM users u
WHERE d.code = 'ADM' AND u.employee_id = 'CHN-ADM-001';
