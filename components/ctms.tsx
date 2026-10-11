"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  GanttChartSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type User = {
  employeeId: string;
  email: string;
  password: string;
  name: string;
  firstName: string;
  role: string;
  department: string;
};
type Role =
  | "ceo"
  | "hoo"
  | "production"
  | "technical"
  | "finance"
  | "hr"
  | "admin"
  | "employee";
type Status = "In Progress" | "Upcoming" | "Completed" | "Rejected";
type Project = {
  id: string;
  name: string;
  client: string;
  owner: string;
  start: string;
  end: string;
  progress: number;
  status: Status;
  department: string;
  budget: number;
};
type Approval = "Pending approval" | "Approved" | "Rejected";

const users: Record<Role, User> = {
  ceo: {
    employeeId: "CHN-CEO-001",
    email: "ceo@demo.chinar.tv",
    password: "ChinarCEO@2026",
    name: "Ahmad Khan",
    firstName: "Ahmad",
    role: "CEO / Founder Manager",
    department: "Executive",
  },
  hoo: {
    employeeId: "CHN-HOO-001",
    email: "hoo@demo.chinar.tv",
    password: "ChinarOps@2026",
    name: "Wali Khan",
    firstName: "Wali",
    role: "Head of Operations",
    department: "Operations",
  },
  production: {
    employeeId: "CHN-PROD-001",
    email: "production@demo.chinar.tv",
    password: "ChinarProd@2026",
    name: "Hafizullah Khan",
    firstName: "Hafizullah",
    role: "Production Manager",
    department: "Production",
  },
  technical: {
    employeeId: "CHN-TECH-001",
    email: "technical@demo.chinar.tv",
    password: "ChinarTech@2026",
    name: "Shoaib Ahmad",
    firstName: "Shoaib",
    role: "Technical Manager",
    department: "Technical",
  },
  finance: {
    employeeId: "CHN-FIN-001",
    email: "finance@demo.chinar.tv",
    password: "ChinarFinance@2026",
    name: "Farid Ahmad",
    firstName: "Farid",
    role: "Finance Officer",
    department: "Finance",
  },
  hr: {
    employeeId: "CHN-HR-001",
    email: "hr@demo.chinar.tv",
    password: "ChinarHR@2026",
    name: "Zainab Ahmad",
    firstName: "Zainab",
    role: "HR Manager",
    department: "Human Resources",
  },
  admin: {
    employeeId: "CHN-ADM-001",
    email: "admin@demo.chinar.tv",
    password: "ChinarAdmin@2026",
    name: "Mohammad Wali",
    firstName: "Mohammad",
    role: "System Administrator",
    department: "Administration",
  },
  employee: {
    employeeId: "CHN-EMP-001",
    email: "employee@demo.chinar.tv",
    password: "ChinarEmployee@2026",
    name: "Ahmad Rahimi",
    firstName: "Ahmad",
    role: "Employee",
    department: "Production",
  },
};
const loginDepartments = Array.from(
  new Set(Object.values(users).map((user) => user.department)),
).sort((a, b) => a.localeCompare(b));

