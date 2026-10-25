# Phase 2: Projects & Tasks Management APIs

## Overview

Phase 2 implements the core user, project, and task management functionality - allowing users to view, create, update, and manage users, projects, and tasks with role-based access control, approval workflows, and comprehensive permission checks.

---

## Objectives

1. **User Management**
   - View all users with filtering
   - View user details with permissions
   - Create new user accounts
   - Update user information
   - Password management
   - User deactivation
   - View user's projects and tasks

2. **Project Management**
   - CRUD operations for projects
   - Project approval workflow (CEO approval)
   - Project status management
   - Project team assignments
   - Project calendar integration

2. **Task Management**
   - CRUD operations for tasks
   - Task assignments to users
   - Task status tracking
   - Task filtering by user, project, status

3. **Frontend Integration**
   - Replace mock data with real API calls
   - Connect existing project components to backend
   - Update dashboard with live project data
   - Implement real-time project updates

---

## Database Tables (Already Designed)

### 1. Projects Table
```sql
CREATE TABLE projects (
  id VARCHAR(20) PRIMARY KEY, -- PRJ-2026-0042
  name VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  status VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
  department_id UUID NOT NULL REFERENCES departments(id),
  budget DECIMAL(15,2) NOT NULL,
  
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Statuses**: `Upcoming`, `In Progress`, `Completed`, `On Hold`, `Rejected`, `Pending approval`

### 2. Project Approvals Table
```sql
CREATE TABLE project_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  approver_user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Pending approval', 'Approved', 'Rejected')),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Project Assignments Table
```sql
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(100), -- e.g., 'Director of Photography'
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  UNIQUE(project_id, user_id)
);
```

### 4. Tasks Table
```sql
CREATE TABLE tasks (
  id VARCHAR(20) PRIMARY KEY, -- TSK-TECH-001 or TSK-OPS-001
  project_id VARCHAR(20) NOT NULL REFERENCES projects(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  assigned_to UUID NOT NULL REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority VARCHAR(20) DEFAULT 'Medium',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

**Statuses**: `Pending`, `In Progress`, `Completed`, `Cancelled`  
**Priorities**: `Low`, `Medium`, `High`, `Urgent`

---

## API Endpoints to Implement

**Total Endpoints: 22**
- **Users**: 8 endpoints
- **Projects**: 8 endpoints
- **Tasks**: 5 endpoints
- **Statistics**: 1 endpoint

### Users APIs

#### 1. GET /api/users
**Description**: Get all users with filtering  
**Query Parameters**:
- `role` - Filter by role name (optional)
- `department` - Filter by department ID (optional)
- `status` - Filter by status (active/inactive) (optional)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Permissions**: 
- Admin, CEO, HOO: View all users
- HR: View all employees
- Others: View users in same department

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "...",
        "employeeId": "CHN-CEO-001",
        "email": "ceo@chinar.tv",
        "firstName": "Ahmad",
        "lastName": "Khan",
        "name": "Ahmad Khan",
        "phone": "+93701234567",
        "photoUrl": "https://...",
        "role": {
          "id": "...",
          "name": "CEO / Founder Manager",
          "color": "#7c3aed"
        },
        "department": {
          "id": "...",
          "name": "Executive",
          "code": "CEO"
        },
        "status": "active",
        "joiningDate": "2023-01-01",
        "employmentType": "full-time",
        "lastLogin": "2026-02-25T09:15:00Z",
        "createdAt": "2023-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

#### 2. GET /api/users/:id
**Description**: Get single user details with permissions  
**Permissions**: Self, Admin, CEO, HOO, HR

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "employeeId": "CHN-CEO-001",
      "email": "ceo@chinar.tv",
      "firstName": "Ahmad",
      "lastName": "Khan",
      "name": "Ahmad Khan",
      "phone": "+93701234567",
      "photoUrl": "https://...",
      "role": {
        "id": "...",
        "name": "CEO / Founder Manager",
        "description": "Full system access and final approval authority",
        "color": "#7c3aed",
        "permissions": [
          {
            "name": "view_all",
            "description": "View all system data",
            "category": "general"
          },
          // ... all 35 permissions for CEO
        ]
      },
      "department": {
        "id": "...",
        "name": "Executive",
        "code": "CEO",
        "head": { "id": "...", "name": "Ahmad Khan" }
      },
      "status": "active",
      "joiningDate": "2023-01-01",
      "employmentType": "full-time",
      "lastLogin": "2026-02-25T09:15:00Z",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2026-02-24T14:30:00Z"
    }
  }
}
```

