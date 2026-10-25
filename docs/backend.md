# CMCS Backend Architecture & Database Design

## Executive Summary

This document outlines the complete backend architecture for the Chinar Media Company System (CMCS) - a comprehensive construction management and media production system with role-based access control for CEO, Head of Operations, Finance, Technical, Production, HR, Administration, and Employee roles.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Architecture](#api-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Business Logic & Workflows](#business-logic--workflows)
7. [Implementation Roadmap](#implementation-roadmap)

---

## System Overview

### Core Modules

1. **User Management** - Authentication, roles, permissions, departments
2. **Project Management** - Projects, approvals, assignments, calendar
3. **Finance Management** - Quotations, invoices, payments, expenses, salaries, equipment rental
4. **Employee Management** - Attendance, tasks, schedules, leave requests
5. **Operations Management** - Task assignments, resource allocation
6. **Administration** - System settings, audit logs, documents, backups
7. **Notifications** - Real-time alerts and approval requests

### User Roles & Capabilities

| Role | Key Permissions |
|------|----------------|
| **CEO** | View all, approve projects, approve finance, final authority |
| **Head of Operations (HOO)** | Create projects, manage tasks, assign resources |
| **Finance Officer** | Create/manage quotations, invoices, payments, expenses, salaries |
| **Technical Employee** | View assigned tasks, log attendance, equipment tracking |
| **Production Manager** | Manage production tasks, team attendance, project oversight |
| **HR Manager** | Manage employees, salaries, leave, attendance |
| **System Administrator** | User management, roles, system settings, audit logs, backups |
| **Administration Employee** | Documents, assets, office maintenance, requests |
| **Employee** | View own tasks, attendance, basic access |

---

## Technology Stack

### Backend
- **Runtime**: Node.js with Next.js 16.4.1 API Routes
- **Language**: TypeScript
- **Database**: PostgreSQL 18.6 (Neon serverless)
- **ORM**: Recommended: Drizzle ORM or Prisma
- **Connection Pooling**: PgBouncer (via Neon)
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schemas

### Infrastructure
- **Hosting**: Next.js App Router (Server Components + API Routes)
- **Database**: Neon Postgres (pooled connections for serverless)
- **File Storage**: (To be determined - S3, Cloudinary, or Neon Object Storage)
- **Environment**: `.env.local` with DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (migrations)

---

## Database Schema

### Overview
The database follows a normalized relational design with:
- **24 core tables** covering all business domains
- **Foreign key constraints** for referential integrity
- **Enum types** for status fields
- **Timestamp tracking** (created_at, updated_at)
- **Soft deletes** where appropriate (deleted_at)

---

### Core Tables

#### 1. Users & Authentication

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(20) UNIQUE NOT NULL, -- CHN-XXX-001 format
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  phone VARCHAR(20),
  photo_url TEXT,
  
  role_id UUID NOT NULL REFERENCES roles(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  joining_date DATE NOT NULL,
  employment_type VARCHAR(20) DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract')),
  
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT employee_id_format CHECK (employee_id ~ '^CHN-[A-Z]+-[0-9]{3}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  is_system_role BOOLEAN DEFAULT false, -- Cannot be deleted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'view_all', 'approve_projects'
  description TEXT,
  category VARCHAR(50), -- e.g., 'projects', 'finance', 'users'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'TECH', 'FIN'
  head_user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session tokens (for JWT refresh)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

---

#### 2. Projects

```sql
-- Projects table
CREATE TABLE projects (
  id VARCHAR(20) PRIMARY KEY, -- PRJ-2026-0042 format
  name VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  status VARCHAR(50) NOT NULL DEFAULT 'Upcoming' 
    CHECK (status IN ('Upcoming', 'In Progress', 'Completed', 'On Hold', 'Rejected', 'Pending approval')),
  
  department_id UUID NOT NULL REFERENCES departments(id),
  budget DECIMAL(15,2) NOT NULL CHECK (budget >= 0),
  
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  CONSTRAINT project_dates CHECK (end_date >= start_date),
  CONSTRAINT project_id_format CHECK (id ~ '^PRJ-[0-9]{4}-[0-9]{4}$')
);

CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_projects_owner ON projects(owner_user_id);
CREATE INDEX idx_projects_department ON projects(department_id);

-- Project approvals (approval workflow history)
CREATE TABLE project_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Pending approval', 'Approved', 'Rejected')),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_approvals_project ON project_approvals(project_id);
CREATE INDEX idx_project_approvals_status ON project_approvals(status);

-- Project team assignments
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100), -- e.g., 'Director of Photography', 'Camera Operator'
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_user ON project_assignments(user_id);
```

---

#### 3. Finance - Quotations

```sql
-- Quotations table
CREATE TABLE quotations (
  id VARCHAR(20) PRIMARY KEY, -- QTN-2026-014 format
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  vendor VARCHAR(255) NOT NULL,
  
  quotation_date DATE NOT NULL,
  validity_date DATE,
  
  customer_details TEXT,
  contact_person VARCHAR(255),
  payment_terms TEXT,
  delivery_time VARCHAR(100),
  warranty TEXT,
  
  subtotal DECIMAL(15,2) NOT NULL CHECK (subtotal >= 0),
  tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  tax_amount DECIMAL(15,2) DEFAULT 0 CHECK (tax_amount >= 0),
  discount DECIMAL(15,2) DEFAULT 0 CHECK (discount >= 0),
  discount_type VARCHAR(20) DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
  media_rights DECIMAL(15,2) DEFAULT 0 CHECK (media_rights >= 0),
  total DECIMAL(15,2) NOT NULL CHECK (total >= 0),
  
  status VARCHAR(50) DEFAULT 'Draft' 
    CHECK (status IN ('Draft', 'Pending approval', 'Approved', 'Rejected', 'Revised')),
  
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP,
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT quotation_id_format CHECK (id ~ '^QTN-[0-9]{4}-[0-9]{3}$')
);

CREATE INDEX idx_quotations_project ON quotations(project_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_dates ON quotations(quotation_date, validity_date);

-- Quotation items (line items)
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id VARCHAR(20) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  
  item_no VARCHAR(20),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  description TEXT NOT NULL,
  
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  days INTEGER DEFAULT 1 CHECK (days > 0),
  unit_price DECIMAL(15,2) NOT NULL CHECK (unit_price >= 0),
  tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  line_total DECIMAL(15,2) GENERATED ALWAYS AS (quantity * days * unit_price) STORED,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);

-- Quotation history (approval workflow)
CREATE TABLE quotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id VARCHAR(20) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotation_history_quotation ON quotation_history(quotation_id);
```

---

#### 4. Finance - Invoices

```sql
-- Invoices table
CREATE TABLE invoices (
  id VARCHAR(20) PRIMARY KEY, -- INV-2026-024 format
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  quotation_id VARCHAR(20) REFERENCES quotations(id),
  
  invoice_date DATE NOT NULL,
  due_date DATE,
  
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  
  status VARCHAR(50) DEFAULT 'Draft' 
    CHECK (status IN ('Draft', 'Pending approval', 'Approved', 'Rejected', 'Revised')),
  generation_status VARCHAR(50) DEFAULT 'Not generated' 
    CHECK (generation_status IN ('Not generated', 'Generated', 'Sent')),
  payment_status VARCHAR(50) DEFAULT 'Not issued' 
    CHECK (payment_status IN ('Not issued', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue')),
  
  submitted_by UUID REFERENCES users(id),
  submitted_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  revision_request TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT invoice_id_format CHECK (id ~ '^INV-[0-9]{4}-[0-9]{3}$')
);

CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_quotation ON invoices(quotation_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_dates ON invoices(invoice_date, due_date);

-- Invoice history
CREATE TABLE invoice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id VARCHAR(20) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_history_invoice ON invoice_history(invoice_id);
```

---

#### 5. Finance - Payments

```sql
-- Payments table
CREATE TABLE payments (
  id VARCHAR(20) PRIMARY KEY, -- PAY-2026-017 format
  invoice_id VARCHAR(20) REFERENCES invoices(id),
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  quotation_id VARCHAR(20) REFERENCES quotations(id),
  
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  amount_paid DECIMAL(15,2) DEFAULT 0 CHECK (amount_paid >= 0),
  
  payment_method VARCHAR(50),
  payment_date DATE,
  reference_number VARCHAR(100),
  
  status VARCHAR(50) DEFAULT 'Unpaid' 
    CHECK (status IN ('Unpaid', 'Partially Paid', 'Paid', 'Refunded')),
  
  notes TEXT,
  
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT payment_id_format CHECK (id ~ '^PAY-[0-9]{4}-[0-9]{3}$'),
  CONSTRAINT payment_amount_check CHECK (amount_paid <= amount)
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Payment history
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id VARCHAR(20) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  actor_user_id UUID NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_history_payment ON payment_history(payment_id);
```

---

#### 6. Finance - Expenses

```sql
-- Expenses table
CREATE TABLE expenses (
  id VARCHAR(20) PRIMARY KEY, -- EXP-2026-001 format
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL 
    CHECK (category IN ('Travel', 'Transportation', 'Equipment Rental', 'Production', 
                        'Technical', 'Food & Accommodation', 'Office Supplies', 'Staff', 'Other')),
  description TEXT,
  
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL,
  vendor VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50),
  
  receipt_url TEXT,
  receipt_name VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'Draft' 
    CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected', 'Paid')),
  
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT expense_id_format CHECK (id ~ '^EXP-[0-9]{4}-[0-9]{3}$')
);

CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_submitted_by ON expenses(submitted_by);

-- Expense history
CREATE TABLE expense_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id VARCHAR(20) NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_history_expense ON expense_history(expense_id);
```

---

#### 7. Finance - Salaries

```sql
-- Salaries table
CREATE TABLE salaries (
  id VARCHAR(20) PRIMARY KEY, -- SAL-001 format
  employee_user_id UUID NOT NULL REFERENCES users(id),
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  
  role VARCHAR(100), -- e.g., 'Director of Photography'
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  
  payment_status VARCHAR(50) DEFAULT 'Unpaid' 
    CHECK (payment_status IN ('Unpaid', 'Partially Paid', 'Paid')),
  payment_date DATE,
  paid_amount DECIMAL(15,2) DEFAULT 0 CHECK (paid_amount >= 0),
  
  notes TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT salary_id_format CHECK (id ~ '^SAL-[0-9]{3}$'),
  CONSTRAINT salary_paid_check CHECK (paid_amount <= amount)
);

CREATE INDEX idx_salaries_employee ON salaries(employee_user_id);
CREATE INDEX idx_salaries_project ON salaries(project_id);
CREATE INDEX idx_salaries_status ON salaries(payment_status);
CREATE INDEX idx_salaries_date ON salaries(payment_date);

-- Salary history
CREATE TABLE salary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_id VARCHAR(20) NOT NULL REFERENCES salaries(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- e.g., 'Payment Completed', 'Partial Payment'
  amount DECIMAL(15,2),
  actor_user_id UUID NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salary_history_salary ON salary_history(salary_id);
```

---

#### 8. Finance - Equipment Rental

```sql
-- Equipment rentals table
CREATE TABLE equipment_rentals (
  id VARCHAR(20) PRIMARY KEY, -- EQR-001 format
  equipment_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  rental_provider VARCHAR(255) NOT NULL,
  
  rental_cost DECIMAL(15,2) NOT NULL CHECK (rental_cost >= 0),
  rental_start_date DATE NOT NULL,
  rental_end_date DATE NOT NULL,
  
  payment_status VARCHAR(50) DEFAULT 'Unpaid' 
    CHECK (payment_status IN ('Unpaid', 'Partially Paid', 'Paid')),
  paid_amount DECIMAL(15,2) DEFAULT 0 CHECK (paid_amount >= 0),
  
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT equipment_rental_id_format CHECK (id ~ '^EQR-[0-9]{3}$'),
  CONSTRAINT equipment_rental_dates CHECK (rental_end_date >= rental_start_date),
  CONSTRAINT equipment_rental_paid_check CHECK (paid_amount <= rental_cost)
);

CREATE INDEX idx_equipment_rentals_project ON equipment_rentals(project_id);
CREATE INDEX idx_equipment_rentals_status ON equipment_rentals(payment_status);
CREATE INDEX idx_equipment_rentals_dates ON equipment_rentals(rental_start_date, rental_end_date);

-- Equipment rental history
CREATE TABLE equipment_rental_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_rental_id VARCHAR(20) NOT NULL REFERENCES equipment_rentals(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2),
  actor_user_id UUID NOT NULL REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_rental_history_rental ON equipment_rental_history(equipment_rental_id);
```

---

#### 9. Tasks

```sql
-- Tasks table
CREATE TABLE tasks (
  id VARCHAR(20) PRIMARY KEY, -- TSK-TECH-001 or TSK-OPS-001 format
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  assigned_to UUID NOT NULL REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending' 
    CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority VARCHAR(20) DEFAULT 'Medium' 
    CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  CONSTRAINT task_id_format CHECK (id ~ '^TSK-[A-Z]+-[0-9]{3}$')
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

---

#### 10. Equipment & Resources

```sql
-- Equipment table
CREATE TABLE equipment (
  id VARCHAR(20) PRIMARY KEY, -- EQ-TECH-014 format
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100),
  
  condition VARCHAR(50) DEFAULT 'Good' 
    CHECK (condition IN ('Good', 'Fair', 'Needs service', 'Out of service')),
  
  purchase_date DATE,
  purchase_cost DECIMAL(15,2),
  
  current_location VARCHAR(255),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT equipment_id_format CHECK (id ~ '^EQ-[A-Z]+-[0-9]{3}$')
);

CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_condition ON equipment(condition);

-- Equipment assignments
CREATE TABLE equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id VARCHAR(20) NOT NULL REFERENCES equipment(id),
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  assigned_to UUID NOT NULL REFERENCES users(id),
  
  assigned_date DATE NOT NULL,
  return_date DATE,
  returned_date DATE,
  
  condition_on_return VARCHAR(50),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_assignments_equipment ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_project ON equipment_assignments(project_id);
CREATE INDEX idx_equipment_assignments_user ON equipment_assignments(assigned_to);
CREATE INDEX idx_equipment_assignments_dates ON equipment_assignments(assigned_date, return_date);
```

---

#### 11. Attendance

```sql
-- Attendance records
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL 
    CHECK (status IN ('Present', 'Absent', 'Late', 'Leave', 'Holiday')),
  check_in_time TIME,
  check_out_time TIME,
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, attendance_date)
);

CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_user_date_range ON attendance(user_id, attendance_date);
```

---

#### 12. Leave Requests

```sql
-- Leave requests table
CREATE TABLE leave_requests (
  id VARCHAR(20) PRIMARY KEY, -- LVE-2026-001 format
  user_id UUID NOT NULL REFERENCES users(id),
  
  leave_type VARCHAR(50) NOT NULL 
    CHECK (leave_type IN ('Annual Leave', 'Sick Leave', 'Unpaid Leave', 'Emergency Leave', 'Other')),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  
  reason TEXT NOT NULL,
  
  status VARCHAR(50) DEFAULT 'Pending' 
    CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT leave_id_format CHECK (id ~ '^LVE-[0-9]{4}-[0-9]{3}$'),
  CONSTRAINT leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
```

---

#### 13. Notifications

```sql
-- Notifications table
CREATE TABLE notifications (
  id VARCHAR(20) PRIMARY KEY, -- NTF-001 format or NTF-timestamp
  
  title VARCHAR(255) NOT NULL,
  detail TEXT NOT NULL,
  kind VARCHAR(50) NOT NULL, -- e.g., 'Project approval', 'Invoice', 'Quotation'
  
  recipient_role VARCHAR(50), -- Role name or 'all'
  recipient_user_id UUID REFERENCES users(id), -- Optional: specific user
  
  link VARCHAR(500), -- Optional: link to related resource
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT notification_recipient CHECK (
    (recipient_role IS NOT NULL) OR (recipient_user_id IS NOT NULL)
  )
);

CREATE INDEX idx_notifications_role ON notifications(recipient_role) WHERE recipient_role IS NOT NULL;
CREATE INDEX idx_notifications_user ON notifications(recipient_user_id) WHERE recipient_user_id IS NOT NULL;
CREATE INDEX idx_notifications_read ON notifications(is_read, created_at);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

#### 14. Documents & Files

```sql
-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- MIME type
  file_size_bytes BIGINT,
  
  category VARCHAR(100), -- e.g., 'Contract', 'Invoice', 'Receipt', 'Report'
  
  project_id VARCHAR(20) REFERENCES projects(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  
  is_template BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_documents_category ON documents(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_project ON documents(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_templates ON documents(is_template) WHERE is_template = true AND deleted_at IS NULL;
```

---

#### 15. Audit Logs

```sql
-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  actor_user_id UUID REFERENCES users(id), -- NULL if system action
  actor_name VARCHAR(255), -- Denormalized for deleted users
  
  action VARCHAR(100) NOT NULL, -- e.g., 'Approved project', 'Created user account'
  target_type VARCHAR(50), -- e.g., 'project', 'user', 'invoice'
  target_id VARCHAR(100),
  target_name VARCHAR(255),
  
  ip_address INET,
  user_agent TEXT,
  
  severity VARCHAR(20) DEFAULT 'info' 
    CHECK (severity IN ('info', 'warning', 'critical')),
  
  details JSONB, -- Additional structured data
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address);
```

---

#### 16. System Settings

```sql
-- System settings table (key-value store)
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  value_type VARCHAR(20) DEFAULT 'string' 
    CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  category VARCHAR(50), -- e.g., 'general', 'email', 'security'
  is_public BOOLEAN DEFAULT false, -- Can be read by non-admins
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_category ON system_settings(category);
```

---

### Database Views & Aggregates

```sql
-- Project summary view
CREATE VIEW v_project_summary AS
SELECT 
  p.id,
  p.name,
  p.client,
  p.status,
  p.progress,
  p.budget,
  p.start_date,
  p.end_date,
  d.name as department,
  u.full_name as owner_name,
  COUNT(DISTINCT pa.user_id) as team_size,
  COUNT(DISTINCT t.id) as task_count,
  COALESCE(SUM(e.amount), 0) as total_expenses,
  COALESCE(SUM(CASE WHEN i.payment_status = 'Paid' THEN i.amount ELSE 0 END), 0) as revenue
FROM projects p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN users u ON p.owner_user_id = u.id
LEFT JOIN project_assignments pa ON p.id = pa.project_id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN expenses e ON p.id = e.project_id AND e.status = 'Approved'
LEFT JOIN invoices i ON p.id = i.project_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name, p.client, p.status, p.progress, p.budget, 
         p.start_date, p.end_date, d.name, u.full_name;

-- User workload view
CREATE VIEW v_user_workload AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.employee_id,
  d.name as department,
  r.name as role,
  COUNT(DISTINCT pa.project_id) as active_projects,
  COUNT(DISTINCT t.id) as active_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'In Progress' THEN t.id END) as in_progress_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'Pending' THEN t.id END) as pending_tasks
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN project_assignments pa ON u.id = pa.user_id
LEFT JOIN tasks t ON u.id = t.assigned_to AND t.status IN ('Pending', 'In Progress')
WHERE u.deleted_at IS NULL AND u.status = 'active'
GROUP BY u.id, u.full_name, u.employee_id, d.name, r.name;

-- Finance summary view
CREATE VIEW v_finance_summary AS
SELECT 
  DATE_TRUNC('month', COALESCE(i.invoice_date, q.quotation_date)) as month,
  COUNT(DISTINCT q.id) as quotation_count,
  COUNT(DISTINCT i.id) as invoice_count,
  COALESCE(SUM(q.total), 0) as total_quoted,
  COALESCE(SUM(i.amount), 0) as total_invoiced,
  COALESCE(SUM(CASE WHEN i.payment_status = 'Paid' THEN i.amount ELSE 0 END), 0) as total_paid,
  COALESCE(SUM(e.amount), 0) as total_expenses
FROM quotations q
FULL OUTER JOIN invoices i ON q.id = i.quotation_id
FULL OUTER JOIN expenses e ON DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', COALESCE(i.invoice_date, q.quotation_date))
GROUP BY DATE_TRUNC('month', COALESCE(i.invoice_date, q.quotation_date));
```

---

## API Architecture

### API Route Structure

```
/api
├── /auth
│   ├── /login (POST)
│   ├── /logout (POST)
│   ├── /refresh (POST)
│   └── /me (GET)
│
├── /users
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   ├── /[id]/workload (GET)
│   └── /[id]/attendance (GET)
│
├── /roles
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   └── /[id]/permissions (GET, PATCH)
│
├── /departments
│   ├── / (GET, POST)
│   └── /[id] (GET, PATCH, DELETE)
│
├── /projects
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   ├── /[id]/approve (POST)
│   ├── /[id]/assignments (GET, POST, DELETE)
│   ├── /[id]/tasks (GET)
│   ├── /[id]/expenses (GET)
│   ├── /[id]/quotations (GET)
│   ├── /[id]/invoices (GET)
│   └── /calendar (GET)
│
├── /tasks
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   └── /my-tasks (GET)
│
├── /quotations
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   ├── /[id]/approve (POST)
│   ├── /[id]/reject (POST)
│   └── /[id]/items (GET, POST, PATCH, DELETE)
│
├── /invoices
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   ├── /[id]/approve (POST)
│   ├── /[id]/reject (POST)
│   └── /[id]/revision (POST)
│
├── /payments
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH)
│   └── /[id]/record (POST)
│
├── /expenses
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   ├── /[id]/approve (POST)
│   └── /[id]/reject (POST)
│
├── /salaries
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   └── /[id]/payment (POST)
│
├── /equipment
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   ├── /rentals (GET, POST)
│   ├── /rentals/[id] (GET, PATCH, DELETE)
│   └── /assignments (GET, POST, PATCH)
│
├── /attendance
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH)
│   ├── /my-attendance (GET)
│   └── /summary (GET)
│
├── /leave
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH, DELETE)
│   ├── /[id]/approve (POST)
│   └── /my-leave (GET)
│
├── /notifications
│   ├── / (GET, POST)
│   ├── /[id] (GET, PATCH)
│   ├── /[id]/read (POST)
│   └── /mark-all-read (POST)
│
├── /documents
│   ├── / (GET, POST)
│   ├── /[id] (GET, DELETE)
│   ├── /upload (POST)
│   └── /templates (GET)
│
├── /audit-logs
│   ├── / (GET)
│   └── /export (GET)
│
├── /dashboard
│   ├── /stats (GET)
│   ├── /ceo (GET)
│   └── /finance (GET)
│
└── /reports
    ├── /projects (GET)
    ├── /finance (GET)
    ├── /employees (GET)
    └── /export (POST)
```

---

### API Response Formats

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## Authentication & Authorization

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  employeeId: string;
  email: string;
  roleId: string;
  roleName: string;
  departmentId: string;
  permissions: string[];
  iat: number;
  exp: number;
}
```

### Authentication Flow

1. **Login**: `POST /api/auth/login`
   - Input: email, password
   - Validate credentials (bcrypt comparison)
   - Generate access token (15min) + refresh token (7d)
   - Update last_login timestamp
   - Create audit log entry
   - Return tokens + user data

2. **Token Refresh**: `POST /api/auth/refresh`
   - Input: refresh token
   - Validate refresh token from database
   - Generate new access token
   - Return new access token

3. **Logout**: `POST /api/auth/logout`
   - Invalidate refresh token
   - Create audit log entry

### Authorization Middleware

```typescript
// Example middleware structure
export async function requireAuth(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new UnauthorizedError();
  
  const payload = verifyJWT(token);
  return payload;
}

export async function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    const user = await requireAuth(req);
    if (!user.permissions.includes(permission)) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
    return user;
  };
}
```

### Permission Matrix

| Permission | CEO | HOO | Finance | Tech | Prod | HR | Admin |
|------------|-----|-----|---------|------|------|----|----|
| view_all | ✓ | ✓ | ✓ | - | - | - | ✓ |
| create_projects | ✓ | ✓ | - | - | - | - | - |
| approve_projects | ✓ | - | - | - | - | - | - |
| create_quotations | - | - | ✓ | - | - | - | - |
| approve_quotations | ✓ | - | - | - | - | - | - |
| create_invoices | - | - | ✓ | - | - | - | - |
| approve_invoices | ✓ | - | - | - | - | - | - |
| manage_expenses | - | - | ✓ | - | - | - | - |
| approve_expenses | ✓ | - | - | - | - | - | - |
| manage_salaries | - | - | ✓ | - | - | ✓ | - |
| manage_users | - | - | - | - | - | - | ✓ |
| view_audit_logs | ✓ | - | - | - | - | - | ✓ |
| system_settings | - | - | - | - | - | - | ✓ |

---

## Business Logic & Workflows

### 1. Project Approval Workflow

```
[HOO creates project] 
  → status = 'Pending approval'
  → notification to CEO
  