const projectsSeed: Project[] = [
  {
    id: "PRJ-2026-0042",
    name: "UNDP Community Awareness Videography",
    client: "UNDP",
    owner: "Hafizullah Khan",
    start: "2026-10-12",
    end: "2026-10-22",
    progress: 72,
    status: "In Progress",
    department: "Production",
    budget: 42000,
  },
  {
    id: "PRJ-2026-0038",
    name: "National Election Coverage",
    client: "IEC",
    owner: "Wali Khan",
    start: "2026-10-05",
    end: "2026-10-09",
    progress: 48,
    status: "In Progress",
    department: "Operations",
    budget: 58000,
  },
  {
    id: "PRJ-2026-0045",
    name: "Kabul City Documentary",
    client: "Ministry of Culture",
    owner: "Zainab Ahmad",
    start: "2026-10-18",
    end: "2026-10-30",
    progress: 18,
    status: "Upcoming",
    department: "Production",
    budget: 31000,
  },
  {
    id: "PRJ-2026-0031",
    name: "Youth Media Training Series",
    client: "UNICEF",
    owner: "Ahmad Rahimi",
    start: "2026-10-02",
    end: "2026-10-06",
    progress: 100,
    status: "Completed",
    department: "HR",
    budget: 19500,
  },
  {
    id: "PRJ-2026-0048",
    name: "Sports Event Live Stream",
    client: "Ariana Sports",
    owner: "Shoaib Ahmad",
    start: "2026-10-20",
    end: "2026-10-24",
    progress: 8,
    status: "Upcoming",
    department: "Technical",
    budget: 27000,
  },
];
const revenue = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map(
  (month, index) => ({
    month,
    revenue: 68 + index * 7,
    expenses: 31 + index * 3,
  }),
);
const statusColors: Record<Status, string> = {
  "In Progress": "#2563eb",
  Upcoming: "#8b5cf6",
  Completed: "#16a34a",
  Rejected: "#dc2626",
};
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const formatDate = (value: string) =>
  parseDate(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Assignments", icon: Users },
  { label: "People & attendance", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
];
const ceoNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Project Approvals", icon: CheckCircle2 },
  { label: "Quotations", icon: FileText },
  { label: "Notifications", icon: Bell },
  { label: "Employees", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
];
const attendanceToday = [
  {
    name: "Ahmad Rahimi",
    department: "Production",
    status: "Present",
    time: "08:42 AM",
  },
  {
    name: "Shoaib Ahmad",
    department: "Technical",
    status: "Present",
    time: "07:58 AM",
  },
  {
    name: "Hafizullah Khan",
    department: "Production",
    status: "Present",
    time: "08:16 AM",
  },
  { name: "Zainab Ahmad", department: "HR", status: "Absent", time: "—" },
  { name: "Farid Ahmad", department: "Finance", status: "Absent", time: "—" },
];
const employeeAttendance = [
  {
    employee: "Ahmad Rahimi",
    department: "Production",
    completedProjects: 12,
    records: [
      { date: "2026-10-11", status: "Present", time: "08:42 AM" },
      { date: "2026-10-10", status: "Present", time: "08:37 AM" },
      { date: "2026-10-09", status: "Present", time: "08:51 AM" },
      { date: "2026-10-08", status: "Late", time: "09:21 AM" },
      { date: "2026-10-07", status: "Present", time: "08:35 AM" },
    ],
  },
  {
    employee: "Shoaib Ahmad",
    department: "Technical",
    completedProjects: 9,
    records: [
      { date: "2026-10-11", status: "Present", time: "07:58 AM" },
      { date: "2026-10-10", status: "Present", time: "08:04 AM" },
      { date: "2026-10-09", status: "Absent", time: "—" },
      { date: "2026-10-08", status: "Present", time: "08:11 AM" },
      { date: "2026-10-07", status: "Present", time: "07:55 AM" },
    ],
  },
  {
    employee: "Hafizullah Khan",
    department: "Production",
    completedProjects: 15,
    records: [
      { date: "2026-10-11", status: "Present", time: "08:16 AM" },
      { date: "2026-10-10", status: "Present", time: "08:19 AM" },
      { date: "2026-10-09", status: "Present", time: "08:22 AM" },
      { date: "2026-10-08", status: "Present", time: "08:18 AM" },
      { date: "2026-10-07", status: "Late", time: "09:06 AM" },
    ],
  },
  {
    employee: "Zainab Ahmad",
    department: "HR",
    completedProjects: 7,
    records: [
      { date: "2026-10-11", status: "Absent", time: "—" },
      { date: "2026-10-10", status: "Present", time: "08:46 AM" },
      { date: "2026-10-09", status: "Present", time: "08:40 AM" },
      { date: "2026-10-08", status: "Present", time: "08:52 AM" },
      { date: "2026-10-07", status: "Present", time: "08:38 AM" },
    ],
  },
  {
    employee: "Farid Ahmad",
    department: "Finance",
    completedProjects: 6,
    records: [
      { date: "2026-10-11", status: "Absent", time: "—" },
      { date: "2026-10-10", status: "Present", time: "08:30 AM" },
      { date: "2026-10-09", status: "Present", time: "08:34 AM" },
      { date: "2026-10-08", status: "Late", time: "09:17 AM" },
      { date: "2026-10-07", status: "Present", time: "08:29 AM" },
    ],
  },
];
const ceoNotifications = [
  {
    id: "NTF-001",
    title: "New project requires approval",
    detail: "Head of Operations submitted National Election Coverage.",
    time: "Today, 09:18 AM",
    kind: "Project approval",
  },
  {
    id: "NTF-002",
    title: "Quotation requires approval",
    detail: "QTN-2026-014 is ready for UNDP Community Awareness.",
    time: "Today, 08:55 AM",
    kind: "Quotation",
  },
  {
    id: "NTF-003",
    title: "Project schedule updated",
    detail: "Kabul City Documentary dates were updated by Production.",
    time: "Yesterday, 04:20 PM",
    kind: "Project update",
  },
];
type Notification = (typeof ceoNotifications)[number] & {
  recipient: Role | "all";
};
const notificationStorageKey = "cmcsNotifications";
const readNotifications = (): Notification[] => {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(notificationStorageKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as Notification[];
  } catch {
    return [];
  }
};
const defaultNotifications: Notification[] = ceoNotifications.map(
  (notification) => ({ ...notification, recipient: "ceo" }),
);
const quotationSeed = [
  {
    id: "QTN-2026-014",
    projectId: "PRJ-2026-0042",
    project: "UNDP Community Awareness Videography",
    vendor: "Kabul Visuals Co.",
    amount: 18400,
    submittedBy: "Wali Khan",
    submitted: "07 Oct 2026",
    status: "Pending approval",
  },
  {
    id: "QTN-2026-011",
    projectId: "PRJ-2026-0038",
    project: "National Election Coverage",
    vendor: "Ariana Equipment Hire",
    amount: 12750,
    submittedBy: "Wali Khan",
    submitted: "06 Oct 2026",
    status: "Pending approval",
  },
  {
    id: "QTN-2026-009",
    projectId: "PRJ-2026-0031",
    project: "Youth Media Training Series",
    vendor: "Kabul Print Studio",
    amount: 4200,
    submittedBy: "Farid Ahmad",
    submitted: "02 Oct 2026",
    status: "Approved",
  },
  {
    id: "QTN-2026-006",
    projectId: "PRJ-2026-0045",
    project: "Kabul City Documentary",
    vendor: "Kabul Creative Works",
    amount: 9600,
    submittedBy: "Zainab Ahmad",
    submitted: "29 Sep 2026",
    status: "Rejected",
  },
];
const invoiceSeed = [
  {
    id: "INV-2026-024",
    projectId: "PRJ-2026-0042",
    quotationId: "QTN-2026-014",
    project: "UNDP Community Awareness Videography",
    amount: 42000,
    status: "Pending approval",
    generationStatus: "Generated",
    paymentStatus: "Not issued",
  },
  {
    id: "INV-2026-021",
    projectId: "PRJ-2026-0038",
    quotationId: "QTN-2026-011",
    project: "National Election Coverage",
    amount: 58000,
    status: "Approved",
    generationStatus: "Generated",
    paymentStatus: "Unpaid",
  },
  {
    id: "INV-2026-019",
    projectId: "PRJ-2026-0031",
    quotationId: "QTN-2026-009",
    project: "Youth Media Training Series",
    amount: 19500,
    status: "Approved",
    generationStatus: "Generated",
    paymentStatus: "Paid",
  },
  {
    id: "INV-2026-016",
    projectId: "PRJ-2026-0045",
    quotationId: "QTN-2026-006",
    project: "Kabul City Documentary",
    amount: 31000,
    status: "Rejected",
    generationStatus: "Not generated",
    paymentStatus: "Not issued",
  },
];
const paymentSeed = [
  {
    id: "PAY-2026-017",
    projectId: "PRJ-2026-0031",
    quotationId: "QTN-2026-009",
    project: "Youth Media Training Series",
    amount: 19500,
    status: "Paid",
    generationStatus: "—",
    paymentStatus: "Paid",
  },
  {
    id: "PAY-2026-014",
    projectId: "PRJ-2026-0038",
    quotationId: "QTN-2026-011",
    project: "National Election Coverage",
    amount: 29000,
    status: "Unpaid",
    generationStatus: "—",
    paymentStatus: "Unpaid",
  },
];

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [department, setDepartment] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const normalizedIdentity = identity.trim().toLowerCase();
    const found = Object.values(users).find(
      (u) =>
        u.department === department &&
        (u.email === normalizedIdentity ||
          u.employeeId.toLowerCase() === normalizedIdentity),
    );
    if (!found || found.password !== password) {
      setError(
        department
          ? `Those credentials do not match a ${department} account.`
          : "Select your department to continue.",
      );
      return;
    }
    onLogin(found);
  }
  return (
    <section className="auth-screen">
      <div className="auth-hero">
        <img
          src="/assets/chinar-logo.png"
          alt="Chinar Media Consulting Services"
        />
        <div>
          <span>CMCS INTERNAL PLATFORM</span>
          <h1>One workspace for every production.</h1>
          <p>
            Coordinate projects, people, finance and field operations from a
            clear, connected control centre.
          </p>
        </div>
        <div className="auth-hero-foot">
          <span>Six departments</span>
          <span>•</span>
          <span>One source of truth</span>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-form-head">
            <span className="eyebrow">SECURE WORKSPACE</span>
            <h2>Welcome back</h2>
            <p>Sign in to your CMCS workspace</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>
              Department
              <div className="department-field">
                <Building2 size={16} aria-hidden="true" />
                <select
                  required
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    setError("");
                  }}
                  aria-label="Select your department"
                >
                  <option value="" disabled>
                    Select your department
                  </option>
                  {loginDepartments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <span className="auth-field-help">
                Use the workspace assigned to your department.
              </span>
            </label>
            <label>
              Employee ID or email
              <input
                required
                value={identity}
                onChange={(e) => {
                  setIdentity(e.target.value);
                  setError("");
                }}
                placeholder="you@chinar.tv"
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShow(!show)}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit">
              Sign in <ArrowUpRight size={16} />
            </button>
          </form>
          <p className="auth-authorized">
            <ShieldCheck size={13} /> Authorized CMCS personnel only
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  tone?: string;
}) {
  return (
    <article className={"stat-card " + tone}>
      <div>
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <strong>{value}</strong>
      <small>Mock workspace data</small>
    </article>
  );
}