---

#### 3. POST /api/users
**Description**: Create new user account  
**Permissions**: Admin, CEO, HOO (with restrictions)

**Request Body**:
```json
{
  "employeeId": "CHN-TECH-002",
  "email": "camera.operator@chinar.tv",
  "password": "TempPassword@2026",
  "firstName": "Reza",
  "lastName": "Karimi",
  "phone": "+93702345678",
  "roleId": "...",
  "departmentId": "...",
  "joiningDate": "2026-03-01",
  "employmentType": "full-time",
  "status": "active"
}
```

**Validations**:
- Email must be unique and valid format
- Employee ID must match format: `CHN-{DEPT}-{###}`
- Password minimum 8 characters with uppercase, lowercase, number, special char
- Role and department must exist
- Joining date cannot be in future

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "employeeId": "CHN-TECH-002",
      "email": "camera.operator@chinar.tv",
      "firstName": "Reza",
      "lastName": "Karimi",
      "name": "Reza Karimi",
      "role": { "name": "Technical Employee" },
      "department": { "name": "Technical" },
      "status": "active",
      "createdAt": "2026-02-25T10:00:00Z"
    }
  },
  "message": "User created successfully. Temporary password should be changed on first login."
}
```

---

#### 4. PUT /api/users/:id
**Description**: Update user information  
**Permissions**: 
- Admin: Update all fields
- HR: Update employment details (not role/permissions)
- Self: Update phone, photo only

**Request Body** (partial update):
```json
{
  "phone": "+93703456789",
  "status": "inactive",
  "departmentId": "..."
}
```

**Restricted Fields**:
- Cannot change `employeeId`
- Cannot change `email` (separate endpoint for that)
- Only Admin can change `roleId`
- Only Admin/HR can change `status`

**Response**:
```json
{
  "success": true,
  "data": {
    "user": { ... }
  },
  "message": "User updated successfully"
}
```

---

#### 5. PUT /api/users/:id/password
**Description**: Change user password  
**Permissions**: Self only (or Admin with reason)

**Request Body**:
```json
{
  "currentPassword": "OldPassword@2026",
  "newPassword": "NewPassword@2026",
  "confirmPassword": "NewPassword@2026"
}
```

**Validations**:
- Current password must match
- New password must meet complexity requirements
- New password must not match old password
- Confirm password must match new password

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully. Please login with your new password."
}
```

---

#### 6. DELETE /api/users/:id
**Description**: Deactivate user (soft delete)  
**Permissions**: Admin only

**Note**: Sets `status` to 'inactive' and `deleted_at` timestamp. Does not remove from database to preserve audit trails and foreign key relationships.

**Response**:
```json
{
  "success": true,
  "message": "User account deactivated successfully"
}
```

---

#### 7. GET /api/users/:id/projects
**Description**: Get all projects user is assigned to  
**Permissions**: Self, Admin, HOO

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "PRJ-2026-0042",
        "name": "Morning News Bulletin - Feb 2026",
        "role": "Camera Operator",
        "status": "In Progress",
        "startDate": "2026-02-01",
        "endDate": "2026-02-28",
        "assignedAt": "2026-01-20T09:00:00Z"
      }
    ]
  }
}
```

---

#### 8. GET /api/users/:id/tasks
**Description**: Get all tasks assigned to user  
**Permissions**: Self, Admin, HOO

**Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "TSK-TECH-001",
        "title": "Setup camera equipment",
        "projectId": "PRJ-2026-0042",
        "projectName": "Morning News Bulletin - Feb 2026",
        "status": "Completed",
        "priority": "High",
        "dueDate": "2026-02-05",
        "completedAt": "2026-02-04T16:30:00Z"
      }
    ]
  }
}
```

---

### Projects APIs

