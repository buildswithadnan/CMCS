"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, CircleDollarSign, ClipboardList, Clock3,
  Download, FileText, GanttChartSquare, LayoutDashboard, LogOut,
  HelpCircle, Menu, Plus, Search, Settings, ShieldCheck, Users, Wallet,
  X, XCircle,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export type User = { employeeId: string; email: string; password: string; name: string; firstName: string; role: string; department: string };
type Role = "ceo" | "hoo" | "production" | "technical" | "finance" | "hr" | "admin" | "employee";
type Status = "In Progress" | "Upcoming" | "Completed" | "Delayed";
type Project = { id: string; name: string; client: string; owner: string; start: string; end: string; progress: number; status: Status; department: string; budget: number };

const users: Record<Role, User> = {
  ceo: { employeeId: "CHN-CEO-001", email: "ceo@demo.chinar.tv", password: "ChinarCEO@2026", name: "Ahmad Khan", firstName: "Ahmad", role: "CEO / Founder Manager", department: "Executive" },
  hoo: { employeeId: "CHN-HOO-001", email: "hoo@demo.chinar.tv", password: "ChinarOps@2026", name: "Wali Khan", firstName: "Wali", role: "Head of Operations", department: "Operations" },
  production: { employeeId: "CHN-PROD-001", email: "production@demo.chinar.tv", password: "ChinarProd@2026", name: "Hafizullah Khan", firstName: "Hafizullah", role: "Production Manager", department: "Production" },
  technical: { employeeId: "CHN-TECH-001", email: "technical@demo.chinar.tv", password: "ChinarTech@2026", name: "Shoaib Ahmad", firstName: "Shoaib", role: "Technical Manager", department: "Technical" },
  finance: { employeeId: "CHN-FIN-001", email: "finance@demo.chinar.tv", password: "ChinarFinance@2026", name: "Farid Ahmad", firstName: "Farid", role: "Finance Officer", department: "Finance" },
  hr: { employeeId: "CHN-HR-001", email: "hr@demo.chinar.tv", password: "ChinarHR@2026", name: "Zainab Ahmad", firstName: "Zainab", role: "HR Manager", department: "Human Resources" },
  admin: { employeeId: "CHN-ADM-001", email: "admin@demo.chinar.tv", password: "ChinarAdmin@2026", name: "Mohammad Wali", firstName: "Mohammad", role: "System Administrator", department: "Administration" },
  employee: { employeeId: "CHN-EMP-001", email: "employee@demo.chinar.tv", password: "ChinarEmployee@2026", name: "Ahmad Rahimi", firstName: "Ahmad", role: "Employee", department: "Production" },
};