function ProjectTable({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Owner</th>
            <th>Status</th>
            <th>End date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <button className="project-link" onClick={() => onSelect(p)}>
                  <span
                    className="project-dot"
                    style={{ background: statusColors[p.status] }}
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.id} · {p.client}
                    </small>
                  </span>
                </button>
              </td>
              <td>{p.owner}</td>
              <td>
                <span
                  className={
                    "status-pill " + p.status.toLowerCase().replace(" ", "-")
                  }
                >
                  {p.status}
                </span>
              </td>
              <td>{formatDate(p.end)}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => onSelect(p)}
                  aria-label="Open project"
                >
                  <ArrowUpRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectDialog({
  project,
  onClose,
  onSave,
}: {
  project?: Project;
  onClose: () => void;
  onSave: (p: Project) => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [start, setStart] = useState(project?.start ?? "2026-10-15");
  const [end, setEnd] = useState(project?.end ?? "");
  const [error, setError] = useState("");
  function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !client.trim() || !start || !end || end < start) {
      setError("Enter a project, client, and a valid date range.");
      return;
    }
    onSave(
      project
        ? { ...project, name, client, start, end }
        : {
            id: `PRJ-2026-${String(Date.now()).slice(-4)}`,
            name,
            client,
            owner: "Unassigned",
            start,
            end,
            progress: 0,
            status: "Upcoming",
            department: "Operations",
            budget: 0,
          },
    );
  }
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">
              {project ? "EDIT PROJECT" : "NEW PROJECT"}
            </span>
            <h2>{project ? "Update project details" : "Create a project"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form className="dialog-form" onSubmit={save}>
          <label>
            Project name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Client / partner
            <input value={client} onChange={(e) => setClient(e.target.value)} />
          </label>
          <div className="dialog-date-grid">
            <label>
              Start date
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              Save project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectCalendar({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
}) {
  const [view, setView] = useState<"Month" | "Week" | "Day">("Month");
  const [cursor, setCursor] = useState(new Date("2026-10-12"));
  const [selectedDate, setSelectedDate] = useState("2026-10-12");
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstDay = (monthStart.getDay() + 6) % 7;
  const days = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from({ length: firstDay + days }, (_, index) =>
    index < firstDay
      ? null
      : new Date(cursor.getFullYear(), cursor.getMonth(), index - firstDay + 1),
  );
  const projectsFor = (date: string) =>
    projects.filter((p) => p.start <= date && p.end >= date);
  const shift = (amount: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + amount, 12));
  const selected = parseDate(selectedDate);
  const visibleDates =
    view === "Day"
      ? [selected]
      : view === "Week"
        ? Array.from(
            { length: 7 },
            (_, i) =>
              new Date(
                selected.getFullYear(),
                selected.getMonth(),
                selected.getDate() + i,
              ),
          )
        : (cells.filter(Boolean) as Date[]);
  return (
    <section className="panel calendar-workspace">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">PROJECT SCHEDULE</span>
          <h2>Project calendar</h2>
          <p>Click a date or project to inspect the scheduled work.</p>
        </div>
        <div className="calendar-controls">
          <button
            className="icon-button"
            onClick={() => shift(-1)}
            aria-label="Previous period"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className="button button-secondary calendar-today"
            onClick={() => {
              setCursor(new Date(2026, 9, 12));
              setSelectedDate("2026-10-12");
            }}
          >
            Today
          </button>
          <button
            className="icon-button"
            onClick={() => shift(1)}
            aria-label="Next period"
          >
            <ArrowRight size={16} />
          </button>
          <div className="segmented">
            {(["Month", "Week", "Day"] as const).map((item) => (
              <button
                key={item}
                className={view === item ? "selected" : ""}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="calendar-period">
        <strong>
          {view === "Day"
            ? selected.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : cursor.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
        </strong>
        <span>{projects.length} scheduled projects</span>
      </div>
      <div className={"calendar-grid calendar-" + view.toLowerCase()}>
        {view !== "Day" &&
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <b className="calendar-weekday" key={day}>
              {day}
            </b>
          ))}
        {visibleDates.map((date) => {
          const key = dateKey(date);
          const items = projectsFor(key);
          return (
            <button
              className={
                "calendar-date " + (key === selectedDate ? "selected-date" : "")
              }
              key={key}
              onClick={() => {
                setSelectedDate(key);
                setCursor(date);
              }}
            >
              <span>{date.getDate()}</span>
              {items.map((p) => (
                <i
                  className="calendar-project"
                  key={p.id}
                  style={{ borderLeftColor: statusColors[p.status] }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(p);
                  }}
                >
                  <strong>{p.name}</strong>
                  <small>{p.status}</small>
                </i>
              ))}
            </button>
          );
        })}
      </div>
      <div className="calendar-selection">
        <strong>
          {selected.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </strong>
        {projectsFor(selectedDate).length ? (
          projectsFor(selectedDate).map((p) => (
            <button key={p.id} onClick={() => onSelect(p)}>
              <span
                className="project-dot"
                style={{ background: statusColors[p.status] }}
              />
              <span>{p.name}</span>
              <small>
                {p.start} → {p.end}
              </small>
              <ArrowUpRight size={14} />
            </button>
          ))
        ) : (
          <p>No projects scheduled for this date.</p>
        )}
      </div>
    </section>
  );
}

function PageHeader({
  eyebrow,
  title,
  copy,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <section className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action && (
        <button className="button button-primary" onClick={onAction}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </section>
  );
}

function ProjectGraphs({ projects }: { projects: Project[] }) {
  const status = ["In Progress", "Upcoming", "Completed"].map((name) => ({
    name,
    projects: projects.filter((project) => project.status === name).length,
  }));
  const monthly = [
    { month: "May", projects: 8 },
    { month: "Jun", projects: 11 },
    { month: "Jul", projects: 9 },
    { month: "Aug", projects: 14 },
    { month: "Sep", projects: 12 },
    { month: "Oct", projects: projects.length },
  ];
  const completed = [
    { month: "May", completed: 5 },
    { month: "Jun", completed: 7 },
    { month: "Jul", completed: 6 },
    { month: "Aug", completed: 10 },
    { month: "Sep", completed: 8 },
    {
      month: "Oct",
      completed: projects.filter((project) => project.status === "Completed")
        .length,
    },
  ];
  const departments = Array.from(
    new Set(projects.map((project) => project.department)),
  ).map((department) => ({
    department,
    projects: projects.filter((project) => project.department === department)
      .length,
  }));
  return (
    <section className="project-graphs">
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Project status</h2>
            <p>Projects by current status.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={status}>
            <CartesianGrid vertical={false} stroke="#edf1f6" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="projects" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Monthly projects</h2>
            <p>Projects created each month.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={monthly}>
            <CartesianGrid vertical={false} stroke="#edf1f6" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="projects" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Completed projects</h2>
            <p>Completed projects by month.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={completed}>
            <CartesianGrid vertical={false} stroke="#edf1f6" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Department projects</h2>
            <p>Projects assigned by department.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={departments} layout="vertical">
            <CartesianGrid horizontal={false} stroke="#edf1f6" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
            <YAxis
              dataKey="department"
              type="category"
              width={75}
              tick={{ fontSize: 9 }}
            />
            <Tooltip />
            <Bar dataKey="projects" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}

function DashboardHome({
  projects,
  onNavigate,
  onSelect,
}: {
  projects: Project[];
  onNavigate: (s: string) => void;
  onSelect: (p: Project) => void;
}) {
  const metrics = {
    total: projects.length,
    active: projects.filter((p) => p.status === "In Progress").length,
    upcoming: projects.filter((p) => p.status === "Upcoming").length,
    completed: projects.filter((p) => p.status === "Completed").length,
  };
  const pie = [
    { name: "In Progress", value: metrics.active },
    { name: "Upcoming", value: metrics.upcoming },
    { name: "Completed", value: metrics.completed },
  ];
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="WORKSPACE / OVERVIEW"
        title="Good morning"
        copy="Here is the latest pulse across your CMCS workspace."
        action="New project"
        onAction={() => onNavigate("Projects")}
      />
      <section className="stat-grid">
        <StatCard
          label="Total projects"
          value={String(metrics.total)}
          icon={ClipboardList}
        />
        <StatCard
          label="In progress"
          value={String(metrics.active)}
          icon={Activity}
          tone="indigo"
        />
        <StatCard
          label="Upcoming"
          value={String(metrics.upcoming)}
          icon={Clock3}
          tone="purple"
        />
        <StatCard
          label="Completed"
          value={String(metrics.completed)}
          icon={CheckCircle2}
          tone="green"
        />
      </section>
      <ProjectGraphs projects={projects} />
      <section className="dashboard-grid">
        <article className="panel chart-panel wide">
          <div className="panel-heading">
            <div>
              <h2>Revenue vs expenses</h2>
              <p>Monthly performance in thousands (USD).</p>
            </div>
            <Download size={16} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenue}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#edf1f6"
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.12}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Project status</h2>
              <p>Current portfolio split.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={pie}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={78}
              >
                {pie.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={statusColors[entry.name as Status]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mini-legend">
            {pie.map((item) => (
              <span key={item.name}>
                <i style={{ background: statusColors[item.name as Status] }} />
                {item.name} <b>{item.value}</b>
              </span>
            ))}
          </div>
        </article>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Project portfolio</h2>
            <p>Click any project for details.</p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("Projects")}
          >
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <ProjectTable projects={projects.slice(0, 4)} onSelect={onSelect} />
      </section>
    </section>
  );
}

function ModulePage({
  active,
  user,
  onNotify,
}: {
  active: string;
  user: User;
  onNotify: (s: string) => void;
}) {
  const rows =
    active === "Finance"
      ? [
          [
            "INV-2026-024",
            "UNDP Community Awareness",
            "$42,000",
            "Pending approval",
          ],
          ["INV-2026-021", "National Election Coverage", "$58,000", "Approved"],
          ["INV-2026-019", "Youth Media Training", "$19,500", "Paid"],
        ]
      : [
          ["Project delivery", "Operations", "86%", "On track"],
          ["Team utilisation", "People", "78%", "Healthy"],
          ["Budget variance", "Finance", "+4.2%", "Review"],
        ];
  return (
    <section className="page-section">
      <PageHeader
        eyebrow={`${user.department.toUpperCase()} / WORKSPACE`}
        title={active}
        copy={`Manage ${active.toLowerCase()} with clear, actionable workflows.`}
        action="Create request"
        onAction={() => onNotify("Form opened — ready for input")}
      />
      <div className="module-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input placeholder={`Search ${active.toLowerCase()}...`} />
        </label>
        <button className="button button-secondary">
          <Download size={14} /> Export
        </button>
      </div>
      <div className="panel">
        <div className="list-heading">
          <span>Item</span>
          <span>Department</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {rows.map((row) => (
          <div className="list-row" key={row[0]}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span className="status-pill approved">{row[2]}</span>
            <button
              className="text-button"
              onClick={() => onNotify(`${row[0]} opened`)}
            >
              Open <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinancePage({
  projects,
  onNotify,
}: {
  projects: Project[];
  onNotify: (s: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState(invoiceSeed);
  const [payments, setPayments] = useState(paymentSeed);
  const [selected, setSelected] = useState<string | null>(null);
  const records = [
    ...invoices.map((invoice) => ({ ...invoice, type: "Invoice" as const })),
    ...payments.map((payment) => ({ ...payment, type: "Payment" as const })),
  ].filter((record) => {
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;
    const matchesType = typeFilter === "All" || record.type === typeFilter;
    const matchesSearch = `${record.id} ${record.projectId} ${record.project}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });
  const selectedRecord = records.find((record) => record.id === selected);
  function generateInvoice(invoiceId: string) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, generationStatus: "Generated" }
          : invoice,
      ),
    );
    onNotify(`${invoiceId} marked as generated.`);
  }
  function markPaid(invoiceId: string) {
    setInvoices((current) => current.map((invoice) =>
      invoice.id === invoiceId
        ? { ...invoice, paymentStatus: "Paid" }
        : invoice,
    ));
    setPayments((current) => current.map((payment) =>
      payment.id === invoiceId
        ? { ...payment, status: "Paid", paymentStatus: "Paid" }
        : payment,
    ));
    onNotify(`${invoiceId} marked as paid.`);
  }
  function updatePaymentStatus(paymentId: string) {
    setPayments((current) => current.map((payment) =>
      payment.id === paymentId
        ? { ...payment, status: "Paid", paymentStatus: "Paid" }
        : payment,
    ));
    onNotify(`${paymentId} marked as paid.`);
  }
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="FINANCE / WORKSPACE"
        title="Finance"
        copy="Track project invoices, payments and linked financial records."
        action="Create request"
        onAction={() => onNotify("Finance request form opened")}
      />
      <div className="filter-bar">
        <label className="custom-filter">
          Record type
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All</option>
            <option>Invoice</option>
            <option>Payment</option>
          </select>
        </label>
        <label className="custom-filter">
          Approval status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Pending approval</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Unpaid</option>
            <option>Paid</option>
          </select>
        </label>
        <label className="inline-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project ID or record..."
          />
        </label>
      </div>
      <div className="panel">
        <div className="list-heading">
          <span>Record</span>
          <span>Project</span>
          <span>Quotation</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {records.map((record) => (
          <div className="list-row" key={`${record.type}-${record.id}`}>
            <strong>
              {record.id}
              <small>{record.type}</small>
            </strong>
            <span>
              {record.projectId}
              <small>{record.project}</small>
            </span>
            <span>
              {record.quotationId}
              <small>{record.paymentStatus}</small>
            </span>
            <span className={"status-pill " + record.status.toLowerCase().replaceAll(" ", "-")}>
              {record.status}
            </span>
            <button className="text-button" onClick={() => setSelected(record.id)}>
              Review <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
        {!records.length && (
          <div className="empty-state">
            <Wallet size={28} />
            <h3>No financial records found</h3>
            <p>Adjust the status, type or search filters.</p>
          </div>
        )}
      </div>
      {selectedRecord && (
        <div className="panel finance-detail-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{selectedRecord.type} · {selectedRecord.id}</span>
              <h2>{selectedRecord.project}</h2>
              <p>Linked Project ID: {selectedRecord.projectId}</p>
            </div>
            <button className="icon-button" onClick={() => setSelected(null)} aria-label="Close details">
              <X size={16} />
            </button>
          </div>
          <div className="quotation-details">
            <span>Project client<strong>{projects.find((p) => p.id === selectedRecord.projectId)?.client ?? "—"}</strong></span>
            <span>Amount<strong>{money(selectedRecord.amount)}</strong></span>
            <span>Quotation ID<strong>{selectedRecord.quotationId}</strong></span>
            <span>Approval status<strong>{selectedRecord.status}</strong></span>
            <span>Payment status<strong>{selectedRecord.paymentStatus}</strong></span>
            {selectedRecord.type === "Invoice" && (
            <span>Invoice generation<strong>{selectedRecord.generationStatus}</strong></span>
            )}
          </div>
          {selectedRecord.type === "Invoice" &&
            selectedRecord.generationStatus === "Not generated" && (
            <div className="dialog-actions">
            <button className="button button-primary" onClick={() => generateInvoice(selectedRecord.id)}>
              Generate invoice
            </button>
            </div>
          )}
          {selectedRecord.type === "Invoice" && selectedRecord.paymentStatus === "Unpaid" && (
            <div className="dialog-actions">
              <button className="button button-primary" onClick={() => markPaid(selectedRecord.id)}>
                Mark as paid
              </button>
            </div>
          )}
          {selectedRecord.type === "Payment" && selectedRecord.paymentStatus === "Unpaid" && (
            <div className="dialog-actions">
              <button className="button button-primary" onClick={() => updatePaymentStatus(selectedRecord.id)}>
                Mark as paid
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function CeoApproval({
  project,
  approval,
  onSubmit,
}: {
  project: Project;
  approval?: { status: Approval; comment: string };
  onSubmit: (project: Project, status: Approval, comment: string) => void;
}) {
  const [comment, setComment] = useState(approval?.comment ?? "");
  return (
    <div className="approval-panel">
      <div className="approval-panel-head">
        <strong>CEO review</strong>
        <span className="status-pill approved">
          {approval?.status ?? "Pending approval"}
        </span>
      </div>
      <label>
        Comment
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add an approval or rejection comment..."
        />
      </label>
      <div className="dialog-actions">
        <button
          className="button button-secondary"
          onClick={() => onSubmit(project, "Rejected", comment)}
        >
          Reject
        </button>
        <button
          className="button button-primary"
          onClick={() => onSubmit(project, "Approved", comment)}
        >
          Approve
        </button>
      </div>
    </div>
  );
}

export function CeoDashboardHome({
  projects,
  notifications,
  onNavigate,
  onSelect,
}: {
  projects: Project[];
  notifications: Notification[];
  onNavigate: (page: string) => void;
  onSelect: (project: Project) => void;
}) {
  const present = attendanceToday.filter(
    (person) => person.status === "Present",
  ).length;
  const absent = attendanceToday.length - present;
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="EXECUTIVE / OVERVIEW"
        title="Good morning, Ahmad"
        copy="Monitor project delivery, approvals, attendance and financial visibility."
      />
      <section className="stat-grid">
        <StatCard
          label="Total projects"
          value={String(projects.length)}
          icon={ClipboardList}
        />
        <StatCard
          label="In progress"
          value={String(
            projects.filter((p) => p.status === "In Progress").length,
          )}
          icon={Activity}
          tone="indigo"
        />
        <StatCard
          label="Upcoming"
          value={String(projects.filter((p) => p.status === "Upcoming").length)}
          icon={Clock3}
          tone="purple"
        />
        <StatCard
          label="Pending approvals"
          value="2"
          icon={CheckCircle2}
          tone="green"
        />
      </section>
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Attendance today</h2>
              <p>
                {present} present · {absent} absent · 11 October 2026
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Employees")}
            >
              Open attendance <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="attendance-summary">
            <div>
              <strong>{present}</strong>
              <span>Present</span>
            </div>
            <div>
              <strong>{absent}</strong>
              <span>Absent</span>
            </div>
          </div>
          <div className="ceo-attendance-list">
            {attendanceToday.map((person) => (
              <div className="ceo-attendance-row" key={person.name}>
                <span
                  className={"attendance-dot " + person.status.toLowerCase()}
                />
                <strong>{person.name}</strong>
                <small>{person.department}</small>
                <span className={"status-pill " + person.status.toLowerCase()}>
                  {person.status}
                </span>
                <time>{person.time}</time>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Notifications</h2>
              <p>Recent approvals and operational updates.</p>
            </div>
            <Bell size={16} />
          </div>
          <div className="ceo-notification-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() =>
                  onNavigate(
                    notification.kind === "Quotation"
                      ? "Quotations"
                      : notification.kind === "Project approval"
                        ? "Project Approvals"
                        : "Projects",
                  )
                }
              >
                <span className="notification-icon">
                  <Bell size={13} />
                </span>
                <span>
                  <strong>{notification.title}</strong>
                  <small>{notification.detail}</small>
                  <time>{notification.time}</time>
                </span>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </article>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Project portfolio</h2>
            <p>
              Projects are read-only for the CEO. Click for details and approval
              actions.
            </p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("Projects")}
          >
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <ProjectTable projects={projects} onSelect={onSelect} />
      </section>
    </section>
  );
}

function CeoApprovals({
  projects,
  approvals,
  onSubmit,
  onSelect,
}: {
  projects: Project[];
  approvals: Record<string, { status: Approval; comment: string }>;
  onSubmit: (project: Project, status: Approval, comment: string) => void;
  onSelect: (project: Project) => void;
}) {
  const pending = projects
    .filter(
      (project) =>
        approvals[project.id]?.status === "Pending approval",
    );
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="EXECUTIVE / APPROVALS"
        title="Project approvals"
        copy="Review projects submitted by the Head of Operations before work begins."
      />
      <div className="approval-notice">
        <Bell size={17} />
        <div>
          <strong>
            {pending.length} project submissions require your decision
          </strong>
          <span>
            All project information and assignments are locked for CEO accounts.
          </span>
        </div>
      </div>
      <div className="approval-card-list">
        {pending.map((project) => (
          <article className="panel approval-card" key={project.id}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  NEW SUBMISSION · HEAD OF OPERATIONS
                </span>
                <h2>{project.name}</h2>
                <p>
                  {project.client} · {project.id}
                </p>
              </div>
              <span className="status-pill pending-approval">
                Pending approval
              </span>
            </div>
            <div className="approval-detail-grid">
              <span>
                Owner<strong>{project.owner}</strong>
              </span>
              <span>
                Department<strong>{project.department}</strong>
              </span>
              <span>
                Schedule
                <strong>
                  {formatDate(project.start)} → {formatDate(project.end)}
                </strong>
              </span>
              <span>
                Budget<strong>{money(project.budget)}</strong>
              </span>
            </div>
            <CeoApproval
              project={project}
              approval={approvals[project.id]}
              onSubmit={onSubmit}
            />
            <button
              className="text-button approval-detail-link"
              onClick={() => onSelect(project)}
            >
              View full project details <ArrowUpRight size={14} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function QuotationsPage({
  projects,
  quotationApprovals,
  onDecision,
}: {
  projects: Project[];
  quotationApprovals: Record<string, { status: string; comment: string }>;
  onDecision: (id: string, status: string, comment: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const filteredQuotations = quotationSeed.filter((quotation) => {
    const status = quotationApprovals[quotation.id]?.status ?? quotation.status;
    return statusFilter === "All" || status === statusFilter;
  });
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="FINANCE / QUOTATIONS"
        title="Quotation management"
        copy="Review supplier quotations linked to their CMCS project IDs."
      />
      <div className="filter-bar">
        <label className="custom-filter">
          Filter quotations
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All quotations</option>
            <option value="Pending approval">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
      </div>
      <div className="quotation-list">
        {filteredQuotations.map((quotation) => (
          <QuotationCard
            key={quotation.id}
            quotation={quotation}
            project={projects.find((item) => item.id === quotation.projectId)}
            decision={quotationApprovals[quotation.id]}
            onDecision={onDecision}
          />
        ))}
        {!filteredQuotations.length && (
          <div className="empty-state">
            <FileText size={28} />
            <h3>No quotations found</h3>
            <p>Choose another approval status to view quotations.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function EmployeesPage({ projects }: { projects: Project[] }) {
  const [from, setFrom] = useState("2026-10-07");
  const [to, setTo] = useState("2026-10-11");
  const [employee, setEmployee] = useState("All");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
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
  return (
    <section className="page-section">
      <PageHeader
        eyebrow="PEOPLE / EMPLOYEES"
        title="Employees"
        copy="Review employee attendance history and project completion performance."
      />
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
    </section>
  );
}

function QuotationCard({
  quotation,
  project,
  decision,
  onDecision,
}: {
  quotation: (typeof quotationSeed)[number];
  project?: Project;
  decision?: { status: string; comment: string };
  onDecision: (id: string, status: string, comment: string) => void;
}) {
  const [comment, setComment] = useState(decision?.comment ?? "");
  const status = decision?.status ?? quotation.status;
  return (
    <article className="panel quotation-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">
            {quotation.id} · {quotation.projectId}
          </span>
          <h2>{quotation.project}</h2>
          <p>
            Submitted by {quotation.submittedBy} on {quotation.submitted}
          </p>
        </div>
        <span
          className={"status-pill " + status.toLowerCase().replace(" ", "-")}
        >
          {status}
        </span>
      </div>
      <div className="quotation-details">
        <span>
          Supplier<strong>{quotation.vendor}</strong>
        </span>
        <span>
          Quoted amount<strong>{money(quotation.amount)}</strong>
        </span>
        <span>
          Project ID<strong>{quotation.projectId}</strong>
        </span>
        <span>
          Client<strong>{project?.client ?? quotation.project}</strong>
        </span>
        <span>
          Project owner<strong>{project?.owner ?? "Project owner unavailable"}</strong>
        </span>
        <span>
          Schedule
          <strong>
            {project
              ? `${formatDate(project.start)} → ${formatDate(project.end)}`
              : "Project details unavailable"}
          </strong>
        </span>
      </div>
      {status === "Pending approval" && (
        <div className="quotation-actions">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
          />
          <button
            className="button button-secondary"
            onClick={() => onDecision(quotation.id, "Rejected", comment)}
          >
            Reject
          </button>
          <button
            className="button button-primary"
            onClick={() => onDecision(quotation.id, "Approved", comment)}
          >
            Approve
          </button>
        </div>
      )}
    </article>
  );
}

export function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const role =
    (Object.keys(users) as Role[]).find(
      (key) => users[key].email === user.email,
    ) ?? "employee";
  const [active, setActive] = useState("Dashboard");
  const [projects, setProjects] = useState(projectsSeed);
  const [customFilter, setCustomFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"new" | Project | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [approvals, setApprovals] = useState<
    Record<string, { status: Approval; comment: string }>
  >({});
  const [notifications, setNotifications] =
    useState<Notification[]>(defaultNotifications);
  const [quotationApprovals, setQuotationApprovals] = useState<
    Record<string, { status: string; comment: string }>
  >({});
  const [toast, setToast] = useState("");
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setNotifications([...defaultNotifications, ...readNotifications()]);
  }, []);
  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (customFilter === "All" ||
            p.status === customFilter ||
            p.department === customFilter) &&
          `${p.name} ${p.client} ${p.owner}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [projects, customFilter, search],
  );
  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }
  function addNotification(notification: Omit<Notification, "id" | "time">) {
    const next: Notification = {
      ...notification,
      id: `NTF-${Date.now()}`,
      time: "Just now",
    };
    const updated = [...readNotifications(), next];
    window.localStorage.setItem(notificationStorageKey, JSON.stringify(updated));
    setNotifications([...defaultNotifications, ...updated]);
  }
  function saveProject(project: Project) {
    if (role === "ceo") {
      notify("CEO accounts have read-only project permissions.");
      return;
    }
    const existing = projects.some((item) => item.id === project.id);
    setProjects((current) =>
      existing
        ? current.map((item) => (item.id === project.id ? project : item))
        : [project, ...current],
    );
    if (!existing && role === "hoo") {
      setApprovals((current) => ({
        ...current,
        [project.id]: { status: "Pending approval", comment: "" },
      }));
      addNotification({
        title: "New project requires approval",
        detail: `Head of Operations submitted ${project.name}.`,
        kind: "Project approval",
        recipient: "ceo",
      });
    }
    setDialog(null);
    notify("Project saved successfully");
  }
  function updateApproval(project: Project, status: Approval, comment: string) {
    setApprovals((current) => ({
      ...current,
      [project.id]: { status, comment },
    }));
    if (status === "Approved" || status === "Rejected") {
      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? { ...item, status: status === "Approved" ? "Upcoming" : "Rejected" }
            : item,
        ),
      );
      addNotification({
        title: `Project ${status.toLowerCase()}`,
        detail: `${project.name} was ${status.toLowerCase()} by the CEO.`,
        kind: "Project update",
        recipient: "hoo",
      });
    }
    setSelected(null);
    notify(`Project ${status.toLowerCase()}.`);
  }
  const visibleNotifications = notifications.filter(
    (notification) =>
      notification.recipient === "all" || notification.recipient === role,
  );
  function updateQuotation(id: string, status: string, comment: string) {
    setQuotationApprovals((current) => ({
      ...current,
      [id]: { status, comment },
    }));
    notify(`Quotation ${status.toLowerCase()}.`);
  }
  const isCeo = role === "ceo";
  const visibleNav = isCeo ? ceoNav : nav;
  return (
    <div className="app-shell is-visible">
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <div className="brand">
          <div className="brand-mark">
            <img src="/assets/chinar-logo.png" alt="CMCS" />
          </div>
          <div>
            <strong>CMCS</strong>
            <span>Management workspace</span>
          </div>
          <button
            className="sidebar-close icon-button"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="role-chip">
          <ShieldCheck size={14} /> {user.role}
        </div>
        <nav className="primary-nav">
          {visibleNav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={"nav-item " + (active === label ? "active" : "")}
              onClick={() => {
                setActive(label);
                setMobile(false);
              }}
            >
              <Icon size={17} />
              {label}
              {(label === "Projects" ||
                label === "Project Approvals" ||
                label === "Quotations") && (
                <span className="nav-count">
                  {label === "Projects"
                    ? projects.length
                    : label === "Quotations"
                      ? quotationSeed.filter(
                          (item) => item.status === "Pending approval",
                        ).length
                        : Object.values(approvals).filter(
                            (item) => item.status === "Pending approval",
                          ).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setActive("Settings")}>
            <Settings size={17} />
            Settings
          </button>
          <div className="user-mini">
            <div className="avatar">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button className="icon-button" onClick={onLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>CMCS workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="topbar-actions">
            <div className="avatar">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-content">
          {active === "Dashboard" &&
            (isCeo ? (
              <CeoDashboardHome
                projects={projects}
                notifications={visibleNotifications}
                onNavigate={setActive}
                onSelect={setSelected}
              />
            ) : (
              <DashboardHome
                projects={projects}
                onNavigate={setActive}
                onSelect={setSelected}
              />
            ))}
          {active === "Project Approvals" && (
            <CeoApprovals
              projects={projects}
              approvals={approvals}
              onSubmit={updateApproval}
              onSelect={setSelected}
            />
          )}
          {active === "Quotations" && (
            <QuotationsPage
              projects={projects}
              quotationApprovals={quotationApprovals}
              onDecision={updateQuotation}
            />
          )}
          {active === "Finance" && (
            <FinancePage
              projects={projects}
              onNotify={notify}
            />
          )}
          {active === "Notifications" && (
            <section className="page-section">
              <PageHeader
                eyebrow="EXECUTIVE / NOTIFICATIONS"
                title="Notifications"
                copy="Approval requests and operational updates for the CEO."
              />
              <div className="panel ceo-notification-list">
                {visibleNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() =>
                      setActive(
                        notification.kind === "Quotation"
                          ? "Quotations"
                          : notification.kind === "Project approval"
                            ? "Project Approvals"
                            : "Projects",
                      )
                    }
                  >
                    <span className="notification-icon">
                      <Bell size={13} />
                    </span>
                    <span>
                      <strong>{notification.title}</strong>
                      <small>{notification.detail}</small>
                      <time>{notification.time}</time>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </section>
          )}
          {active === "Projects" && (
            <section className="page-section">
              <PageHeader
                eyebrow="OPERATIONS / PROJECTS"
                title="Projects"
                copy="Track approved work from start to completion."
                action={isCeo ? undefined : "New project"}
                onAction={() => setDialog("new")}
              />
              <div className="filter-bar">
                <label className="custom-filter">
                  Filter projects
                  <select
                    value={customFilter}
                    onChange={(e) => setCustomFilter(e.target.value)}
                  >
                    <option value="All">All projects</option>
                    <option value="In Progress">In progress</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
                <label className="inline-search">
                  <Search size={15} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects..."
                  />
                </label>
              </div>
              <div className="panel">
                {filtered.length ? (
                  <ProjectTable projects={filtered} onSelect={setSelected} />
                ) : (
                  <div className="empty-state">
                    <Search size={30} />
                    <h3>No matching projects</h3>
                    <p>Try another keyword or clear the current filters.</p>
                  </div>
                )}
              </div>
            </section>
          )}
          {active === "Project Calendar" && (
            <section className="page-section">
              <ProjectCalendar
                projects={projects.filter((project) =>
                  ["Upcoming", "In Progress", "Completed"].includes(
                    project.status,
                  ),
                )}
                onSelect={setSelected}
              />
            </section>
          )}
          {active === "Employees" && isCeo && (
            <EmployeesPage projects={projects} />
          )}
          {!isCeo &&
            [
              "Assignments",
              "People & attendance",
              "Documents",
              "Reports",
              "Settings",
            ].includes(active) && (
              <ModulePage active={active} user={user} onNotify={notify} />
            )}
        </div>
      </main>
      {(dialog === "new" || dialog) && !isCeo && (
        <ProjectDialog
          project={dialog === "new" ? undefined : dialog}
          onClose={() => setDialog(null)}
          onSave={saveProject}
        />
      )}
      {selected && (
        <div className="dialog-backdrop" role="presentation">
          <div className="dialog project-detail">
            <div className="dialog-head">
              <div>
                <span className="eyebrow">PROJECT DETAIL</span>
                <h2>{selected.name}</h2>
                <p>
                  {selected.client} · {selected.id}
                </p>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="detail-grid">
              <span>
                Owner<strong>{selected.owner}</strong>
              </span>
              <span>
                Status
                <strong
                  className={
                    "status-pill " +
                    selected.status.toLowerCase().replace(" ", "-")
                  }
                >
                  {selected.status}
                </strong>
              </span>
              <span>
                Schedule
                <strong>
                  {formatDate(selected.start)} → {formatDate(selected.end)}
                </strong>
              </span>
              <span>
                Progress<strong>{selected.progress}% complete</strong>
              </span>
            </div>
            {isCeo && approvals[selected.id]?.status === "Pending approval" ? (
              <CeoApproval
                project={selected}
                approval={approvals[selected.id]}
                onSubmit={updateApproval}
              />
            ) : (
              <div className="dialog-actions">
                <button
                  className="button button-secondary"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
                {!isCeo && (
                  <button
                    className="button button-primary"
                    onClick={() => {
                      setSelected(null);
                      setDialog(selected);
                    }}
                  >
                    Edit project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