#### 1. GET /api/projects
**Description**: Get all projects with filtering and pagination  
**Query Parameters**:
- `status` - Filter by status (optional)
- `department` - Filter by department ID (optional)
- `owner` - Filter by owner user ID (optional)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Permissions**: 
- CEO/HOO: View all projects
- Others: View projects in their department or assigned to them

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "PRJ-2026-0042",
        "name": "Morning News Bulletin - Feb 2026",
        "client": "Chinar TV",
        "owner": {
          "id": "...",
          "name": "Wali Khan",
          "employeeId": "CHN-HOO-001"
        },
        "startDate": "2026-02-01",
        "endDate": "2026-02-28",
        "progress": 65,
        "status": "In Progress",
        "department": "Operations",
        "budget": 150000.00,
        "teamSize": 12,
        "createdAt": "2026-01-15T10:30:00Z",
        "updatedAt": "2026-02-10T14:20:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

#### 2. GET /api/projects/:id
**Description**: Get single project details with team and tasks  
**Permissions**: View based on role and assignment

**Response**:
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "PRJ-2026-0042",
      "name": "Morning News Bulletin - Feb 2026",
      "client": "Chinar TV",
      "owner": { "id": "...", "name": "Wali Khan" },
      "startDate": "2026-02-01",
      "endDate": "2026-02-28",
      "progress": 65,
      "status": "In Progress",
      "department": "Operations",
      "budget": 150000.00,
      "team": [
        {
          "userId": "...",
          "name": "Shoaib Ahmad",
          "role": "Camera Operator",
          "assignedAt": "2026-01-20T09:00:00Z"
        }
      ],
      "tasks": [
        {
          "id": "TSK-TECH-001",
          "title": "Setup camera equipment",
          "status": "Completed",
          "assignedTo": { "id": "...", "name": "Shoaib Ahmad" },
          "dueDate": "2026-02-05"
        }
      ],
      "approvals": [
        {
          "id": "...",
          "approver": { "id": "...", "name": "Ahmad Khan" },
          "status": "Approved",
          "comment": "Approved for execution",
          "createdAt": "2026-01-16T11:00:00Z"
        }
      ],
      "createdBy": { "id": "...", "name": "Wali Khan" },
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-02-10T14:20:00Z"
    }
  }
}
```

---

#### 3. POST /api/projects
**Description**: Create new project  
**Permissions**: HOO, CEO, Admin

**Request Body**:
```json
{
  "name": "Ramadan Special Coverage 2026",
  "client": "Chinar TV",
  "ownerId": "...",
  "startDate": "2026-03-01",
  "endDate": "2026-04-10",
  "departmentId": "...",
  "budget": 250000.00,
  "status": "Upcoming"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "PRJ-2026-0043",
      "name": "Ramadan Special Coverage 2026",
      ...
    }
  },
  "message": "Project created successfully"
}
```

---

#### 4. PUT /api/projects/:id
**Description**: Update existing project  
**Permissions**: Owner, HOO, CEO

**Request Body** (partial update):
```json
{
  "progress": 75,
  "status": "In Progress",
  "endDate": "2026-03-15"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "project": { ... }
  },
  "message": "Project updated successfully"
}
```

---

#### 5. DELETE /api/projects/:id
**Description**: Soft delete project  
**Permissions**: HOO, CEO, Admin

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

#### 6. POST /api/projects/:id/approve
**Description**: Approve or reject project (CEO only)  
**Permissions**: CEO

**Request Body**:
```json
{
  "status": "Approved", // or "Rejected"
  "comment": "Approved for execution. Budget allocated."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "approval": {
      "id": "...",
      "projectId": "PRJ-2026-0043",
      "status": "Approved",
      "comment": "Approved for execution. Budget allocated.",
      "approvedBy": { "id": "...", "name": "Ahmad Khan" },
      "approvedAt": "2026-02-25T10:00:00Z"
    }
  },
  "message": "Project approved successfully"
}
```

---

#### 7. POST /api/projects/:id/team
**Description**: Assign team member to project  
**Permissions**: HOO, Project Owner, CEO

**Request Body**:
```json
{
  "userId": "...",
  "role": "Director of Photography"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "assignment": {
      "id": "...",
      "projectId": "PRJ-2026-0043",
      "user": { "id": "...", "name": "Shoaib Ahmad" },
      "role": "Director of Photography",
      "assignedAt": "2026-02-25T11:30:00Z"
    }
  },
  "message": "Team member assigned successfully"
}
```

---

#### 8. DELETE /api/projects/:id/team/:assignmentId
**Description**: Remove team member from project  
**Permissions**: HOO, Project Owner, CEO

---

### Tasks APIs

#### 9. GET /api/tasks
**Description**: Get all tasks with filtering  
**Query Parameters**:
- `projectId` - Filter by project (optional)
- `assignedTo` - Filter by assigned user (optional)
- `status` - Filter by status (optional)
- `priority` - Filter by priority (optional)
- `page`, `limit` - Pagination

**Permissions**:
- HOO/CEO: View all tasks
- Others: View own tasks or tasks in their projects

**Response**:
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "TSK-TECH-001",
        "projectId": "PRJ-2026-0042",
        "projectName": "Morning News Bulletin - Feb 2026",
        "title": "Setup camera equipment",
        "description": "Prepare and test all camera equipment for shoot",
        "assignedTo": { "id": "...", "name": "Shoaib Ahmad" },
        "assignedBy": { "id": "...", "name": "Wali Khan" },
        "dueDate": "2026-02-05",
        "status": "Completed",
        "progress": 100,
        "priority": "High",
        "completedAt": "2026-02-04T16:30:00Z",
        "createdAt": "2026-01-20T09:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### 10. GET /api/tasks/:id
**Description**: Get single task details  
**Permissions**: Assigned user, project team, HOO, CEO

---

#### 11. POST /api/tasks
**Description**: Create new task  
**Permissions**: HOO, Production Manager, Project Owner

**Request Body**:
```json
{
  "projectId": "PRJ-2026-0042",
  "title": "Edit morning segment footage",
  "description": "Edit and finalize the morning news segment",
  "assignedTo": "...", // user ID
  "dueDate": "2026-02-15",
  "priority": "High"
}
```

---

#### 12. PUT /api/tasks/:id
**Description**: Update task  
**Permissions**: Assigned user (status/progress only), HOO, Project Owner

**Request Body** (partial):
```json
{
  "status": "In Progress",
  "progress": 50
}
```

---

#### 13. DELETE /api/tasks/:id
**Description**: Delete task  
**Permissions**: HOO, Task creator

---

### Statistics APIs

#### 14. GET /api/projects/stats
**Description**: Get project statistics for dashboard  
**Permissions**: All authenticated users (scoped to their view)

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 45,
    "active": 18,
    "upcoming": 12,
    "completed": 15,
    "byStatus": {
      "In Progress": 18,
      "Upcoming": 12,
      "Completed": 15,
      "On Hold": 0,
      "Pending approval": 0
    },
    "byDepartment": {
      "Operations": 20,
      "Production": 15,
      "Technical": 10
    },
    "totalBudget": 4500000.00,
    "averageProgress": 62
  }
}
```