const projectsSeed: Project[] = [
  { id: "PRJ-2026-0042", name: "UNDP Community Awareness Videography", client: "UNDP", owner: "Hafizullah Khan", start: "2026-10-12", end: "2026-10-22", progress: 72, status: "In Progress", department: "Production", budget: 42000 },
  { id: "PRJ-2026-0038", name: "National Election Coverage", client: "IEC", owner: "Wali Khan", start: "2026-10-05", end: "2026-10-09", progress: 48, status: "Delayed", department: "Operations", budget: 58000 },
  { id: "PRJ-2026-0045", name: "Kabul City Documentary", client: "Ministry of Culture", owner: "Zainab Ahmad", start: "2026-10-18", end: "2026-10-30", progress: 18, status: "Upcoming", department: "Production", budget: 31000 },
  { id: "PRJ-2026-0031", name: "Youth Media Training Series", client: "UNICEF", owner: "Ahmad Rahimi", start: "2026-10-02", end: "2026-10-06", progress: 100, status: "Completed", department: "HR", budget: 19500 },
  { id: "PRJ-2026-0048", name: "Sports Event Live Stream", client: "Ariana Sports", owner: "Shoaib Ahmad", start: "2026-10-20", end: "2026-10-24", progress: 8, status: "Upcoming", department: "Technical", budget: 27000 },
];
const revenue = [{ month: "May", revenue: 68, expenses: 31 }, { month: "Jun", revenue: 74, expenses: 35 }, { month: "Jul", revenue: 81, expenses: 39 }, { month: "Aug", revenue: 77, expenses: 34 }, { month: "Sep", revenue: 92, expenses: 41 }, { month: "Oct", revenue: 104, expenses: 46 }];
type AttendanceRecord = {
  date: string;
  day: "Saturday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  present: number;
  late: number;
  optionalFridayWork: number;
};
const attendance: AttendanceRecord[] = [
  { date: "2026-10-03", day: "Saturday", present: 136, late: 8, optionalFridayWork: 0 },
  { date: "2026-10-04", day: "Sunday", present: 141, late: 5, optionalFridayWork: 0 },
  { date: "2026-10-05", day: "Monday", present: 138, late: 7, optionalFridayWork: 0 },
  { date: "2026-10-06", day: "Tuesday", present: 144, late: 4, optionalFridayWork: 0 },
  { date: "2026-10-07", day: "Wednesday", present: 132, late: 11, optionalFridayWork: 0 },
  { date: "2026-10-08", day: "Thursday", present: 139, late: 6, optionalFridayWork: 0 },
  { date: "2026-10-09", day: "Friday", present: 0, late: 0, optionalFridayWork: 18 },
];
const statusColors: Record<Status, string> = { "In Progress": "#2563eb", Upcoming: "#8b5cf6", Completed: "#16a34a", Delayed: "#ef4444" };
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Gantt", icon: GanttChartSquare },
  { label: "Assignments", icon: Users },
  { label: "People & attendance", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
];

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [identity, setIdentity] = useState(""); const [password, setPassword] = useState(""); const [show, setShow] = useState(false); const [error, setError] = useState(""); const [demo, setDemo] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault(); const found = Object.values(users).find((u) => u.email === identity.trim().toLowerCase() || u.employeeId.toLowerCase() === identity.trim().toLowerCase());
    if (!found || found.password !== password) { setError("Credentials did not match a demo account."); return; }
    onLogin(found);
  }
  return <section className="auth-screen"><div className="auth-hero"><img src="/assets/chinar-logo.png" alt="Chinar Media Consulting Services" /><div><span>CMCS INTERNAL PLATFORM</span><h1>One workspace for every production.</h1><p>Coordinate projects, people, finance and field operations from a clear, connected control centre.</p></div><div className="auth-hero-foot"><span>Six departments</span><span>•</span><span>One source of truth</span><span>•</span><span>Built for collaboration</span></div></div><div className="auth-form-panel"><div className="auth-form-wrap"><div className="auth-form-head"><span className="eyebrow">SECURE WORKSPACE</span><h2>Welcome back</h2><p>Sign in to your CMCS workspace</p></div><form className="auth-form" onSubmit={submit}><label>Employee ID or email<input required value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="you@chinar.tv" /></label><label>Password<div className="password-field"><input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" /><button type="button" className="password-toggle" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button></div></label>{error && <p className="auth-error">{error}</p>}<button className="auth-submit" type="submit">Sign in <ArrowUpRight size={16} /></button></form><button className="demo-accounts-toggle" onClick={() => setDemo(!demo)}>Try a demo role <ChevronDown size={14} /></button>{demo && <div className="demo-list">{Object.entries(users).map(([key, u]) => <button key={key} onClick={() => { setIdentity(u.email); setPassword(u.password); }}>{u.role}<small>{u.email}</small></button>)}</div>}<p className="auth-authorized"><ShieldCheck size={13} /> Authorized CMCS personnel only</p></div></div></section>;
}

function StatCard({ label, value, change, icon: Icon, tone = "blue" }: { label: string; value: string; change: string; icon: typeof Activity; tone?: string }) {
  return <article className={"stat-card " + tone}><div><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small><ArrowUpRight size={12} /> {change} <em>vs last month</em></small></article>;
}