[CEO reviews]
  → Approve: status = 'Upcoming', notification to HOO
  → Reject: status = 'Rejected', notification to HOO with comment
```

### 2. Quotation Approval Workflow

```
[Finance creates quotation]
  → status = 'Draft'
  
[Finance submits quotation]
  → status = 'Pending approval'
  → notifications to CEO & HOO
  
[CEO/HOO review]
  → Approve: status = 'Approved', can generate invoice
  → Reject: status = 'Rejected', notification to Finance with comment
  → Request revision: status = 'Revised', Finance can edit
```

### 3. Invoice Approval Workflow

```
[Finance creates invoice from approved quotation]
  → status = 'Draft'
  → generation_status = 'Not generated'
  → payment_status = 'Not issued'
  
[Finance submits invoice]
  → status = 'Pending approval'
  → generation_status = 'Generated'
  → notification to CEO
  
[CEO reviews]
  → Approve: status = 'Approved', payment_status = 'Unpaid'
  → Reject: status = 'Rejected'
  → Request revision: status = 'Revised', Finance can edit
```

### 4. Expense Approval Workflow

```
[User creates expense]
  → status = 'Draft'
  
[User submits expense]
  → status = 'Pending Approval'
  → notification to CEO/Finance
  
[Approver reviews]
  → Approve: status = 'Approved', can process payment
  → Reject: status = 'Rejected', notification with reason
  
