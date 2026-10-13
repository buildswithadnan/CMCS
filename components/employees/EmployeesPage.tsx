"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { Activity, CalendarDays, CheckCircle2, Eye, EyeOff, Plus, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { Project, User } from "../../lib/types";
import { employeeAttendance, formatDate, users } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";

const employeeDepartments = ["CEO", "Head of Operations", "HR", "Finance", "Technical", "Production", "Administration"];
const roleByDepartment: Record<string, string[]> = {
  CEO: ["CEO / Founder Manager"],
  "Head of Operations": ["Head of Operations"],
  HR: ["HR Manager"],
  Finance: ["Finance Officer"],
  Technical: ["Employee"],
  Production: ["Employee"],
  Administration: ["System Administrator"],
};
const departmentCodes: Record<string, string> = { CEO: "CEO", "Head of Operations": "HOO", HR: "HR", Finance: "FIN", Technical: "TECH", Production: "PROD", Administration: "ADM" };

type NewEmployee = User & { username: string; designation: string; joiningDate: string; employmentType: string; accountStatus: string; photo?: string };

export function EmployeesPage({ projects, isAdministrator = false }: { projects: Project[]; isAdministrator?: boolean }) {
  const [from, setFrom] = useState("2026-10-07");
  const [to, setTo] = useState("2026-10-11");
  const [employee, setEmployee] = useState("All");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [createdEmployees, setCreatedEmployees] = useState<NewEmployee[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const employees = employeeAttendance.filter(
    (item) =>
      (employee === "All" || item.employee === employee) &&
      (department === "All" || item.department === department),
  );

  const records = employees.flatMap((item) =>
    item.records
      .filter(
        (record) =>
          record.date >= from &&
          record.date <= to &&
          (status === "All" || record.status === status),
      )
      .map((record) => ({
        ...record,
        employee: item.employee,
        department: item.department,
      })),
  );

  const completedProjects = employeeAttendance.reduce(
    (total, item) => total + item.completedProjects,
    0,
  );

  const completionRate = projects.length
    ? Math.round(
        projects.reduce((total, item) => total + item.progress, 0) /
          projects.length,
      )
    : 0;
  const directory = useMemo(() => [...Object.values(users).map((user) => ({ ...user, username: user.email.split("@")[0], designation: user.role, joiningDate: "2026-01-01", employmentType: "Full-time", accountStatus: "Active" })), ...createdEmployees], [createdEmployees]);

  return (
    <section className="page-section">
      <PageHeader
        eyebrow={isAdministrator ? "ADMINISTRATION / EMPLOYEES" : "PEOPLE / EMPLOYEES"}
        title="Employees"
        copy={isAdministrator ? "Create and manage employee accounts separately from operational approvals." : "Review employee attendance history and project completion performance."}
        action={isAdministrator ? "Add employee" : undefined}
        onAction={isAdministrator ? () => setShowAddEmployee(true) : undefined}
      />
      {isAdministrator && <div className="employee-admin-callout"><ShieldCheck size={17} /><span><strong>Administrator access</strong><small>Account access is managed here. Project leadership and financial approval permissions remain separate.</small></span></div>}
      {isAdministrator && <div className="panel employee-directory-panel"><div className="panel-heading"><div><h2>Employee directory</h2><p>{directory.length} employee accounts in the CMCS workspace.</p></div><button className="text-button" onClick={() => setShowAddEmployee(true)}><UserPlus size={14} /> Add employee</button></div><div className="employee-directory-grid">{directory.map((employee) => <article className="employee-directory-card" key={`${employee.email}-${employee.employeeId}`}><div className="employee-directory-avatar">{employee.firstName.slice(0, 2).toUpperCase()}</div><div><strong>{employee.name}</strong><small>{employee.designation}</small><span>{employee.department} · {employee.employeeId}</span></div><b className={`employee-account-status ${employee.accountStatus.toLowerCase()}`}>{employee.accountStatus}</b></article>)}</div></div>}
      <section className="stat-grid">
        <StatCard
          label="Employees tracked"
          value={String(employeeAttendance.length)}
          icon={Users}
        />
        <StatCard
          label="Completed projects"
          value={String(completedProjects)}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Overall project completion"
          value={`${completionRate}%`}
          icon={Activity}
          tone="indigo"
        />
        <StatCard
          label="Attendance records"
          value={String(records.length)}
          icon={CalendarDays}
          tone="purple"
        />
      </section>
      <div className="panel employee-filters">
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          Employee
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option>All</option>
            {employeeAttendance.map((item) => (
              <option key={item.employee}>{item.employee}</option>
            ))}
          </select>
        </label>
        <label>
          Department
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>All</option>
            {Array.from(
              new Set(employeeAttendance.map((item) => item.department)),
            ).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Attendance status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>
        </label>
      </div>
      <div className="panel employee-history">
        <div className="panel-heading">
          <div>
            <h2>Complete attendance history</h2>
            <p>{records.length} records match the selected filters.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Attendance</th>
                <th>Time</th>
                <th>Completed projects</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.employee}-${record.date}`}>
                  <td>{formatDate(record.date)}</td>
                  <td>
                    <strong>{record.employee}</strong>
                  </td>
                  <td>{record.department}</td>
                  <td>
                    <span
                      className={"status-pill " + record.status.toLowerCase()}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td>{record.time}</td>
                  <td>
                    {employeeAttendance.find(
                      (item) => item.employee === record.employee,
                    )?.completedProjects ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length && (
            <div className="empty-state">
              <CalendarDays size={28} />
              <h3>No attendance records found</h3>
              <p>Adjust the date range or employee filters.</p>
            </div>
          )}
        </div>
      </div>
      {showAddEmployee && <AddEmployeeDialog existingEmployees={directory} onClose={() => setShowAddEmployee(false)} onCreate={(employee) => { setCreatedEmployees((current) => [...current, employee]); setShowAddEmployee(false); }} />}
    </section>
  );
}

function AddEmployeeDialog({ existingEmployees, onClose, onCreate }: { existingEmployees: NewEmployee[]; onClose: () => void; onCreate: (employee: NewEmployee) => void }) {
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", employeeId: "", department: "Technical", designation: "Employee", joiningDate: "2026-10-13", employmentType: "Full-time", accountStatus: "Active", username: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const generateId = (department: string) => {
    const prefix = departmentCodes[department] ?? "EMP";
    const nextNumber = existingEmployees.filter((item) => item.employeeId.startsWith(`CHN-${prefix}-`)).length + 1;
    return `CHN-${prefix}-${String(nextNumber).padStart(3, "0")}`;
  };
  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.department) next.department = "Select a department.";
    if (!form.designation) next.designation = "Select a role.";
    if (!form.username.trim()) next.username = "Username is required.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    const candidateEmployeeId = form.employeeId.trim() || generateId(form.department);
    const duplicate = existingEmployees.find((item) => item.email.toLowerCase() === form.email.trim().toLowerCase() || item.employeeId.toLowerCase() === candidateEmployeeId.toLowerCase() || item.username.toLowerCase() === form.username.trim().toLowerCase());
    if (duplicate) {
      if (duplicate.email.toLowerCase() === form.email.trim().toLowerCase()) next.email = "This email is already in use.";
      if (duplicate.employeeId.toLowerCase() === candidateEmployeeId.toLowerCase()) next.employeeId = "This employee ID is already in use.";
      if (duplicate.username.toLowerCase() === form.username.trim().toLowerCase()) next.username = "This username is already in use.";
    }
    setErrors(next);
    return !Object.keys(next).length;
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === "form" && validate()) setStep("confirm");
  };
  const effectiveEmployeeId = form.employeeId || generateId(form.department);
  const create = () => {
    const [firstName] = form.name.trim().split(/\s+/);
    const employee: NewEmployee = { employeeId: form.employeeId || generateId(form.department), email: form.email.trim(), password: "", name: form.name.trim(), firstName, role: form.designation, department: form.department, username: form.username.trim(), designation: form.designation, joiningDate: form.joiningDate, employmentType: form.employmentType, accountStatus: form.accountStatus };
    onCreate(employee);
  };
  return <div className="employee-dialog-backdrop" onClick={onClose}><div className="panel employee-dialog" onClick={(event) => event.stopPropagation()}>{step === "confirm" ? <div className="employee-confirmation"><span className="employee-confirmation-icon"><CheckCircle2 size={24} /></span><span className="eyebrow">READY TO CREATE</span><h2>Confirm employee account</h2><p>Review the account details before adding this employee to the directory.</p><div className="employee-confirmation-summary"><strong>{form.name}</strong><span>{form.designation} · {form.department}</span><span>{form.email} · {effectiveEmployeeId}</span></div><div className="employee-secure-note"><ShieldCheck size={15} /><span>Initial credentials are handled securely and will not be stored as plain text in the employee directory.</span></div><div className="employee-dialog-actions"><button className="button" onClick={() => setStep("form")}>Back to edit</button><button className="button button-primary" onClick={create}>Create employee</button></div></div> : <form onSubmit={submit}><div className="panel-heading employee-dialog-heading"><div><span className="eyebrow">ADMINISTRATION / NEW ACCOUNT</span><h2>Add employee</h2><p>Create an employee account with controlled workspace access.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close add employee dialog"><X size={17} /></button></div><div className="employee-form-sections"><fieldset><legend><span>01</span> Personal information</legend><div className="employee-form-grid"><Field label="Full name" required error={errors.name}><input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Sara Ahmad" autoFocus /></Field><Field label="Email address" required error={errors.email}><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="sara@chinar.tv" /></Field><Field label="Phone number"><input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+93 700 000 000" /></Field><Field label="Employee photo"><label className="employee-photo-input"><Plus size={14} /> Upload photo<input type="file" accept="image/*" /></label></Field></div></fieldset><fieldset><legend><span>02</span> Employment details</legend><div className="employee-form-grid"><Field label="Employee ID" required error={errors.employeeId}><div className="employee-id-field"><input value={form.employeeId || generateId(form.department)} onChange={(event) => update("employeeId", event.target.value)} /><small>Auto-generated</small></div></Field><Field label="Department" required error={errors.department}><select value={form.department} onChange={(event) => { update("department", event.target.value); update("designation", roleByDepartment[event.target.value]?.[0] ?? "Employee"); update("employeeId", ""); }}><option value="">Select department</option>{employeeDepartments.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Designation / job title" required error={errors.designation}><select value={form.designation} onChange={(event) => update("designation", event.target.value)}>{(roleByDepartment[form.department] ?? []).map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Joining date"><input type="date" value={form.joiningDate} onChange={(event) => update("joiningDate", event.target.value)} /></Field><Field label="Employment type"><select value={form.employmentType} onChange={(event) => update("employmentType", event.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></Field><Field label="Account status"><select value={form.accountStatus} onChange={(event) => update("accountStatus", event.target.value)}><option>Active</option><option>Inactive</option></select></Field></div></fieldset><fieldset><legend><span>03</span> Account access</legend><div className="employee-form-grid"><Field label="Username" required error={errors.username}><input value={form.username} onChange={(event) => update("username", event.target.value)} placeholder="Choose a unique username" /></Field><Field label="Role"><input value={form.designation} readOnly /></Field><Field label="Initial password" required error={errors.password}><div className="employee-password-field"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="Minimum 8 characters" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></Field><Field label="Confirm password" required error={errors.confirmPassword}><input type="password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Re-enter password" /></Field></div><p className="employee-security-hint"><ShieldCheck size={14} /> Password is used only during account setup and is not shown in the employee directory.</p></fieldset></div><div className="employee-dialog-actions"><button type="button" className="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Review and create <Plus size={14} /></button></div></form>}</div></div>;
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <label className={`employee-form-field ${error ? "has-error" : ""}`}><span>{label}{required && <b>*</b>}</span>{children}{error && <small>{error}</small>}</label>;
}