function ProjectTable({ projects, onSelect, showProgress = true }: { projects: Project[]; onSelect: (p: Project) => void; showProgress?: boolean }) {
  return <div className="table-wrap"><table><thead><tr><th>Project</th><th>Owner</th><th>Status</th>{showProgress && <th>Progress</th>}<th>Deadline</th><th /></tr></thead><tbody>{projects.map((p) => <tr key={p.id}><td><button className="project-link" onClick={() => onSelect(p)}><span className="project-dot" style={{ background: statusColors[p.status] }} /><span><strong>{p.name}</strong><small>{p.id} · {p.client}</small></span></button></td><td>{p.owner}</td><td><span className={"status-pill " + p.status.toLowerCase().replace(" ", "-")}>{p.status}</span></td>{showProgress && <td><div className="table-progress"><span>{p.progress}%</span><i><b style={{ width: p.progress + "%", background: statusColors[p.status] }} /></i></div></td>}<td>{new Date(p.end).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td><td><button className="icon-button" onClick={() => onSelect(p)} aria-label="Open project"><ArrowUpRight size={16} /></button></td></tr>)}</tbody></table></div>;
}

function Gantt({ projects }: { projects: Project[] }) {
  const [view, setView] = useState<"Day" | "Week" | "Month">("Week");
  const start = new Date("2026-10-01").getTime(); const end = new Date("2026-11-01").getTime();
  const scale = (date: string) => `${Math.max(0, Math.min(100, ((new Date(date).getTime() - start) / (end - start)) * 100))}%`;
  const width = (a: string, b: string) => `${Math.max(5, ((new Date(b).getTime() - new Date(a).getTime()) / (end - start)) * 100)}%`;
  return <section className="gantt-panel"><div className="panel-heading"><div><span className="eyebrow">PLANNING BOARD</span><h2>Project Gantt chart</h2><p>Dependencies, milestones and delivery risk across October 2026.</p></div><div className="segmented">{(["Day", "Week", "Month"] as const).map((item) => <button key={item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}</button>)}</div></div><div className="gantt-toolbar"><span><span className="legend-dot blue" /> In progress</span><span><span className="legend-dot red" /> Delayed</span><span><span className="legend-dot green" /> Completed</span><span className="gantt-view-note">{view} view · 01–31 Oct</span></div><div className="gantt-grid"><div className="gantt-head"><span>Workstream</span><div>{["01 Oct", "08 Oct", "15 Oct", "22 Oct", "29 Oct"].map((d) => <b key={d}>{d}</b>)}</div></div>{projects.map((p) => <div className="gantt-row" key={p.id}><div><strong>{p.name}</strong><small>{p.owner} · {p.progress}% complete</small></div><div className="timeline"><i className="today-line" /><span className="gantt-bar" style={{ left: scale(p.start), width: width(p.start, p.end), background: statusColors[p.status] }}><b>{p.progress}%</b></span>{p.status === "Delayed" && <span className="milestone" style={{ left: scale(p.end) }} title="Deadline at risk">!</span>}</div></div>)}</div><div className="gantt-summary"><AlertTriangle size={16} /><span><strong>1 delayed project</strong> requires a revised delivery date and operations review.</span><button className="text-button">Review risk <ArrowUpRight size={14} /></button></div></section>;
}

function ProjectDialog({ project, onClose, onSave }: { project?: Project; onClose: () => void; onSave: (p: Project) => void }) {
  const [name, setName] = useState(project?.name ?? ""); const [client, setClient] = useState(project?.client ?? ""); const [date, setDate] = useState(project?.end ?? ""); const [error, setError] = useState("");
  function save(e: FormEvent) { e.preventDefault(); if (!name.trim() || !client.trim() || !date) { setError("Project name, client and deadline are required."); return; } onSave(project ? { ...project, name, client, end: date } : { id: `PRJ-2026-${String(Date.now()).slice(-4)}`, name, client, owner: "Unassigned", start: "2026-10-15", end: date, progress: 0, status: "Upcoming", department: "Operations", budget: 0 }); }
  return <div className="dialog-backdrop" role="presentation"><div className="dialog"><div className="dialog-head"><div><span className="eyebrow">{project ? "EDIT PROJECT" : "NEW PROJECT"}</span><h2>{project ? "Update project details" : "Create a project"}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><form className="dialog-form" onSubmit={save}><label>Project name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Afghanistan Media Forum" /></label><label>Client / partner<input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Organisation name" /></label><label>Delivery deadline<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>{error && <p className="field-error">{error}</p>}<div className="dialog-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">{project ? "Save changes" : "Create project"}</button></div></form></div></div>;
}

export function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const role = (Object.keys(users) as Role[]).find((key) => users[key].email === user.email) ?? "employee";
  const [active, setActive] = useState("Dashboard"); const [projects, setProjects] = useState(projectsSeed); const [statusFilter, setStatusFilter] = useState<Status | "All">("All"); const [search, setSearch] = useState(""); const [dialog, setDialog] = useState<"new" | Project | null>(null); const [toast, setToast] = useState(""); const [mobile, setMobile] = useState(false);
  const filtered = useMemo(() => projects.filter((p) => (statusFilter === "All" || p.status === statusFilter) && `${p.name} ${p.client} ${p.owner}`.toLowerCase().includes(search.toLowerCase())), [projects, statusFilter, search]);
  const metrics = { projects: projects.length, active: projects.filter((p) => p.status === "In Progress").length, delayed: projects.filter((p) => p.status === "Delayed").length, completed: projects.filter((p) => p.status === "Completed").length };
  function notify(text: string) { setToast(text); window.setTimeout(() => setToast(""), 2600); }
  function saveProject(p: Project) {
    if (role === "ceo" && !projects.some((item) => item.id === p.id)) {
      notify("CEO accounts can monitor and approve projects but cannot create them.");
      return;
    }
    setProjects((current) => current.some((item) => item.id === p.id) ? current.map((item) => item.id === p.id ? p : item) : [p, ...current]);
    setDialog(null);
    notify("Project saved successfully");
  }
  const title = active === "Dashboard" ? "Dashboard" : active;
  return <div className="app-shell is-visible"><aside className={"sidebar " + (mobile ? "mobile-open" : "")}><div className="brand"><div className="brand-mark"><img src="/assets/chinar-logo.png" alt="CMCS" /></div><div><strong>CMCS</strong><span>Management workspace</span></div><button className="sidebar-close icon-button" onClick={() => setMobile(false)}><X size={18} /></button></div><div className="role-chip"><ShieldCheck size={14} /> {user.role}</div><nav className="primary-nav">{nav.map(({ label, icon: Icon }) => <button key={label} className={"nav-item " + (active === label ? "active" : "")} onClick={() => { setActive(label); setMobile(false); }}><Icon size={17} />{label}{label === "Projects" && <span className="nav-count">{projects.length}</span>}</button>)}</nav><div className="sidebar-bottom"><button className="nav-item" onClick={() => setActive("Settings")}><Settings size={17} />Settings</button><div className="user-mini"><div className="avatar">{user.firstName.slice(0, 2).toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.department}</span></div><button className="icon-button" onClick={onLogout}><LogOut size={16} /></button></div></div></aside><main className="main-content"><header className="topbar"><button className="menu-button" onClick={() => setMobile(true)}><Menu size={20} /></button><div className="breadcrumbs"><span>CMCS workspace</span><b>/</b><strong>{title}</strong></div><div className="topbar-actions">{role !== "ceo" && <label className="global-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects, people..." /></label>}<button className="icon-button notification-button"><Bell size={18} /><span>4</span></button><div className="topbar-profile"><div className="avatar">{user.firstName.slice(0, 2).toUpperCase()}</div><span><strong>{user.firstName}</strong><small>{user.role}</small></span></div></div></header><div className="page-content">{active === "Dashboard" && <DashboardHome user={user} metrics={metrics} projects={projects} onNavigate={setActive} onSelect={(p) => setDialog(p)} />}{active === "Projects" && <section className="page-section"><PageHeader eyebrow="OPERATIONS / PROJECTS" title="Projects" copy="Plan, assign and track every client delivery." action={role === "ceo" ? undefined : "New project"} onAction={role === "ceo" ? undefined : () => setDialog("new")} /><div className="filter-bar"><div className="filter-tabs">{(["All", "In Progress", "Upcoming", "Delayed", "Completed"] as const).map((item) => <button className={statusFilter === item ? "selected" : ""} key={item} onClick={() => setStatusFilter(item)}>{item}</button>)}</div></div><div className="panel"><ProjectTable projects={filtered} onSelect={(p) => setDialog(p)} /></div>{filtered.length === 0 && <EmptyState onReset={() => { setSearch(""); setStatusFilter("All"); }} />}</section>}{active === "Project Gantt" && <section className="page-section"><PageHeader eyebrow="OPERATIONS / PLANNING" title="Project timeline" copy="See dependencies, deadlines and delayed work at a glance." action={role === "ceo" ? undefined : "New project"} onAction={role === "ceo" ? undefined : () => setDialog("new")} /><Gantt projects={projects} /></section>}{active !== "Dashboard" && !["Projects", "Project Gantt"].includes(active) && <ModulePage active={active} user={user} projects={projects} onNotify={notify} />}</div></main>{dialog && <ProjectDialog project={dialog === "new" ? undefined : dialog} onClose={() => setDialog(null)} onSave={saveProject} />}{toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}</div>;
}