[Finance processes payment]
  → status = 'Paid'
```

### 5. Leave Request Workflow

```
[Employee creates leave request]
  → status = 'Pending'
  → notification to HR/Manager
  
[Approver reviews]
  → Approve: status = 'Approved', create attendance records
  → Reject: status = 'Rejected', notification with reason
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Database Setup**
- [ ] Create all database tables with migrations
- [ ] Seed initial data (roles, permissions, departments, admin user)
- [ ] Set up database views
- [ ] Test all foreign key constraints

**Authentication**
- [ ] Implement JWT authentication
- [ ] Create auth API routes (login, logout, refresh, me)
- [ ] Add bcrypt password hashing
- [ ] Implement auth middleware
- [ ] Add session management

**Core User Management**
- [ ] User CRUD API routes
- [ ] Role & permission management
- [ ] Department management
- [ ] Authorization middleware

### Phase 2: Projects & Tasks (Week 3-4)

**Projects**
- [ ] Project CRUD API routes
- [ ] Project approval workflow
- [ ] Project assignments
- [ ] Project calendar API
- [ ] Project statistics/dashboard

**Tasks**
- [ ] Task CRUD API routes
- [ ] Task assignment logic
- [ ] Task status updates
- [ ] My tasks endpoint (filtered by user)

### Phase 3: Finance Module (Week 5-7)

