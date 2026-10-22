"use client";

import React, { FormEvent, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Database,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Filter,
  HardDrive,
  Key,
  LayoutDashboard,
  Lock,
  LogIn,
  Monitor,
  MoreVertical,
  Package,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { User as UserType } from "../../lib/types";

/* ─── Types ─────────────────────────────────────────────── */
type Section =
  | "Dashboard"
  | "User Management"
  | "Roles & Permissions"
  | "Department Management"
  | "Notifications"
  | "Audit Logs"
  | "Documents & Templates"
  | "System Settings"
  | "Backup & System Health";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Inactive";
  lastLogin: string;
  joined: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: string[];
  color: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  employees: number;
  projects: number;
  status: "Active" | "Inactive";
}

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  time: string;
  severity: "info" | "warning" | "critical";
}

interface AdminDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  updated: string;
  author: string;
}

/* ─── Seed Data ──────────────────────────────────────────── */
const seedUsers: AdminUser[] = [
  { id: "CHN-CEO-001",  name: "Ahmad Khan",      email: "ceo@demo.chinar.tv",            role: "CEO / Founder Manager",    department: "Executive",        status: "Active",   lastLogin: "Today, 09:14",    joined: "01 Jan 2023" },
  { id: "CHN-HOO-001",  name: "Wali Khan",       email: "hoo@demo.chinar.tv",            role: "Head of Operations",       department: "Operations",       status: "Active",   lastLogin: "Today, 08:52",    joined: "01 Mar 2023" },
  { id: "CHN-FIN-001",  name: "Farid Ahmad",     email: "finance@demo.chinar.tv",        role: "Finance Officer",          department: "Finance",          status: "Active",   lastLogin: "Yesterday, 17:30", joined: "15 Jun 2023" },
  { id: "CHN-TECH-001", name: "Shoaib Ahmad",    email: "technical@demo.chinar.tv",      role: "Technical Employee",       department: "Technical",        status: "Active",   lastLogin: "Today, 10:05",    joined: "01 Sep 2023" },
  { id: "CHN-PROD-001", name: "Hafizullah Khan", email: "production@demo.chinar.tv",     role: "Production Manager",       department: "Production",       status: "Active",   lastLogin: "Today, 11:22",    joined: "01 Feb 2024" },
  { id: "CHN-HR-001",   name: "Zainab Ahmad",    email: "hr@demo.chinar.tv",             role: "HR Manager",               department: "Human Resources",  status: "Active",   lastLogin: "Yesterday, 14:45", joined: "10 Apr 2024" },
  { id: "CHN-ADM-001",  name: "Mohammad Wali",   email: "admin@demo.chinar.tv",          role: "System Administrator",     department: "Administration",   status: "Active",   lastLogin: "Today, 07:40",    joined: "01 Jan 2025" },
  { id: "CHN-EMP-002",  name: "Reza Karimi",     email: "reza.karimi@demo.chinar.tv",    role: "Camera Operator",          department: "Technical",        status: "Active",   lastLogin: "3 days ago",       joined: "20 May 2025" },
  { id: "CHN-EMP-003",  name: "Sara Nazari",     email: "sara.nazari@demo.chinar.tv",    role: "Graphic Designer",         department: "Production",       status: "Inactive", lastLogin: "2 weeks ago",      joined: "01 Jul 2025" },
  { id: "CHN-EMP-004",  name: "Khalid Hussain",  email: "khalid.h@demo.chinar.tv",       role: "Field Reporter",           department: "Production",       status: "Active",   lastLogin: "Today, 08:12",    joined: "15 Aug 2025" },
];

const seedRoles: Role[] = [
  { id: "r1", name: "CEO / Founder Manager",  description: "Full system access and final approval authority.",          users: 1, color: "#7c3aed", permissions: ["view_all","edit_all","approve_projects","approve_finance","manage_users","system_settings"] },
  { id: "r2", name: "Head of Operations",     description: "Manages operational workflows and project submissions.",    users: 1, color: "#2563eb", permissions: ["view_all","create_projects","manage_tasks","view_finance"] },
  { id: "r3", name: "Finance Officer",        description: "Manages quotations, invoices, payments and expenses.",      users: 1, color: "#16a34a", permissions: ["view_finance","create_invoices","create_quotations","manage_expenses","manage_payments"] },
  { id: "r4", name: "Technical Employee",     description: "Executes technical assignments and logs attendance.",       users: 2, color: "#0891b2", permissions: ["view_own_tasks","log_attendance","view_schedule","request_leave"] },
  { id: "r5", name: "Production Manager",     description: "Oversees production tasks and team attendance.",            users: 1, color: "#d97706", permissions: ["view_projects","manage_production_tasks","view_team","log_attendance"] },
  { id: "r6", name: "HR Manager",             description: "Manages employee records, contracts and leave.",             users: 1, color: "#db2777", permissions: ["manage_employees","view_salaries","manage_leave","view_attendance"] },
  { id: "r7", name: "System Administrator",   description: "Manages system settings, backups and user accounts.",       users: 1, color: "#1e40af", permissions: ["manage_users","system_settings","view_audit_logs","backup","manage_roles"] },
];

const seedDepts: Department[] = [
  { id: "d1", name: "Executive",       head: "Ahmad Khan",      employees: 1,  projects: 0,  status: "Active" },
  { id: "d2", name: "Operations",      head: "Wali Khan",       employees: 3,  projects: 8,  status: "Active" },
  { id: "d3", name: "Finance",         head: "Farid Ahmad",     employees: 2,  projects: 0,  status: "Active" },
  { id: "d4", name: "Technical",       head: "Shoaib Ahmad",    employees: 5,  projects: 6,  status: "Active" },
  { id: "d5", name: "Production",      head: "Hafizullah Khan", employees: 7,  projects: 9,  status: "Active" },
  { id: "d6", name: "Human Resources", head: "Zainab Ahmad",    employees: 2,  projects: 0,  status: "Active" },
  { id: "d7", name: "Administration",  head: "Mohammad Wali",   employees: 3,  projects: 0,  status: "Active" },
];

const seedLogs: AuditLog[] = [
  { id: "AL-001", actor: "Ahmad Khan",      action: "Approved project",            target: "PRJ-2026-0042",       ip: "192.168.1.10", time: "Today, 09:14",     severity: "info"     },
  { id: "AL-002", actor: "Mohammad Wali",   action: "Created user account",         target: "CHN-EMP-004",         ip: "192.168.1.1",  time: "Today, 08:55",     severity: "info"     },
  { id: "AL-003", actor: "Unknown",         action: "Failed login attempt (x3)",    target: "finance@demo",        ip: "89.24.55.102", time: "Today, 07:30",     severity: "critical" },
  { id: "AL-004", actor: "Farid Ahmad",     action: "Submitted invoice",            target: "INV-2026-0018",       ip: "192.168.1.15", time: "Yesterday, 17:30", severity: "info"     },
  { id: "AL-005", actor: "Mohammad Wali",   action: "Updated role permissions",     target: "Technical Employee",  ip: "192.168.1.1",  time: "Yesterday, 14:10", severity: "warning"  },
  { id: "AL-006", actor: "Wali Khan",       action: "Rejected quotation",           target: "QTN-2026-0031",       ip: "192.168.1.12", time: "Yesterday, 11:05", severity: "warning"  },
  { id: "AL-007", actor: "Mohammad Wali",   action: "System backup completed",      target: "backup-oct-2026.sql", ip: "192.168.1.1",  time: "22 Oct, 02:00",    severity: "info"     },
  { id: "AL-008", actor: "Sara Nazari",     action: "Account deactivated",          target: "CHN-EMP-003",         ip: "192.168.1.1",  time: "21 Oct, 16:00",    severity: "warning"  },
];