function PageHeader({ eyebrow, title, copy, action, onAction }: { eyebrow: string; title: string; copy: string; action?: string; onAction?: () => void }) { return <section className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action && <button className="button button-primary" onClick={onAction}><Plus size={16} />{action}</button>}</section>; }
function DashboardHome({ user, metrics, projects, onNavigate, onSelect }: { user: User; metrics: { projects: number; active: number; delayed: number; completed: number }; projects: Project[]; onNavigate: (s: string) => void; onSelect: (p: Project) => void }) {
  const pie = Object.entries(metrics).filter(([key]) => key !== "projects").map(([name, value]) => ({ name, value }));
  if (user.department === "Executive") return <CeoDashboardHome user={user} metrics={metrics} projects={projects} onNavigate={onNavigate} onSelect={onSelect} />;
  return <section className="page-section"><PageHeader eyebrow={`${user.department.toUpperCase()} / OVERVIEW`} title={`Good morning, ${user.firstName}`} copy="Here is the latest pulse across your CMCS workspace." action="New project" onAction={() => onNavigate("Projects")} /><section className="stat-grid"><StatCard label="Total projects" value={String(metrics.projects)} change="+12.5%" icon={ClipboardList} /><StatCard label="Active projects" value={String(metrics.active)} change="+8.4%" icon={Activity} tone="indigo" /><StatCard label="Completed" value={String(metrics.completed)} change="+18.7%" icon={CheckCircle2} tone="green" /><StatCard label="Needs attention" value={String(metrics.delayed)} change="Review now" icon={AlertTriangle} tone="red" /></section><section className="dashboard-grid"><article className="panel chart-panel wide"><div className="panel-heading"><div><h2>Revenue vs expenses</h2><p>Monthly performance in thousands (USD).</p></div><button className="icon-button"><Download size={16} /></button></div><ResponsiveContainer width="100%" height={260}><AreaChart data={revenue}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f6" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Legend /><Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} /><Area type="monotone" dataKey="expenses" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer></article><article className="panel chart-panel"><div className="panel-heading"><div><h2>Project health</h2><p>Current portfolio split.</p></div></div><ResponsiveContainer width="100%" height={210}><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={58} outerRadius={78} paddingAngle={4}>{pie.map((entry, i) => <Cell key={entry.name} fill={["#2563eb", "#16a34a", "#ef4444"][i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mini-legend">{pie.map((item, i) => <span key={item.name}><i style={{ background: ["#2563eb", "#16a34a", "#ef4444"][i] }} />{item.name} <b>{item.value}</b></span>)}</div></article></section><section className="dashboard-grid lower"><article className="panel"><div className="panel-heading"><div><h2>Project portfolio</h2><p>Latest status and delivery progress.</p></div><button className="text-button" onClick={() => onNavigate("Projects")}>View all <ArrowUpRight size={14} /></button></div><ProjectTable projects={projects.slice(0, 4)} onSelect={onSelect} /></article><article className="panel chart-panel"><div className="panel-heading"><div><h2>Attendance trend</h2><p>Team presence this week.</p></div></div><ResponsiveContainer width="100%" height={190}><BarChart data={attendance}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f6" /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Bar dataKey="present" fill="#2563eb" radius={[5, 5, 0, 0]} /><Bar dataKey="late" fill="#f59e0b" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></article></section></section>;
}