**Quotations**
- [ ] Quotation CRUD API routes
- [ ] Quotation items management
- [ ] Quotation approval workflow
- [ ] Quotation history tracking

**Invoices**
- [ ] Invoice CRUD API routes
- [ ] Invoice approval workflow
- [ ] Invoice revision workflow
- [ ] Invoice history tracking

**Payments**
- [ ] Payment CRUD API routes
- [ ] Payment recording
- [ ] Payment history
- [ ] Payment status updates

**Expenses**
- [ ] Expense CRUD API routes
- [ ] Expense approval workflow
- [ ] Receipt file upload
- [ ] Expense history tracking

**Salaries**
- [ ] Salary CRUD API routes
- [ ] Salary payment tracking
- [ ] Salary history

**Equipment Rental**
- [ ] Equipment rental CRUD API routes
- [ ] Rental payment tracking
- [ ] Rental history

### Phase 4: Employee Management (Week 8-9)

**Attendance**
- [ ] Attendance CRUD API routes
- [ ] Daily attendance recording
- [ ] Attendance summary/reports
- [ ] My attendance endpoint

**Leave Management**
- [ ] Leave request CRUD API routes
- [ ] Leave approval workflow
- [ ] Leave balance calculations
- [ ] My leave endpoint

### Phase 5: System Features (Week 10-11)