---

## Business Logic & Validations

### Project Creation
1. ✅ Validate start_date < end_date
2. ✅ Validate budget > 0
3. ✅ Generate project ID: `PRJ-{YEAR}-{sequential}`
4. ✅ Set creator as `created_by`
5. ✅ Default status: "Upcoming"
6. ✅ Audit log the creation

### Project Approval
1. ✅ Only CEO can approve
2. ✅ Project must be in "Pending approval" status
3. ✅ Create approval record in `project_approvals`
4. ✅ Update project status to "Approved" or "Rejected"
5. ✅ Set `approved_by` and `approved_at`
6. ✅ Send notification to project owner
7. ✅ Audit log the approval/rejection

### Task Creation
1. ✅ Validate user has permission to create tasks
2. ✅ Validate assigned user exists and is active
3. ✅ Validate project exists
4. ✅ Generate task ID: `TSK-{DEPT}-{sequential}`
5. ✅ Default status: "Pending"
6. ✅ Send notification to assigned user
7. ✅ Audit log the assignment

### Task Status Updates
1. ✅ When status changes to "Completed":
   - Set `completed_at` timestamp
   - Set progress to 100
2. ✅ Validate status transitions (can't go from Completed to Pending)
3. ✅ Update project progress if all tasks completed
4. ✅ Notify task creator of completion

---

## Permissions Matrix

### Users Management

| Action | CEO | HOO | Finance | Production Mgr | Tech Employee | HR | Admin |
|--------|-----|-----|---------|----------------|---------------|-----|-------|
| View all users | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View user details | ✅ | ✅ | Dept only | Dept only | Dept only | ✅ | ✅ |
| Create user | ✅ | Restricted | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit user | ✅ | Restricted | ❌ | ❌ | Self only | Employment | ✅ |
| Deactivate user | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Change password | Self | Self | Self | Self | Self | Self | Self |
| View user projects | ✅ | ✅ | ❌ | ❌ | Self only | ❌ | ✅ |
| View user tasks | ✅ | ✅ | ❌ | ❌ | Self only | ❌ | ✅ |

### Projects Management

| Action | CEO | HOO | Finance | Production Mgr | Tech Employee | Admin |
|--------|-----|-----|---------|----------------|---------------|-------|
| View all projects | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View own projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create project | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Edit project | ✅ | ✅ | ❌ | Owner only | ❌ | ✅ |
| Delete project | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Approve project | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign team | ✅ | ✅ | ❌ | Owner only | ❌ | ✅ |
| View all tasks | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View own tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Update task | ✅ | ✅ | ❌ | ✅ | Own tasks | ✅ |
| Delete task | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |

---

## Frontend Components to Update

### Users Management

#### 1. Employees Page (`components/employees/EmployeesPage.tsx`)
- Replace mock user data
- Fetch from `GET /api/users`
- Add filtering by role, department, status
- Implement user creation form
- Edit user functionality
- View user details modal

#### 2. Administration Page (`components/administration/AdministrationPage.tsx`)
- Fetch from `GET /api/users` with admin view
- Show all users with full details
- User activation/deactivation
- Password reset functionality
- Audit log viewing

### Projects Management

#### 3. Projects Page (`components/projects/ProjectTable.tsx`)
- Replace `projectsSeed` mock data
- Fetch from `GET /api/projects`
- Add filtering by status, department
- Implement pagination
- Real-time status updates

### 2. Project Dialog (`components/projects/ProjectDialog.tsx`)
- Connect form submission to `POST /api/projects`
- Validate form fields
- Show success/error messages
- Refresh project list on success

### 3. Project Detail Modal (`components/projects/ProjectDetailModal.tsx`)
- Fetch from `GET /api/projects/:id`
- Show real team members
- Show real tasks
- Add team member functionality
- Approval UI for CEO

### 4. Dashboard (`components/dashboard/DashboardHome.tsx`)
- Fetch stats from `GET /api/projects/stats`
- Show real project counts
- Real budget totals
- Real progress metrics

### 5. Calendar (`components/calendar/ProjectCalendar.tsx`)
- Fetch projects with date range
- Display real project timelines
- Color code by status

### 6. CEO Dashboard (`components/dashboard/CeoDashboardHome.tsx`)
- Show pending approvals from `GET /api/projects?status=Pending approval`
- Quick approve/reject actions

### 7. Operations Tasks Page (`components/operations/OperationsTasksPage.tsx`)
- Fetch from `GET /api/tasks`
- Filter by project, status
- Create/edit tasks
- Update task status

---

## Migration Files to Create

### `005_projects_tables.sql`
```sql
-- Create projects, project_approvals, project_assignments tables
-- See database schema section above
```

### `006_tasks_tables.sql`
```sql
-- Create tasks table
-- See database schema section above
```

### `007_seed_projects.sql`
```sql
-- Optional: Seed sample projects for testing
INSERT INTO projects ...
```

---

## Helper Functions to Create

### Helper Functions to Create

### `lib/users.ts`
```typescript
export async function getAllUsers(filters, requestingUserId, requestingUserRole)
export async function getUserById(id, requestingUserId, requestingUserRole)
export async function createUser(data, createdBy)
export async function updateUser(id, data, updatedBy)
export async function deactivateUser(id, deactivatedBy)
export async function changePassword(userId, currentPassword, newPassword)
export async function getUserProjects(userId)
export async function getUserTasks(userId)
export async function validateEmployeeId(employeeId)
export async function validateEmail(email)
export async function validatePassword(password)
```

### `lib/projects.ts`
```typescript
export async function getAllProjects(filters, userId, userRole)
export async function getProjectById(id, userId, userRole)
export async function createProject(data, createdBy)
export async function updateProject(id, data, userId)
export async function deleteProject(id, userId)
export async function approveProject(id, approverId, status, comment)
export async function assignTeamMember(projectId, userId, role, assignedBy)
export async function removeTeamMember(assignmentId, userId)
export async function getProjectStats(userId, userRole)
export async function generateProjectId()
```

### `lib/tasks.ts`
```typescript
export async function getAllTasks(filters, userId, userRole)
export async function getTaskById(id, userId, userRole)
export async function createTask(data, createdBy)
export async function updateTask(id, data, userId)
export async function deleteTask(id, userId)
export async function generateTaskId(departmentCode)
```

---

## Testing Checklist

## Testing Checklist

### Users API Testing
- [ ] Test GET /api/users with different roles
- [ ] Test GET /api/users/:id with permission checks
- [ ] Test POST /api/users with valid/invalid data
- [ ] Test PUT /api/users/:id with different update scenarios
- [ ] Test password change with correct/incorrect current password
- [ ] Test user deactivation and data preservation
- [ ] Test GET /api/users/:id/projects
- [ ] Test GET /api/users/:id/tasks
- [ ] Test email uniqueness validation
- [ ] Test employee ID format validation
- [ ] Test role-based access restrictions

### Project API Testing
- [ ] Test all endpoints with different roles
- [ ] Test permission checks work correctly
- [ ] Test pagination works
- [ ] Test filtering works
- [ ] Test project approval workflow
- [ ] Test team assignment/removal
- [ ] Test task creation/updates
- [ ] Test error handling (invalid data, unauthorized access)

### Frontend Testing
- [ ] Test project creation form
- [ ] Test project list filtering
- [ ] Test project detail view
- [ ] Test team member assignment UI
- [ ] Test CEO approval flow
- [ ] Test dashboard statistics update
- [ ] Test calendar view with real data
- [ ] Test task management UI
- [ ] Test role-based UI visibility

### Integration Testing
- [ ] Create project → appears in list
- [ ] Approve project → status changes, notification sent
- [ ] Assign team → appears in project detail
- [ ] Create task → appears in task list
- [ ] Complete task → updates project progress
- [ ] Delete project → removed from views

---

## Success Criteria

✅ All 22 API endpoints implemented and tested  
✅ All frontend components connected to real APIs  
✅ Mock data completely replaced  
✅ Role-based permissions working correctly  
✅ User management fully functional  
✅ Project approval workflow functional  
✅ Task management fully operational  
✅ Dashboard shows real-time statistics  
✅ Calendar displays actual projects  
✅ All API tests pass  
✅ Frontend integration complete  
✅ Documentation updated  

---

## Estimated Timeline

- **Database Migrations**: 1-2 hours (no new tables needed)
- **Users API Implementation**: 6-8 hours
- **Projects API Implementation**: 8-10 hours
- **Tasks API Implementation**: 4-5 hours
- **Frontend Integration**: 8-10 hours
- **Testing & Bug Fixes**: 6-8 hours
- **Documentation**: 2 hours

**Total**: 35-45 hours (5-6 days)

---

## Dependencies

**Completed (Phase 1)**:
- ✅ Authentication system
- ✅ User management
- ✅ Roles & permissions
- ✅ Database connection
- ✅ JWT tokens

**Required for Phase 2**:
- None - Phase 2 can start immediately

**Blocks Phase 3**:
- Finance APIs need projects to exist

---

## Notes

- Projects use custom ID format: `PRJ-YYYY-####`
- Tasks use department-specific format: `TSK-DEPT-###`
- All timestamps in UTC
- Soft deletes for projects (set `deleted_at`)
- Audit logging for all critical operations
- Pagination default: 20 items per page
- All monetary values use DECIMAL(15,2)

---

## Next Phase

**Phase 3**: Finance Management (Quotations, Invoices, Payments, Expenses)