const seedDocuments: AdminDocument[] = [
  { id: "DOC-001", name: "Employee Handbook 2026",          type: "PDF",  category: "HR",        size: "2.4 MB", updated: "15 Oct 2026", author: "Zainab Ahmad"   },
  { id: "DOC-002", name: "Quotation Template — Standard",    type: "DOCX", category: "Templates", size: "340 KB", updated: "10 Oct 2026", author: "Farid Ahmad"    },
  { id: "DOC-003", name: "Invoice PDF Template",             type: "DOCX", category: "Templates", size: "220 KB", updated: "10 Oct 2026", author: "Farid Ahmad"    },
  { id: "DOC-004", name: "Company Profile 2026",             type: "PDF",  category: "Company",   size: "5.1 MB", updated: "01 Oct 2026", author: "Ahmad Khan"     },
  { id: "DOC-005", name: "IT Acceptable Use Policy",         type: "PDF",  category: "Policies",  size: "890 KB", updated: "05 Sep 2026", author: "Mohammad Wali"  },
  { id: "DOC-006", name: "Leave Request Form",               type: "DOCX", category: "HR",        size: "105 KB", updated: "01 Aug 2026", author: "Zainab Ahmad"   },
  { id: "DOC-007", name: "Project Proposal Template",        type: "DOCX", category: "Templates", size: "280 KB", updated: "20 Jul 2026", author: "Wali Khan"      },
  { id: "DOC-008", name: "Archive — Q1 2026 Contracts",      type: "ZIP",  category: "Archive",   size: "18 MB",  updated: "31 Mar 2026", author: "Mohammad Wali"  },
];


const allPermissions = [
  "view_all", "edit_all", "approve_projects", "approve_finance", "manage_users",
  "system_settings", "create_projects", "manage_tasks", "view_finance",
  "create_invoices", "create_quotations", "manage_expenses", "manage_payments",
  "view_own_tasks", "log_attendance", "view_schedule", "request_leave",
  "view_projects", "manage_production_tasks", "view_team", "manage_employees",
  "view_salaries", "manage_leave", "view_attendance", "view_audit_logs",
  "backup", "manage_roles",
];

/* ─── Small Helpers ──────────────────────────────────────── */
function Badge({ text, color }: { text: string; color: string }) {
  const map: Record<string, string> = {
    Active: "adm-badge-green", Inactive: "adm-badge-gray",
    info: "adm-badge-blue", warning: "adm-badge-amber", critical: "adm-badge-red",
  };
  return <span className={`adm-badge ${map[text] ?? ""}`} style={color ? {} : undefined}>{text}</span>;
}

function Pill({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="adm-perm-pill">
      {label.replace(/_/g, " ")}
      {onRemove && <button onClick={onRemove} aria-label="Remove"><X size={10} /></button>}
    </span>
  );
}

function SectionCard({ icon: Icon, label, value, sub, accent }: {
  icon: typeof Users; label: string; value: string | number; sub: string; accent: string;
}) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-icon" style={{ background: accent + "1a", color: accent }}>
        <Icon size={18} />
      </div>
      <div>
        <span className="adm-stat-label">{label}</span>
        <strong className="adm-stat-value">{value}</strong>
        <small className="adm-stat-sub">{sub}</small>
      </div>
    </div>
  );
}