**Notifications**
- [ ] Notification CRUD API routes
- [ ] Real-time notification system
- [ ] Mark as read functionality
- [ ] Role-based notification filtering

**Documents**
- [ ] Document CRUD API routes
- [ ] File upload handling
- [ ] Document categorization
- [ ] Template management

**Equipment**
- [ ] Equipment CRUD API routes
- [ ] Equipment assignment tracking
- [ ] Equipment condition tracking

**Audit Logs**
- [ ] Audit log creation (automatic)
- [ ] Audit log API routes
- [ ] Audit log filtering & search
- [ ] Audit log export

### Phase 6: Dashboards & Reports (Week 12-13)

**Dashboards**
- [ ] CEO dashboard API
- [ ] Finance dashboard API
- [ ] Project statistics API
- [ ] Employee workload API

**Reports**
- [ ] Project reports
- [ ] Finance reports
- [ ] Employee reports
- [ ] Export functionality (PDF/Excel)

### Phase 7: Integration & Testing (Week 14-15)

**Frontend Integration**
- [ ] Replace all dummy data with API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add optimistic updates where appropriate

**Testing**
- [ ] Unit tests for business logic
- [ ] Integration tests for API routes
- [ ] End-to-end tests for critical flows
- [ ] Performance testing

**Documentation**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] User manual