function CeoDashboardHome({ user, metrics, projects, onNavigate, onSelect }: { user: User; metrics: { projects: number; active: number; delayed: number; completed: number }; projects: Project[]; onNavigate: (s: string) => void; onSelect: (p: Project) => void }) {
  const statusSummary = [
    { label: "On track", value: projects.filter((project) => project.status === "Upcoming" || (project.status === "In Progress" && project.progress >= 50)).length, color: "#2563eb" },
    { label: "Delayed", value: projects.filter((project) => project.status === "Delayed").length, color: "#ef4444" },
    { label: "Completed", value: metrics.completed, color: "#16a34a" },
  ];
  const pendingApprovals = projects.filter((project) => project.status === "Delayed").length;
  const todayAttendance = attendance.find((record) => record.day === "Wednesday");

  return <section className="page-section ceo-overview">
    <PageHeader eyebrow="EXECUTIVE / OVERVIEW" title={`Good morning, ${user.firstName}`} copy="Monitor portfolio delivery, workforce attendance and financial visibility." />
    <section className="stat-grid ceo-stat-grid">
      <StatCard label="Total projects" value={String(metrics.projects)} change="Portfolio" icon={ClipboardList} />
      <StatCard label="Pending approvals" value={String(pendingApprovals)} change="Review required" icon={Clock3} tone="indigo" />
      <StatCard label="In-progress projects" value={String(metrics.active)} change="Delivery" icon={Activity} tone="indigo" />
      <StatCard label="Delayed projects" value={String(metrics.delayed)} change="Review now" icon={AlertTriangle} tone="red" />
      <StatCard label="Revenue" value={money(revenue[revenue.length - 1].revenue * 1000)} change="Recorded" icon={CircleDollarSign} tone="green" />
      <StatCard label="Completed projects" value={String(metrics.completed)} change="Recorded" icon={CheckCircle2} tone="green" />
      <StatCard label="Today's attendance" value={todayAttendance ? `${todayAttendance.present}` : "—"} change="Recorded presence" icon={CalendarDays} tone="green" />
    </section>
    <section className="dashboard-grid ceo-primary-grid">
      <article className="panel ceo-portfolio-panel">
        <div className="panel-heading"><div><h2>Project Portfolio</h2><p>Current delivery status across {metrics.projects} projects.</p></div><button className="text-button" onClick={() => onNavigate("Projects")}>View all <ArrowUpRight size={14} /></button></div>
        <div className="ceo-status-summary">{statusSummary.map((status) => <div key={status.label}><i style={{ background: status.color }} /><strong>{status.value}</strong><span>{status.label}</span></div>)}</div>
        <ProjectTable projects={projects.slice(0, 4)} onSelect={onSelect} showProgress={false} />
      </article>
      <article className="panel chart-panel">
        <div className="panel-heading"><div><h2>Project Status Overview</h2><p>Recorded project statuses.</p></div><span title="On track represents active or upcoming work. Delayed and completed use the recorded project status."><HelpCircle size={16} /></span></div>
        <ResponsiveContainer width="100%" height={210}><PieChart><Pie data={statusSummary} dataKey="value" nameKey="label" innerRadius={58} outerRadius={78} paddingAngle={4}>{statusSummary.map((entry) => <Cell key={entry.label} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        <div className="mini-legend">{statusSummary.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label} <b>{item.value}</b></span>)}</div>
      </article>
    </section>
    <section className="dashboard-grid ceo-attendance-grid">
      <article className="panel chart-panel wide">
        <div className="panel-heading"><div><h2>Attendance Trend</h2><p>03–09 October 2026 · Saturday–Thursday are regular working days.</p></div><span title="Friday is a weekly day off. Friday records represent optional overtime or extra-day work, not absence."><HelpCircle size={16} /></span></div>
        <ResponsiveContainer width="100%" height={220}><BarChart data={attendance}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f6" /><XAxis dataKey="day" axisLine={false} tickLine={false} tickFormatter={(day) => String(day).slice(0, 3)} /><YAxis axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip labelFormatter={(day) => `${day} · ${attendance.find((record) => record.day === day)?.date ?? ""}`} /><Legend /><Bar dataKey="present" name="Regular attendance" stackId="attendance" fill="#2563eb" radius={[4, 4, 0, 0]} /><Bar dataKey="late" name="Late arrivals" stackId="attendance" fill="#f59e0b" /><Bar dataKey="optionalFridayWork" name="Friday optional / overtime" fill="#8b5cf6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
      </article>
    </section>
    <section className="dashboard-grid ceo-finance-grid">
      <article className="panel chart-panel wide">
        <div className="panel-heading"><div><h2>Revenue vs. Expense</h2><p>Recorded monthly financial activity in USD. Revenue is not cash received.</p></div><button className="icon-button" title="Export recorded financial activity"><Download size={16} /></button></div>
        <ResponsiveContainer width="100%" height={250}><AreaChart data={revenue}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f6" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}k`} /><Tooltip formatter={(value, name) => [`$${Number(value ?? 0)}k`, String(name)]} /><Legend /><Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} /><Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer>
      </article>
    </section>
    <section className="ceo-executive-notes"><article className="panel"><div className="panel-heading"><div><h2>Pending Approvals</h2><p>Items requiring executive review.</p></div><Clock3 size={16} /></div><p>{pendingApprovals ? `${pendingApprovals} delayed project${pendingApprovals === 1 ? "" : "s"} require review.` : "No approvals are currently waiting."}</p><button className="text-button" onClick={() => onNavigate("Projects")}>Review projects <ArrowUpRight size={14} /></button></article><article className="panel"><div className="panel-heading"><div><h2>Alerts and Recent Activity</h2><p>Operational signals from the current portfolio.</p></div><AlertTriangle size={16} /></div><p>{metrics.delayed ? `${metrics.delayed} project${metrics.delayed === 1 ? "" : "s"} currently show delayed status.` : "No delayed projects recorded."}</p><button className="text-button" onClick={() => onNavigate("Reports")}>Open reports <ArrowUpRight size={14} /></button></article></section>
  </section>;
}