function Modal({ title, sub, onClose, children, wide }: {
  title: string; sub?: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div
        className={`adm-modal${wide ? " adm-modal-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal-head">
          <div>
            <h2 className="adm-modal-title">{title}</h2>
            {sub && <p className="adm-modal-sub">{sub}</p>}
          </div>
          <button className="adm-modal-close icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Dashboard View ─────────────────────────────────────── */
function AdminDashboard({ users, onNavigate }: { users: AdminUser[]; onNavigate: (s: Section) => void }) {
  const active = users.filter((u) => u.status === "Active").length;
  const departments = seedDepts.length;
  const roles = seedRoles.length;
  const pendingLogs = seedLogs.filter((l) => l.severity === "critical" || l.severity === "warning").length;

  const recentActivity = seedLogs.slice(0, 5);

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / DASHBOARD"
        title="System Overview"
        copy="Monitor user activity, system health, and administrative operations."
      />

      <div className="adm-stat-grid">
        <SectionCard icon={Users}      label="Total Users"         value={users.length} sub={`${active} active`}         accent="#2563eb" />
        <SectionCard icon={Shield}     label="Roles Defined"       value={roles}        sub="across all departments"      accent="#7c3aed" />
        <SectionCard icon={Package}    label="Departments"         value={departments}  sub="7 active"                    accent="#16a34a" />
        <SectionCard icon={AlertTriangle} label="Security Alerts"  value={pendingLogs}  sub="requires attention"          accent="#d97706" />
      </div>

      <div className="adm-dash-grid">
        {/* Recent Activity */}
        <div className="panel adm-panel">
          <div className="adm-panel-head">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest system and user actions</p>
            </div>
            <button className="text-button" onClick={() => onNavigate("Audit Logs")}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="adm-activity-list">
            {recentActivity.map((log) => (
              <div key={log.id} className="adm-activity-row">
                <span className={`adm-activity-dot adm-dot-${log.severity}`} />
                <span className="adm-activity-info">
                  <strong>{log.actor}</strong>
                  <small>{log.action} · <em>{log.target}</em></small>
                </span>
                <time>{log.time}</time>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="panel adm-panel">
          <div className="adm-panel-head">
            <div><h2>System Health</h2><p>Real-time service status</p></div>
            <button className="adm-refresh-btn"><RefreshCw size={14} /></button>
          </div>
          <div className="adm-health-list">
            {[
              { name: "Application Server",  status: "Online",  pct: 98,  color: "#16a34a" },
              { name: "Database Server",      status: "Online",  pct: 97,  color: "#16a34a" },
              { name: "File Storage",         status: "Online",  pct: 84,  color: "#2563eb" },
              { name: "Email Service",        status: "Online",  pct: 100, color: "#16a34a" },
              { name: "Backup Service",       status: "Online",  pct: 100, color: "#16a34a" },
            ].map((svc) => (
              <div key={svc.name} className="adm-health-row">
                <Server size={14} style={{ color: svc.color, flexShrink: 0 }} />
                <span className="adm-health-name">{svc.name}</span>
                <div className="adm-health-bar">
                  <div style={{ width: `${svc.pct}%`, background: svc.color }} />
                </div>
                <span className="adm-health-pct">{svc.pct}%</span>
                <span className="adm-badge adm-badge-green" style={{ fontSize: 9 }}>{svc.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Alerts */}
        <div className="panel adm-panel">
          <div className="adm-panel-head">
            <div><h2>Security Alerts</h2><p>Issues requiring attention</p></div>
          </div>
          <div className="adm-alert-list">
            {seedLogs.filter((l) => l.severity !== "info").map((log) => (
              <div key={log.id} className={`adm-alert-row adm-alert-${log.severity}`}>
                <AlertTriangle size={14} />
                <span>
                  <strong>{log.action}</strong>
                  <small>{log.actor} · {log.ip} · {log.time}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel adm-panel">
          <div className="adm-panel-head">
            <div><h2>Quick Actions</h2><p>Common administrative tasks</p></div>
          </div>
          <div className="adm-quick-list">
            {([
              ["User Management",       UserPlus,   "Add or manage system users"],
              ["Roles & Permissions",   Shield,     "Update access controls"],
              ["Department Management", Package,    "Manage departments & heads"],
              ["System Settings",       Settings,   "Company info & configuration"],
              ["Backup & Health",       Database,   "Backup and health status"],
              ["Audit Logs",            Activity,   "View system audit trail"],
            ] as [Section, typeof Users, string][]).map(([section, Icon, desc]) => (
              <button key={section} className="adm-quick-item" onClick={() => onNavigate(section)}>
                <Icon size={15} />
                <span>
                  <strong>{section}</strong>
                  <small>{desc}</small>
                </span>
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


/* ─── User Management ────────────────────────────────────── */
function UserManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [users, setUsers] = useState<AdminUser[]>(seedUsers);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [modal, setModal] = useState<"create" | "edit" | "reset" | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "", department: "", employeeId: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = users.filter((u) => {
    const matchQ = `${u.name} ${u.email} ${u.role} ${u.id}`.toLowerCase().includes(query.toLowerCase());
    const matchS = filterStatus === "All" || u.status === filterStatus;
    const matchD = filterDept === "All" || u.department === filterDept;
    return matchQ && matchS && matchD;
  });

  const depts = Array.from(new Set(users.map((u) => u.department)));

  function openCreate() {
    setForm({ name: "", email: "", role: "", department: "", employeeId: `CHN-EMP-${Date.now().toString().slice(-3)}`, password: "" });
    setErrors({});
    setModal("create");
  }

  function openEdit(u: AdminUser) {
    setSelected(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department, employeeId: u.id, password: "" });
    setErrors({});
    setModal("edit");
  }

  function openReset(u: AdminUser) {
    setSelected(u);
    setForm((f) => ({ ...f, password: "" }));
    setModal("reset");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.role.trim()) e.role = "Role is required";
    if (!form.department.trim()) e.department = "Department is required";
    if (modal === "create" && !form.password.trim()) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (modal === "create") {
      const nu: AdminUser = { id: form.employeeId, name: form.name, email: form.email, role: form.role, department: form.department, status: "Active", lastLogin: "Never", joined: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) };
      setUsers((p) => [nu, ...p]);
      onNotify("User account created successfully.");
    } else if (modal === "edit" && selected) {
      setUsers((p) => p.map((u) => u.id === selected.id ? { ...u, name: form.name, email: form.email, role: form.role, department: form.department } : u));
      onNotify("User account updated.");
    } else if (modal === "reset" && selected) {
      onNotify(`Password reset for ${selected.name}.`);
    }
    setModal(null);
  }

  function toggleStatus(u: AdminUser) {
    setUsers((p) => p.map((x) => x.id === u.id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x));
    onNotify(`${u.name} account ${u.status === "Active" ? "deactivated" : "activated"}.`);
  }

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / USER MANAGEMENT"
        title="User Management"
        copy="Create, edit, and manage all system user accounts, roles, and access."
        action="Add user"
        onAction={openCreate}
      />

      {/* Stats */}
      <div className="adm-stat-grid adm-stat-grid-3">
        <SectionCard icon={Users}     label="Total Users"    value={users.length}                                      sub="in the system"           accent="#2563eb" />
        <SectionCard icon={UserCheck} label="Active Users"   value={users.filter((u) => u.status === "Active").length}  sub="currently active"        accent="#16a34a" />
        <SectionCard icon={UserMinus} label="Inactive Users" value={users.filter((u) => u.status === "Inactive").length} sub="deactivated accounts"   accent="#dc2626" />
      </div>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={14} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" />
          {query && <button onClick={() => setQuery("")}><X size={13} /></button>}
        </label>
        <div className="adm-filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="All">All Departments</option>
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="panel adm-table-panel">
        <div className="table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Role</th>
                <th>Department</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state" style={{ minHeight: 120 }}><Users size={28} /><h3>No users found</h3></div></td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar">{u.name.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td><code className="adm-code">{u.id}</code></td>
                  <td>{u.role}</td>
                  <td>{u.department}</td>
                  <td>{u.lastLogin}</td>
                  <td><Badge text={u.status} color="" /></td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-icon-btn" title="Edit user" onClick={() => openEdit(u)}><Edit2 size={14} /></button>
                      <button className="adm-icon-btn" title="Reset password" onClick={() => openReset(u)}><Key size={14} /></button>
                      <button
                        className={`adm-icon-btn ${u.status === "Active" ? "adm-icon-btn-danger" : "adm-icon-btn-success"}`}
                        title={u.status === "Active" ? "Deactivate" : "Activate"}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.status === "Active" ? <UserMinus size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-table-footer">
          <span>Showing {filtered.length} of {users.length} users</span>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "create" ? "Add New User" : "Edit User Account"}
          sub={modal === "create" ? "Create a new system user account and assign role." : "Update user information and role assignment."}
          onClose={() => setModal(null)}
          wide
        >
          <form className="adm-modal-form" onSubmit={handleSave}>
            <div className="adm-form-grid">
              <label className="adm-form-field">
                <span>Full Name <b className="adm-req">*</b></span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Ahmad Khan" />
                {errors.name && <em className="adm-form-error">{errors.name}</em>}
              </label>
              <label className="adm-form-field">
                <span>Email Address <b className="adm-req">*</b></span>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@demo.chinar.tv" />
                {errors.email && <em className="adm-form-error">{errors.email}</em>}
              </label>
              <label className="adm-form-field">
                <span>Role / Job Title <b className="adm-req">*</b></span>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="">Select role</option>
                  {seedRoles.map((r) => <option key={r.id}>{r.name}</option>)}
                </select>
                {errors.role && <em className="adm-form-error">{errors.role}</em>}
              </label>
              <label className="adm-form-field">
                <span>Department <b className="adm-req">*</b></span>
                <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                  <option value="">Select department</option>
                  {seedDepts.map((d) => <option key={d.id}>{d.name}</option>)}
                </select>
                {errors.department && <em className="adm-form-error">{errors.department}</em>}
              </label>
              <label className="adm-form-field">
                <span>Employee ID</span>
                <input value={form.employeeId} readOnly className="adm-readonly" />
                <small className="adm-form-hint">Auto-generated, read-only</small>
              </label>
              {modal === "create" && (
                <label className="adm-form-field">
                  <span>Temporary Password <b className="adm-req">*</b></span>
                  <div className="adm-pw-field">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 8 characters"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <em className="adm-form-error">{errors.password}</em>}
                </label>
              )}
            </div>
            <div className="adm-modal-actions">
              <button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="button button-primary">
                {modal === "create" ? <><UserPlus size={14} /> Create Account</> : <><CheckCircle2 size={14} /> Save Changes</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {modal === "reset" && selected && (
        <Modal title="Reset Password" sub={`Reset the password for ${selected.name}`} onClose={() => setModal(null)}>
          <form className="adm-modal-form" onSubmit={handleSave}>
            <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="adm-info-box">
                <Lock size={14} />
                <span>A new temporary password will be assigned. The user must change it on next login.</span>
              </div>
              <label className="adm-form-field">
                <span>New Password <b className="adm-req">*</b></span>
                <div className="adm-pw-field">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
            </div>
            <div className="adm-modal-actions">
              <button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="button button-primary"><Key size={14} /> Reset Password</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}


/* ─── Roles & Permissions ────────────────────────────────── */
function RolesPermissions({ onNotify }: { onNotify: (msg: string) => void }) {
  const [roles, setRoles] = useState<Role[]>(seedRoles);
  const [selected, setSelected] = useState<Role | null>(null);
  const [modal, setModal] = useState<"view" | "edit" | "create" | "delete" | null>(null);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });

  function openView(r: Role)   { setSelected(r); setModal("view"); }
  function openEdit(r: Role)   { setSelected(r); setForm({ name: r.name, description: r.description, permissions: [...r.permissions] }); setModal("edit"); }
  function openCreate()        { setForm({ name: "", description: "", permissions: [] }); setModal("create"); }
  function openDelete(r: Role) { setSelected(r); setModal("delete"); }

  function togglePerm(p: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p],
    }));
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (modal === "create") {
      setRoles((r) => [...r, { id: `r${Date.now()}`, name: form.name, description: form.description, users: 0, permissions: form.permissions, color: "#2563eb" }]);
      onNotify("Role created.");
    } else if (modal === "edit" && selected) {
      setRoles((r) => r.map((x) => x.id === selected.id ? { ...x, name: form.name, description: form.description, permissions: form.permissions } : x));
      onNotify("Role updated.");
    }
    setModal(null);
  }

  function confirmDelete() {
    if (!selected) return;
    setRoles((r) => r.filter((x) => x.id !== selected.id));
    onNotify("Role deleted.");
    setModal(null);
  }

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / ROLES & PERMISSIONS"
        title="Roles & Permissions"
        copy="Define and manage role-based access controls for all system users."
        action="Create role"
        onAction={openCreate}
      />

      <div className="adm-roles-grid">
        {roles.map((r) => (
          <div key={r.id} className="adm-role-card">
            <div className="adm-role-header">
              <div className="adm-role-icon" style={{ background: r.color + "18", color: r.color }}>
                <Shield size={18} />
              </div>
              <div className="adm-role-meta">
                <strong>{r.name}</strong>
                <small>{r.users} user{r.users !== 1 ? "s" : ""}</small>
              </div>
              <div className="adm-row-actions" style={{ marginLeft: "auto" }}>
                <button className="adm-icon-btn" title="View permissions" onClick={() => openView(r)}><Eye size={14} /></button>
                <button className="adm-icon-btn" title="Edit role" onClick={() => openEdit(r)}><Edit2 size={14} /></button>
                <button className="adm-icon-btn adm-icon-btn-danger" title="Delete role" onClick={() => openDelete(r)}><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="adm-role-desc">{r.description}</p>
            <div className="adm-role-perms">
              {r.permissions.slice(0, 3).map((p) => <Pill key={p} label={p} />)}
              {r.permissions.length > 3 && <span className="adm-perm-more">+{r.permissions.length - 3} more</span>}
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {modal === "view" && selected && (
        <Modal title={selected.name} sub="All assigned permissions for this role" onClose={() => setModal(null)} wide>
          <div className="adm-modal-body">
            <p className="adm-modal-desc">{selected.description}</p>
            <div className="adm-perm-grid">
              {allPermissions.map((p) => (
                <div key={p} className={`adm-perm-row ${selected.permissions.includes(p) ? "adm-perm-granted" : "adm-perm-denied"}`}>
                  {selected.permissions.includes(p) ? <CheckCircle2 size={13} /> : <X size={13} />}
                  <span>{p.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="adm-modal-actions">
            <button className="button button-secondary" onClick={() => setModal(null)}>Close</button>
            <button className="button button-primary" onClick={() => { setModal(null); openEdit(selected); }}><Edit2 size={14} /> Edit Role</button>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "create" ? "Create New Role" : "Edit Role"}
          sub="Define the name, description, and permissions for this role."
          onClose={() => setModal(null)}
          wide
        >
          <form className="adm-modal-form" onSubmit={handleSave}>
            <div className="adm-form-grid">
              <label className="adm-form-field adm-field-span">
                <span>Role Name <b className="adm-req">*</b></span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Senior Editor" required />
              </label>
              <label className="adm-form-field adm-field-span">
                <span>Description</span>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description of this role" />
              </label>
            </div>
            <div className="adm-perm-section">
              <p className="adm-perm-section-title">Permissions</p>
              <div className="adm-perm-grid">
                {allPermissions.map((p) => (
                  <label key={p} className={`adm-perm-check ${form.permissions.includes(p) ? "adm-perm-checked" : ""}`}>
                    <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePerm(p)} />
                    {p.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
            </div>
            <div className="adm-modal-actions">
              <button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="button button-primary">
                {modal === "create" ? <><Plus size={14} /> Create Role</> : <><CheckCircle2 size={14} /> Save Changes</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {modal === "delete" && selected && (
        <Modal title="Delete Role" sub={`Are you sure you want to delete the "${selected.name}" role?`} onClose={() => setModal(null)}>
          <div className="adm-modal-body">
            <div className="adm-danger-box">
              <AlertTriangle size={16} />
              <span>This action cannot be undone. Users assigned to this role will lose their permissions.</span>
            </div>
          </div>
          <div className="adm-modal-actions">
            <button className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="button adm-btn-danger" onClick={confirmDelete}><Trash2 size={14} /> Delete Role</button>
          </div>
        </Modal>
      )}
    </section>
  );
}

/* ─── Department Management ──────────────────────────────── */
function DepartmentManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [depts, setDepts] = useState<Department[]>(seedDepts);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", head: "", status: "Active" as "Active" | "Inactive" });

  function openCreate() { setForm({ name: "", head: "", status: "Active" }); setModal("create"); }
  function openEdit(d: Department) { setSelected(d); setForm({ name: d.name, head: d.head, status: d.status }); setModal("edit"); }
  function openDelete(d: Department) { setSelected(d); setModal("delete"); }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.head.trim()) return;
    if (modal === "create") {
      setDepts((p) => [...p, { id: `d${Date.now()}`, name: form.name, head: form.head, employees: 0, projects: 0, status: form.status }]);
      onNotify("Department created.");
    } else if (modal === "edit" && selected) {
      setDepts((p) => p.map((d) => d.id === selected.id ? { ...d, name: form.name, head: form.head, status: form.status } : d));
      onNotify("Department updated.");
    }
    setModal(null);
  }

  function confirmDelete() {
    if (!selected) return;
    setDepts((p) => p.filter((d) => d.id !== selected.id));
    onNotify("Department deleted.");
    setModal(null);
  }

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / DEPARTMENTS"
        title="Department Management"
        copy="Create and manage company departments, assign heads and monitor team size."
        action="Add department"
        onAction={openCreate}
      />

      <div className="adm-stat-grid adm-stat-grid-3">
        <SectionCard icon={Package}   label="Total Departments" value={depts.length}                                        sub="company-wide"         accent="#2563eb" />
        <SectionCard icon={Users}     label="Total Employees"   value={depts.reduce((a, d) => a + d.employees, 0)}           sub="across all depts"     accent="#16a34a" />
        <SectionCard icon={ClipboardList} label="Active Projects" value={depts.reduce((a, d) => a + d.projects, 0)}          sub="currently running"    accent="#7c3aed" />
      </div>

      <div className="panel adm-table-panel">
        <div className="table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Department Head</th>
                <th>Employees</th>
                <th>Active Projects</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {depts.map((d) => (
                <tr key={d.id}>
                  <td><strong style={{ color: "var(--ink)" }}>{d.name}</strong></td>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar adm-avatar-sm">{d.head.slice(0, 2).toUpperCase()}</div>
                      {d.head}
                    </div>
                  </td>
                  <td>{d.employees}</td>
                  <td>{d.projects}</td>
                  <td><Badge text={d.status} color="" /></td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-icon-btn" title="Edit" onClick={() => openEdit(d)}><Edit2 size={14} /></button>
                      <button className="adm-icon-btn adm-icon-btn-danger" title="Delete" onClick={() => openDelete(d)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "create" ? "Add Department" : "Edit Department"}
          sub="Fill in the details for this department."
          onClose={() => setModal(null)}
        >
          <form className="adm-modal-form" onSubmit={handleSave}>
            <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <label className="adm-form-field">
                <span>Department Name <b className="adm-req">*</b></span>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Marketing" />
              </label>
              <label className="adm-form-field">
                <span>Department Head <b className="adm-req">*</b></span>
                <select value={form.head} onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))}>
                  <option value="">Select head</option>
                  {seedUsers.map((u) => <option key={u.id}>{u.name}</option>)}
                </select>
              </label>
              <label className="adm-form-field">
                <span>Status</span>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "Active" | "Inactive" }))}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>
            <div className="adm-modal-actions">
              <button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="button button-primary">
                {modal === "create" ? <><Plus size={14} /> Add Department</> : <><CheckCircle2 size={14} /> Save Changes</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Delete Department" sub={`Delete "${selected.name}"? This cannot be undone.`} onClose={() => setModal(null)}>
          <div className="adm-modal-body">
            <div className="adm-danger-box"><AlertTriangle size={16} /><span>All associated data will be unlinked.</span></div>
          </div>
          <div className="adm-modal-actions">
            <button className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="button adm-btn-danger" onClick={confirmDelete}><Trash2 size={14} /> Delete</button>
          </div>
        </Modal>
      )}
    </section>
  );
}


/* ─── Notifications ──────────────────────────────────────── */
const notifSettings = [
  { id: "ns1", category: "Projects",       label: "New project submissions",    email: true,  inApp: true  },
  { id: "ns2", category: "Projects",       label: "Project status changes",     email: false, inApp: true  },
  { id: "ns3", category: "Finance",        label: "Invoice approvals",          email: true,  inApp: true  },
  { id: "ns4", category: "Finance",        label: "Expense submissions",        email: false, inApp: true  },
  { id: "ns5", category: "Security",       label: "Failed login attempts",      email: true,  inApp: true  },
  { id: "ns6", category: "Security",       label: "Account changes",            email: true,  inApp: true  },
  { id: "ns7", category: "System",         label: "Backup completion",          email: true,  inApp: false },
  { id: "ns8", category: "System",         label: "System health alerts",       email: true,  inApp: true  },
  { id: "ns9", category: "HR",             label: "Leave request approvals",    email: false, inApp: true  },
];

function NotificationsAdmin({ onNotify }: { onNotify: (msg: string) => void }) {
  const [settings, setSettings] = useState(notifSettings);
  const [saved, setSaved] = useState(false);

  function toggle(id: string, field: "email" | "inApp") {
    setSettings((s) => s.map((x) => x.id === id ? { ...x, [field]: !x[field as keyof typeof x] } : x));
    setSaved(false);
  }

  function save() {
    setSaved(true);
    onNotify("Notification settings saved.");
    setTimeout(() => setSaved(false), 2500);
  }

  const categories = Array.from(new Set(settings.map((s) => s.category)));

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / NOTIFICATIONS"
        title="Notification Settings"
        copy="Configure which system events trigger email or in-app notifications."
      />

      {/* System Alerts */}
      <div className="panel adm-panel adm-mb">
        <div className="adm-panel-head">
          <div><h2>System Alerts</h2><p>Recent system-level notifications</p></div>
        </div>
        <div className="adm-notif-alert-list">
          {seedLogs.slice(0, 4).map((log) => (
            <div key={log.id} className={`adm-notif-alert adm-notif-${log.severity}`}>
              <Bell size={14} />
              <span>
                <strong>{log.action}</strong>
                <small>{log.actor} · {log.time}</small>
              </span>
              <span className={`adm-badge adm-badge-${log.severity === "critical" ? "red" : log.severity === "warning" ? "amber" : "blue"}`}>
                {log.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="panel adm-panel">
        <div className="adm-panel-head">
          <div><h2>Notification Preferences</h2><p>Choose how you receive different types of system events</p></div>
          <button className={`button ${saved ? "button-secondary" : "button-primary"}`} onClick={save}>
            {saved ? <><CheckCircle2 size={14} /> Saved</> : "Save Settings"}
          </button>
        </div>

        {categories.map((cat) => (
          <div key={cat} className="adm-notif-section">
            <h3 className="adm-notif-cat">{cat}</h3>
            <div className="adm-notif-table">
              <div className="adm-notif-head">
                <span>Event</span>
                <span>Email</span>
                <span>In-App</span>
              </div>
              {settings.filter((s) => s.category === cat).map((s) => (
                <div key={s.id} className="adm-notif-row">
                  <span>{s.label}</span>
                  <span>
                    <button
                      className={`adm-toggle ${s.email ? "adm-toggle-on" : ""}`}
                      onClick={() => toggle(s.id, "email")}
                      aria-pressed={s.email}
                    >
                      <span />
                    </button>
                  </span>
                  <span>
                    <button
                      className={`adm-toggle ${s.inApp ? "adm-toggle-on" : ""}`}
                      onClick={() => toggle(s.id, "inApp")}
                      aria-pressed={s.inApp}
                    >
                      <span />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Audit Logs ─────────────────────────────────────────── */
function AuditLogs() {
  const [query, setQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = seedLogs.filter((l) => {
    const matchQ = `${l.actor} ${l.action} ${l.target} ${l.ip}`.toLowerCase().includes(query.toLowerCase());
    const matchS = filterSeverity === "All" || l.severity === filterSeverity;
    return matchQ && matchS;
  });

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / AUDIT LOGS"
        title="Audit Logs"
        copy="Track all administrative actions, logins, permission changes, and system events."
      />

      <div className="adm-stat-grid adm-stat-grid-3">
        <SectionCard icon={Activity}       label="Total Entries"    value={seedLogs.length}                                          sub="all time"         accent="#2563eb" />
        <SectionCard icon={AlertTriangle}  label="Warnings"         value={seedLogs.filter((l) => l.severity === "warning").length}   sub="require review"   accent="#d97706" />
        <SectionCard icon={Shield}         label="Critical"         value={seedLogs.filter((l) => l.severity === "critical").length}  sub="immediate action" accent="#dc2626" />
      </div>

      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={14} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search logs…" />
          {query && <button onClick={() => setQuery("")}><X size={13} /></button>}
        </label>
        <div className="adm-filters">
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="All">All Severity</option>
            <option>info</option>
            <option>warning</option>
            <option>critical</option>
          </select>
        </div>
      </div>

      <div className="panel adm-table-panel">
        <div className="table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>IP Address</th>
                <th>Time</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state" style={{ minHeight: 100 }}><Activity size={26} /><h3>No logs found</h3></div></td></tr>
              )}
              {filtered.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    className={`adm-log-row adm-log-${log.severity} ${expanded === log.id ? "adm-log-expanded" : ""}`}
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td><code className="adm-code">{log.id}</code></td>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-avatar adm-avatar-sm">{log.actor.slice(0, 2).toUpperCase()}</div>
                        {log.actor}
                      </div>
                    </td>
                    <td>{log.action}</td>
                    <td><code className="adm-code">{log.target}</code></td>
                    <td><span className="adm-ip">{log.ip}</span></td>
                    <td>{log.time}</td>
                    <td>
                      <span className={`adm-badge adm-badge-${log.severity === "critical" ? "red" : log.severity === "warning" ? "amber" : "blue"}`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr className="adm-log-detail-row">
                      <td colSpan={7}>
                        <div className="adm-log-detail">
                          <span><strong>Full entry:</strong> {log.actor} performed "{log.action}" on {log.target} from {log.ip} at {log.time}.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-table-footer"><span>Showing {filtered.length} of {seedLogs.length} entries</span></div>
      </div>
    </section>
  );
}


/* ─── Documents & Templates ──────────────────────────────── */
function DocumentsTemplates({ onNotify }: { onNotify: (msg: string) => void }) {
  const [docs, setDocs] = useState<AdminDocument[]>(seedDocuments);
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [modal, setModal] = useState<"upload" | "delete" | null>(null);
  const [selected, setSelected] = useState<AdminDocument | null>(null);
  const [form, setForm] = useState({ name: "", type: "PDF", category: "Company", author: "Mohammad Wali" });

  const categories = Array.from(new Set(docs.map((d) => d.category)));

  const filtered = docs.filter((d) => {
    const matchQ = `${d.name} ${d.author} ${d.category}`.toLowerCase().includes(query.toLowerCase());
    const matchC = filterCat === "All" || d.category === filterCat;
    return matchQ && matchC;
  });

  function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const nd: AdminDocument = {
      id: `DOC-${String(Date.now()).slice(-3)}`,
      name: form.name,
      type: form.type,
      category: form.category,
      size: "—",
      updated: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      author: form.author,
    };
    setDocs((p) => [nd, ...p]);
    setModal(null);
    onNotify("Document uploaded.");
  }

  function handleDelete() {
    if (!selected) return;
    setDocs((p) => p.filter((d) => d.id !== selected.id));
    setModal(null);
    onNotify("Document deleted.");
  }

  const typeIcon = (type: string) => {
    if (type === "PDF") return "📄";
    if (type === "DOCX") return "📝";
    if (type === "ZIP") return "🗜️";
    return "📁";
  };

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / DOCUMENTS"
        title="Documents & Templates"
        copy="Manage shared company documents, policy files, and reusable document templates."
        action="Upload document"
        onAction={() => { setForm({ name: "", type: "PDF", category: "Company", author: "Mohammad Wali" }); setModal("upload"); }}
      />

      <div className="adm-stat-grid adm-stat-grid-4">
        {["Templates","HR","Policies","Archive"].map((cat) => (
          <SectionCard
            key={cat}
            icon={FileText}
            label={cat}
            value={docs.filter((d) => d.category === cat).length}
            sub="documents"
            accent="#2563eb"
          />
        ))}
      </div>

      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={14} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents…" />
          {query && <button onClick={() => setQuery("")}><X size={13} /></button>}
        </label>
        <div className="adm-filters">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="adm-docs-grid">
        {filtered.map((doc) => (
          <div key={doc.id} className="adm-doc-card">
            <div className="adm-doc-icon">{typeIcon(doc.type)}</div>
            <div className="adm-doc-meta">
              <strong>{doc.name}</strong>
              <small>{doc.category} · {doc.type} · {doc.size}</small>
              <small>Updated {doc.updated} by {doc.author}</small>
            </div>
            <div className="adm-row-actions adm-doc-actions">
              <button className="adm-icon-btn" title="Download"><Archive size={14} /></button>
              <button
                className="adm-icon-btn adm-icon-btn-danger"
                title="Delete"
                onClick={() => { setSelected(doc); setModal("delete"); }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1/-1", minHeight: 120 }}>
            <FileText size={28} /><h3>No documents found</h3>
          </div>
        )}
      </div>

      {modal === "upload" && (
        <Modal title="Upload Document" sub="Add a new document or template to the system." onClose={() => setModal(null)}>
          <form className="adm-modal-form" onSubmit={handleUpload}>
            <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <label className="adm-form-field">
                <span>Document Name <b className="adm-req">*</b></span>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Travel Policy 2026" />
              </label>
              <label className="adm-form-field">
                <span>File Type</span>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option>PDF</option><option>DOCX</option><option>XLSX</option><option>ZIP</option>
                </select>
              </label>
              <label className="adm-form-field">
                <span>Category</span>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option>Company</option><option>HR</option><option>Policies</option><option>Templates</option><option>Archive</option>
                </select>
              </label>
              <div className="adm-upload-zone">
                <Upload size={22} />
                <strong>Click to select file</strong>
                <small>PDF, DOCX, XLSX, ZIP up to 50 MB</small>
              </div>
            </div>
            <div className="adm-modal-actions">
              <button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="button button-primary"><Upload size={14} /> Upload</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="Delete Document" sub={`Delete "${selected.name}"?`} onClose={() => setModal(null)}>
          <div className="adm-modal-body">
            <div className="adm-danger-box"><AlertTriangle size={16} /><span>This document will be permanently removed.</span></div>
          </div>
          <div className="adm-modal-actions">
            <button className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="button adm-btn-danger" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
          </div>
        </Modal>
      )}
    </section>
  );
}


/* ─── System Settings ────────────────────────────────────── */
function SystemSettings({ onNotify }: { onNotify: (msg: string) => void }) {
  const [settings, setSettings] = useState({
    companyName: "Chinar Media & Creative Studio",
    companyEmail: "info@chinar.tv",
    companyPhone: "+93 700 000 000",
    companyAddress: "Kabul, Afghanistan",
    website: "https://chinar.tv",
    currency: "USD",
    dateFormat: "DD MMM YYYY",
    timezone: "Asia/Kabul (UTC+4:30)",
    employeeIdFormat: "CHN-{DEPT}-{NUM}",
    projectIdFormat: "PRJ-{YEAR}-{NUM}",
    invoiceIdFormat: "INV-{YEAR}-{NUM}",
    quotationIdFormat: "QTN-{YEAR}-{NUM}",
    maxFileSize: "50",
    sessionTimeout: "60",
    twoFactor: false,
    passwordExpiry: "90",
  });
  const [saved, setSaved] = useState(false);

  function update(key: keyof typeof settings, value: string | boolean) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function save() {
    setSaved(true);
    onNotify("System settings saved.");
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / SYSTEM SETTINGS"
        title="System Settings"
        copy="Configure company information, currency, ID formats, and system preferences."
      />

      <div className="adm-settings-grid">
        {/* Company Information */}
        <div className="panel adm-panel adm-settings-section">
          <div className="adm-panel-head">
            <div><h2>Company Information</h2><p>Core company profile and contact details</p></div>
          </div>
          <div className="adm-form-grid">
            {([
              ["companyName", "Company Name", "text", ""],
              ["companyEmail", "Company Email", "email", ""],
              ["companyPhone", "Phone Number", "text", ""],
              ["companyAddress", "Address", "text", ""],
              ["website", "Website URL", "url", ""],
            ] as [keyof typeof settings, string, string, string][]).map(([key, label, type]) => (
              <label key={key} className="adm-form-field">
                <span>{label}</span>
                <input type={type} value={String(settings[key])} onChange={(e) => update(key, e.target.value)} />
              </label>
            ))}
            <div className="adm-form-field">
              <span>Company Logo</span>
              <div className="adm-logo-row">
                <img src="/assets/chinar-logo.png" alt="Logo" className="adm-logo-preview" />
                <button className="button button-secondary adm-logo-btn"><Upload size={13} /> Change Logo</button>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="panel adm-panel adm-settings-section">
          <div className="adm-panel-head">
            <div><h2>Regional Settings</h2><p>Currency, date format, and timezone</p></div>
          </div>
          <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <label className="adm-form-field">
              <span>Currency</span>
              <select value={settings.currency} onChange={(e) => update("currency", e.target.value)}>
                <option value="USD">USD — US Dollar</option>
                <option value="AFN">AFN — Afghan Afghani</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
              <small className="adm-form-hint">Used for all financial displays</small>
            </label>
            <label className="adm-form-field">
              <span>Date Format</span>
              <select value={settings.dateFormat} onChange={(e) => update("dateFormat", e.target.value)}>
                <option>DD MMM YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
                <option>DD/MM/YYYY</option>
              </select>
            </label>
            <label className="adm-form-field">
              <span>Timezone</span>
              <select value={settings.timezone} onChange={(e) => update("timezone", e.target.value)}>
                <option>Asia/Kabul (UTC+4:30)</option>
                <option>UTC+0:00</option>
                <option>UTC+5:30</option>
                <option>UTC+3:00</option>
              </select>
            </label>
          </div>
        </div>

        {/* ID Formats */}
        <div className="panel adm-panel adm-settings-section">
          <div className="adm-panel-head">
            <div><h2>ID Formats</h2><p>Define how employee and record IDs are generated</p></div>
          </div>
          <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            {([
              ["employeeIdFormat",   "Employee ID Format"],
              ["projectIdFormat",    "Project ID Format"],
              ["invoiceIdFormat",    "Invoice ID Format"],
              ["quotationIdFormat",  "Quotation ID Format"],
            ] as [keyof typeof settings, string][]).map(([key, label]) => (
              <label key={key} className="adm-form-field">
                <span>{label}</span>
                <input value={String(settings[key])} onChange={(e) => update(key, e.target.value)} />
                <small className="adm-form-hint">Use {"{DEPT}"}, {"{YEAR}"}, {"{NUM}"} as placeholders</small>
              </label>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="panel adm-panel adm-settings-section">
          <div className="adm-panel-head">
            <div><h2>Security Settings</h2><p>Configure session and password policies</p></div>
          </div>
          <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <label className="adm-form-field">
              <span>Session Timeout (minutes)</span>
              <input type="number" min={5} max={480} value={settings.sessionTimeout} onChange={(e) => update("sessionTimeout", e.target.value)} />
            </label>
            <label className="adm-form-field">
              <span>Password Expiry (days)</span>
              <input type="number" min={30} max={365} value={settings.passwordExpiry} onChange={(e) => update("passwordExpiry", e.target.value)} />
              <small className="adm-form-hint">Set 0 to disable expiry</small>
            </label>
            <label className="adm-form-field">
              <span>Max File Upload Size (MB)</span>
              <input type="number" min={1} max={200} value={settings.maxFileSize} onChange={(e) => update("maxFileSize", e.target.value)} />
            </label>
            <div className="adm-form-field">
              <span>Two-Factor Authentication</span>
              <div className="adm-toggle-row">
                <button
                  className={`adm-toggle ${settings.twoFactor ? "adm-toggle-on" : ""}`}
                  onClick={() => update("twoFactor", !settings.twoFactor)}
                  aria-pressed={settings.twoFactor}
                >
                  <span />
                </button>
                <small>{settings.twoFactor ? "Enabled for all users" : "Disabled"}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="adm-settings-actions">
        <button className="button button-secondary">Discard Changes</button>
        <button className={`button ${saved ? "button-secondary" : "button-primary"}`} onClick={save}>
          {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><CheckCircle2 size={14} /> Save Settings</>}
        </button>
      </div>
    </section>
  );
}


/* ─── Backup & System Health ─────────────────────────────── */
function BackupHealth({ onNotify }: { onNotify: (msg: string) => void }) {
  const [backing, setBacking] = useState(false);
  const [lastBackup, setLastBackup] = useState("22 Oct 2026, 02:00 AM");

  function runBackup() {
    setBacking(true);
    setTimeout(() => {
      setBacking(false);
      const now = new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      setLastBackup(now);
      onNotify("System backup completed successfully.");
    }, 2500);
  }

  const services = [
    { name: "Application Server",   uptime: "99.8%",  status: "Online",  icon: Monitor,   detail: "Node.js v20 · Next.js 15",    color: "#16a34a" },
    { name: "Database (PostgreSQL)", uptime: "99.9%",  status: "Online",  icon: Database,  detail: "v15.3 · 2.4 GB used",         color: "#16a34a" },
    { name: "File Storage",          uptime: "98.2%",  status: "Online",  icon: HardDrive, detail: "84% used · 42 GB / 50 GB",     color: "#d97706" },
    { name: "Email Service",         uptime: "100%",   status: "Online",  icon: Bell,      detail: "SMTP configured",              color: "#16a34a" },
    { name: "Backup Service",        uptime: "100%",   status: "Online",  icon: Server,    detail: `Last: ${lastBackup}`,          color: "#16a34a" },
  ];

  const backups = [
    { id: "BK-007", date: "22 Oct 2026", time: "02:00 AM", size: "148 MB", type: "Auto",   status: "Success" },
    { id: "BK-006", date: "21 Oct 2026", time: "02:00 AM", size: "145 MB", type: "Auto",   status: "Success" },
    { id: "BK-005", date: "20 Oct 2026", time: "02:00 AM", size: "143 MB", type: "Auto",   status: "Success" },
    { id: "BK-004", date: "18 Oct 2026", time: "14:30 PM", size: "140 MB", type: "Manual", status: "Success" },
    { id: "BK-003", date: "15 Oct 2026", time: "02:00 AM", size: "138 MB", type: "Auto",   status: "Failed"  },
  ];

  const errorLogs = [
    { time: "Today 03:15",     level: "WARNING", msg: "High memory usage: 78% on app server" },
    { time: "Yesterday 22:41", level: "ERROR",   msg: "Backup BK-003 failed: disk space insufficient" },
    { time: "19 Oct 11:30",    level: "INFO",    msg: "Scheduled maintenance completed" },
  ];

  return (
    <section className="page-section adm-workspace">
      <PageHeader
        eyebrow="ADMINISTRATION / BACKUP & HEALTH"
        title="Backup & System Health"
        copy="Monitor infrastructure health, manage backups, and review system error logs."
      />

      {/* Health Overview */}
      <div className="adm-stat-grid">
        <SectionCard icon={Zap}      label="System Uptime"   value="99.8%"  sub="last 30 days"           accent="#16a34a" />
        <SectionCard icon={Database} label="Database Size"   value="2.4 GB" sub="42 GB storage used"      accent="#2563eb" />
        <SectionCard icon={HardDrive} label="Storage Used"   value="84%"    sub="42 / 50 GB"              accent="#d97706" />
        <SectionCard icon={Server}   label="Last Backup"     value="Today"  sub={lastBackup}              accent="#7c3aed" />
      </div>

      <div className="adm-backup-grid">
        {/* Services */}
        <div className="panel adm-panel">
          <div className="adm-panel-head">
            <div><h2>Service Status</h2><p>Real-time system component health</p></div>
            <button className="adm-refresh-btn" onClick={() => onNotify("Status refreshed.")}><RefreshCw size={14} /></button>
          </div>
          <div className="adm-service-list">
            {services.map((svc) => (
              <div key={svc.name} className="adm-service-row">
                <div className="adm-service-icon" style={{ color: svc.color, background: svc.color + "18" }}>
                  <svc.icon size={15} />
                </div>
                <div className="adm-service-info">
                  <strong>{svc.name}</strong>
                  <small>{svc.detail}</small>
                </div>
                <div className="adm-service-right">
                  <span className={`adm-badge ${svc.status === "Online" ? "adm-badge-green" : "adm-badge-red"}`}>{svc.status}</span>
                  <span className="adm-uptime">{svc.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup Panel */}
        <div className="panel adm-panel">
          <div className="adm-panel-head">
            <div><h2>Backup Management</h2><p>Schedule and restore system backups</p></div>
            <button className="button button-primary adm-backup-btn" onClick={runBackup} disabled={backing}>
              {backing ? <><RefreshCw size={13} className="adm-spin" /> Running…</> : <><Database size={13} /> Run Backup</>}
            </button>
          </div>
          <div className="table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Backup ID</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Restore</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id}>
                    <td><code className="adm-code">{b.id}</code></td>
                    <td>{b.date} · {b.time}</td>
                    <td>{b.size}</td>
                    <td><span className={`adm-badge ${b.type === "Auto" ? "adm-badge-blue" : "adm-badge-purple"}`}>{b.type}</span></td>
                    <td><span className={`adm-badge ${b.status === "Success" ? "adm-badge-green" : "adm-badge-red"}`}>{b.status}</span></td>
                    <td>
                      {b.status === "Success" && (
                        <button className="adm-icon-btn" title="Restore backup" onClick={() => onNotify(`Restore from ${b.id} initiated.`)}>
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error Logs */}
        <div className="panel adm-panel adm-panel-wide">
          <div className="adm-panel-head">
            <div><h2>System Error Logs</h2><p>Recent application warnings and errors</p></div>
          </div>
          <div className="adm-error-list">
            {errorLogs.map((e, i) => (
              <div key={i} className={`adm-error-row adm-error-${e.level.toLowerCase()}`}>
                <span className={`adm-badge adm-badge-${e.level === "ERROR" ? "red" : e.level === "WARNING" ? "amber" : "blue"}`}>{e.level}</span>
                <span className="adm-error-time">{e.time}</span>
                <span className="adm-error-msg">{e.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


/* ─── Main Export ────────────────────────────────────────── */
export function AdministrationPage({
  active,
  user,
  onNotify,
}: {
  active: string;
  user: UserType;
  onNotify: (msg: string) => void;
}) {
  const section = active as Section;

  if (section === "Dashboard")            return <AdminDashboard users={seedUsers} onNavigate={() => {}} />;
  if (section === "User Management")      return <UserManagement onNotify={onNotify} />;
  if (section === "Roles & Permissions")  return <RolesPermissions onNotify={onNotify} />;
  if (section === "Department Management") return <DepartmentManagement onNotify={onNotify} />;
  if (section === "Notifications")        return <NotificationsAdmin onNotify={onNotify} />;
  if (section === "Audit Logs")           return <AuditLogs />;
  if (section === "Documents & Templates") return <DocumentsTemplates onNotify={onNotify} />;
  if (section === "System Settings")      return <SystemSettings onNotify={onNotify} />;
  if (section === "Backup & System Health") return <BackupHealth onNotify={onNotify} />;

  return <AdminDashboard users={seedUsers} onNavigate={() => {}} />;
}