### Phase 8: Optimization & Launch (Week 16)

**Performance**
- [ ] Query optimization
- [ ] Caching strategy (Redis)
- [ ] Image optimization
- [ ] API rate limiting

**Security**
- [ ] Security audit
- [ ] Input sanitization review
- [ ] SQL injection prevention
- [ ] XSS prevention

**Deployment**
- [ ] Production database setup
- [ ] Environment configuration
- [ ] Database migrations on production
- [ ] Monitoring setup
- [ ] Backup automation

---

## Technical Considerations

### 1. ID Generation Strategy

**Projects, Invoices, Quotations**: Use auto-incrementing sequences
```typescript
// Example: Generate next project ID
async function generateProjectId() {
  const year = new Date().getFullYear();
  const result = await db.query(
    'SELECT MAX(id) as max_id FROM projects WHERE id LIKE $1',
    [`PRJ-${year}-%`]
  );
  const lastNum = result.rows[0]?.max_id 
    ? parseInt(result.rows[0].max_id.split('-')[2]) 
    : 0;
  const nextNum = String(lastNum + 1).padStart(4, '0');
  return `PRJ-${year}-${nextNum}`;
}
```

### 2. Connection Pooling

Use pooled connections for all API routes:
```typescript
import { db } from '@/lib/db'; // Uses DATABASE_URL (pooled)

// In API route
export async function GET() {
  const client = await db.connect();
  try {
    const result = await client.query('SELECT * FROM projects');
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
```