function ModulePage({ active, user, projects, onNotify }: { active: string; user: User; projects: Project[]; onNotify: (s: string) => void }) {
  const isFinance = active === "Finance"; const isPeople = active === "People & attendance"; const isReports = active === "Reports";
  const items = isFinance ? [["INV-2026-024", "UNDP Community Awareness", "$42,000", "Pending approval"], ["INV-2026-021", "National Election Coverage", "$58,000", "Approved"], ["INV-2026-019", "Youth Media Training", "$19,500", "Paid"]] : isPeople ? [["Ahmad Rahimi", "Production", "Present", "08:42 AM"], ["Shoaib Ahmad", "Technical", "On field duty", "07:58 AM"], ["Zainab Ahmad", "HR", "On leave", "—"], ["Farid Ahmad", "Finance", "Late", "09:21 AM"]] : [["Project delivery", "Operations", "86%", "On track"], ["Team utilisation", "People", "78%", "Healthy"], ["Budget variance", "Finance", "+4.2%", "Review"]];
  return <section className="page-section"><PageHeader eyebrow={`${user.department.toUpperCase()} / WORKSPACE`} title={active} copy={isFinance ? "Review invoices, payments and the financial pulse." : isPeople ? "Keep attendance, leave and employee activity up to date." : `Manage ${active.toLowerCase()} with clear, actionable workflows.`} action={isPeople ? "Add employee" : "Create request"} onAction={() => onNotify("Form opened — ready for input")} /><div className="module-toolbar"><label className="inline-search"><Search size={15} /><input placeholder={`Search ${active.toLowerCase()}...`} /></label><button className="button button-secondary"><Download size={14} /> Export</button></div><div className="panel"><div className="list-heading"><span>{isFinance ? "Invoice" : isPeople ? "Employee" : "Metric"}</span><span>Department</span><span>Status</span><span>Action</span></div>{items.map((row) => <div className="list-row" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><span className={"status-pill " + row[3].toLowerCase().replaceAll(" ", "-")}>{row[2]}</span><button className="text-button" onClick={() => onNotify(`${row[0]} updated successfully`)}>{isFinance ? "Review" : "Open"} <ArrowUpRight size={14} /></button></div>)}</div>{isReports && <div className="empty-state"><BarChart3 size={30} /><h3>Reports are ready to generate</h3><p>Choose a report type, date range and export format to continue.</p><button className="button button-primary" onClick={() => onNotify("Report generation started")}>Generate report</button></div>}{active === "Assignments" && <div className="workflow-note"><Clock3 size={17} /><div><strong>3 assignment responses pending</strong><p>Send a reminder to field team members before the next production call.</p></div><button className="button button-primary" onClick={() => onNotify("Reminders sent to 3 assignees")}>Send reminders</button></div>}</section>;
}
function EmptyState({ onReset }: { onReset: () => void }) { return <div className="empty-state"><Search size={30} /><h3>No matching projects</h3><p>Try another keyword or clear the current filters.</p><button className="button button-secondary" onClick={onReset}>Clear filters</button></div>; }
