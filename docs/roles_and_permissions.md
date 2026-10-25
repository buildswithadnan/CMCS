# CMCS Roles and Permissions Guide

## Test User Accounts

All test accounts use the same password: **`ChinarCEO@2026`**

> ⚠️ **Security Note**: These passwords should be changed on first login in production!

---

## 1. CEO / Founder Manager

**Email**: `ceo@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-CEO-001  
**User**: Ahmad Khan  
**Department**: Executive  
**Color**: Purple (#7c3aed)

### Permissions (ALL)
- ✅ **Full System Access** - All 35 permissions
- Complete control over all modules
- Final approval authority on all matters

---

## 2. Head of Operations

**Email**: `hoo@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-HOO-001  
**User**: Wali Khan  
**Department**: Operations  
**Color**: Blue (#2563eb)

### Permissions (11)
**General**
- ✅ view_all - View all system data

**Projects**
- ✅ view_projects - View projects
- ✅ create_projects - Create new projects
- ✅ edit_projects - Edit projects

**Finance**
- ✅ view_finance - View financial data

**Tasks**
- ✅ view_all_tasks - View all tasks
- ✅ create_tasks - Create tasks
- ✅ manage_tasks - Manage task assignments

**Employees**
- ✅ view_employees - View employee data
- ✅ view_attendance - View attendance records

**Equipment**
- ✅ view_equipment - View equipment

---

## 3. Finance Officer

**Email**: `finance@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-FIN-001  
**User**: Farid Ahmad  
**Department**: Finance  
**Color**: Green (#16a34a)

### Permissions (9)
**Projects**
- ✅ view_projects - View projects

**Finance**
- ✅ view_finance - View financial data
- ✅ create_quotations - Create quotations
- ✅ create_invoices - Create invoices
- ✅ manage_expenses - Manage expenses
- ✅ manage_payments - Manage payments
- ✅ manage_salaries - Manage salary payments

**Employees**
- ✅ view_employees - View employee data
- ✅ view_salaries - View salary information

---

## 4. Technical Employee

**Email**: `technical@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-TECH-001  
**User**: Shoaib Ahmad  
**Department**: Technical  
**Color**: Cyan (#0891b2)

### Permissions (5)
**Tasks**
- ✅ view_own_tasks - View own assigned tasks

**Employees**
- ✅ log_attendance - Log own attendance
- ✅ request_leave - Request leave

**Schedule**
- ✅ view_schedule - View own schedule

**Equipment**
- ✅ view_equipment - View equipment

---

## 5. Production Manager

**Email**: `production@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-PROD-001  
**User**: Hafizullah Khan  
**Department**: Production  
**Color**: Orange (#d97706)

### Permissions (7)
**Projects**
- ✅ view_projects - View projects

**Tasks**
- ✅ view_all_tasks - View all tasks
- ✅ create_tasks - Create tasks

**Employees**
- ✅ log_attendance - Log own attendance
- ✅ view_attendance - View attendance records
- ✅ view_employees - View employee data

**Equipment**
- ✅ view_equipment - View equipment

---

## 6. HR Manager

**Email**: `hr@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-HR-001  
**User**: Zainab Ahmad  
**Department**: Human Resources  
**Color**: Pink (#db2777)

### Permissions (6)
**Projects**
- ✅ view_projects - View projects

**Employees**
- ✅ view_employees - View employee data
- ✅ manage_employees - Create/edit employees
- ✅ view_attendance - View attendance records
- ✅ view_salaries - View salary information
- ✅ manage_leave - Manage leave requests

---

## 7. System Administrator

**Email**: `admin@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-ADM-001  
**User**: Mohammad Wali  
**Department**: Administration  
**Color**: Dark Blue (#1e40af)

### Permissions (6)
**System**
- ✅ manage_users - Create/edit/delete users
- ✅ manage_roles - Manage roles and permissions
- ✅ view_audit_logs - View audit logs
- ✅ system_settings - Manage system settings
- ✅ backup - Perform system backups

**Employees**
- ✅ view_employees - View employee data

---

## 8. Administration Employee

**Email**: `admin.employee@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-ADMIN-001  
**User**: Maryam Rahimi  
**Department**: Administration  
**Color**: Teal (#059669)

### Permissions (4)
**Employees**
- ✅ view_employees - View employee data
- ✅ log_attendance - Log own attendance
- ✅ request_leave - Request leave

**Schedule**
- ✅ view_schedule - View own schedule

---

## 9. Employee

**Email**: `employee@chinar.tv`  
**Password**: `ChinarCEO@2026`  
**Employee ID**: CHN-EMP-001  
**User**: Ahmad Rahimi  
**Department**: Production  
**Color**: Gray (#6b7280)

### Permissions (4)
**Tasks**
- ✅ view_own_tasks - View own assigned tasks

**Employees**
- ✅ log_attendance - Log own attendance
- ✅ request_leave - Request leave

**Schedule**
- ✅ view_schedule - View own schedule

---

## All System Permissions (35 total)

### General (2)
- view_all - View all system data
- edit_all - Edit all system data

### Projects (5)
- view_projects - View projects
- create_projects - Create new projects
- edit_projects - Edit projects
- delete_projects - Delete projects
- approve_projects - Approve/reject projects

### Finance (9)
- view_finance - View financial data
- create_quotations - Create quotations
- approve_quotations - Approve quotations
- create_invoices - Create invoices
- approve_invoices - Approve invoices
- manage_expenses - Manage expenses
- approve_expenses - Approve expenses
- manage_payments - Manage payments
- manage_salaries - Manage salary payments

### Tasks (4)
- view_all_tasks - View all tasks
- create_tasks - Create tasks
- view_own_tasks - View own assigned tasks
- manage_tasks - Manage task assignments

### Employees (7)
- view_employees - View employee data
- manage_employees - Create/edit employees
- view_attendance - View attendance records
- log_attendance - Log own attendance
- view_salaries - View salary information
- manage_leave - Manage leave requests
- request_leave - Request leave

### Equipment (2)
- view_equipment - View equipment
- manage_equipment - Manage equipment

### Schedule (1)
- view_schedule - View own schedule

### System (5)
- manage_users - Create/edit/delete users
- manage_roles - Manage roles and permissions
- view_audit_logs - View audit logs
- system_settings - Manage system settings
- backup - Perform system backups

---

## Department Structure

| Department | Code | Head |
|------------|------|------|
| Executive | CEO | Ahmad Khan (CEO) |
| Operations | HOO | Wali Khan (HOO) |
| Finance | FIN | Farid Ahmad (Finance Officer) |
| Technical | TECH | Shoaib Ahmad (Technical Employee) |
| Production | PROD | Hafizullah Khan (Production Manager) |
| Human Resources | HR | Zainab Ahmad (HR Manager) |
| Administration | ADM | Mohammad Wali (System Administrator) |

---

## Login Instructions

1. Go to http://localhost:3000
2. Enter any test account email (e.g., `ceo@chinar.tv`)
3. Enter password: `ChinarCEO@2026`
4. Click "Sign In"

---

## API Testing

Use these credentials with the authentication endpoints:

```bash
# Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "ceo@chinar.tv",
  "password": "ChinarCEO@2026"
}
```

---

## Security Notes

- All test accounts currently use the same password: `ChinarCEO@2026`
- Passwords are hashed using bcrypt with 10 salt rounds
- In production, users should change their passwords on first login
- JWT tokens expire after 15 minutes (access) and 7 days (refresh)
- All login attempts are logged in the audit_logs table