Use direct connection for migrations:
```bash
DATABASE_URL=$DATABASE_URL_UNPOOLED npx drizzle-kit push
```

### 3. Transaction Handling

For multi-table operations:
```typescript
async function createQuotationWithItems(quotationData, items) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const quotation = await client.query(
      'INSERT INTO quotations (...) VALUES (...) RETURNING *',
      [...]
    );
    
    for (const item of items) {
      await client.query(
        'INSERT INTO quotation_items (...) VALUES (...)',
        [..., quotation.rows[0].id]
      );
    }
    
    await client.query('COMMIT');
    return quotation.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 4. Soft Deletes

Implement soft deletes for critical data:
```typescript
// Instead of DELETE
UPDATE users SET deleted_at = NOW() WHERE id = $1

// Queries
SELECT * FROM users WHERE deleted_at IS NULL
```

### 5. Audit Logging

Automatically log critical actions:
```typescript
async function logAudit(action: string, userId: string, target: any, req: NextRequest) {
  await db.query(
    `INSERT INTO audit_logs (actor_user_id, actor_name, action, target_type, 
     target_id, target_name, ip_address, user_agent, severity) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [userId, userName, action, targetType, targetId, targetName, 
     req.headers.get('x-forwarded-for'), req.headers.get('user-agent'), 'info']
  );
}
```

### 6. File Upload Strategy

**Options:**
1. **Local storage** (development only)
2. **Neon Object Storage** (if available)
3. **AWS S3** or **Cloudinary**

**Recommendation**: Cloudinary for easy image optimization

```typescript
// Example file upload handler
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  // Upload to Cloudinary/S3
  const uploadResult = await uploadFile(file);
  
  // Store metadata in database
  await db.query(
    'INSERT INTO documents (name, file_url, file_type, uploaded_by) VALUES ($1, $2, $3, $4)',
    [file.name, uploadResult.url, file.type, userId]
  );
  
  return NextResponse.json({ url: uploadResult.url });
}
```

### 7. Real-time Updates

For notifications, consider:
1. **Polling** (simple, no websockets needed)
2. **Server-Sent Events** (one-way, good for notifications)
3. **WebSockets** (full real-time, more complex)

**Recommendation**: Start with polling, upgrade to SSE if needed

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...pooler...  # Pooled (for app)
DATABASE_URL_UNPOOLED=postgresql://...  # Direct (for migrations)

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# File Upload
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (optional, for notifications)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Migration Strategy

### Initial Migration

1. Run all table creation scripts in order
2. Seed initial data:
   - Roles and permissions
   - Departments
   - Admin user account
   - System settings

### Sample Seed Script

```sql
-- Seed roles
INSERT INTO roles (id, name, description, is_system_role) VALUES
  (gen_random_uuid(), 'CEO / Founder Manager', 'Full system access', true),
  (gen_random_uuid(), 'Head of Operations', 'Operational management', true),
  (gen_random_uuid(), 'Finance Officer', 'Financial management', true);

-- Seed departments
INSERT INTO departments (id, name, code) VALUES
  (gen_random_uuid(), 'Executive', 'CEO'),
  (gen_random_uuid(), 'Operations', 'HOO'),
  (gen_random_uuid(), 'Finance', 'FIN');

-- Seed admin user (password: ChinarAdmin@2026)
INSERT INTO users (employee_id, email, password_hash, first_name, last_name, 
                   role_id, department_id, joining_date, status)
SELECT 
  'CHN-ADM-001',
  'admin@chinar.tv',
  '$2b$10$...', -- bcrypt hash
  'Mohammad',
  'Wali',
  r.id,
  d.id,
  '2025-01-01',
  'active'
FROM roles r, departments d
WHERE r.name = 'System Administrator' 
  AND d.code = 'ADM';
```

---

## Testing Strategy

### Unit Tests
- Database models
- Business logic functions
- Utility functions
- Validation schemas

### Integration Tests
- API endpoints
- Authentication flow
- Authorization checks
- Approval workflows

### E2E Tests (Critical Paths)
1. User login → View dashboard
2. HOO creates project → CEO approves
3. Finance creates quotation → CEO approves → Generate invoice
4. Employee submits expense → CEO approves
5. Employee requests leave → HR approves

---

## Performance Optimization

### Database Indexes
- Already defined in schema
- Monitor slow queries with `pg_stat_statements`
- Add composite indexes as needed

### Query Optimization
- Use database views for complex aggregations
- Implement pagination on all list endpoints
- Use `SELECT` only needed columns
- Avoid N+1 queries (use JOINs or batch queries)

### Caching Strategy (Phase 2)
- Cache frequently accessed data (roles, permissions, departments)
- Use Redis for session storage
- Cache dashboard statistics (5-minute TTL)

---

## Next Steps

1. **Review & Approve** this backend design
2. **Create database migration scripts** from the schemas above
3. **Run migrations** on Neon database
4. **Start Phase 1** implementation (Authentication & User Management)
5. **Create API route handlers** following the structure
6. **Test each module** before moving to next phase

---

## Questions for Review

1. **File Upload**: Should we use Neon Object Storage, S3, or Cloudinary?
2. **Real-time**: Is polling sufficient for notifications, or do we need WebSockets?
3. **Reporting**: Do we need PDF generation (e.g., for invoices), and if so, which library?
4. **Email**: Should the system send email notifications?
5. **Multi-currency**: Does the system need multi-currency support?
6. **Localization**: Should we support multiple languages (English, Dari/Pashto)?

---

**Document Version**: 1.0  
**Last Updated**: October 25, 2026  
**Next Review**: After Phase 1 completion
