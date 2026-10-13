"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Archive, Bell, CalendarDays, CheckCircle2, ClipboardList, Clock3,
  FileText, Package, Plus, Search, Settings2, Trash2, UserCircle, X,
} from "lucide-react";
import { User } from "../../lib/types";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type AdminTask = { id: string; title: string; category: string; owner: string; due: string; priority: "High" | "Medium" | "Low"; status: TaskStatus; detail: string };

const seedTasks: AdminTask[] = [
  { id: "ADM-026", title: "Restock reception supplies", category: "Office supplies", owner: "Maryam Rahimi", due: "14 Oct 2026", priority: "Medium", status: "In Progress", detail: "Check stock levels and submit the replenishment list to the office coordinator." },
  { id: "ADM-025", title: "Archive September records", category: "Records", owner: "Maryam Rahimi", due: "15 Oct 2026", priority: "Low", status: "Pending", detail: "Digitise signed forms and file the September records in the correct archive folders." },
  { id: "ADM-024", title: "Coordinate visitor access list", category: "Front office", owner: "Maryam Rahimi", due: "16 Oct 2026", priority: "High", status: "Pending", detail: "Confirm visitor names with department coordinators before the weekly leadership meeting." },
  { id: "ADM-023", title: "Update asset register", category: "Inventory", owner: "Maryam Rahimi", due: "10 Oct 2026", priority: "Medium", status: "Completed", detail: "Reconcile tagged office equipment with the latest handover records." },
  { id: "ADM-022", title: "Prepare meeting room setup", category: "Meetings", owner: "Maryam Rahimi", due: "09 Oct 2026", priority: "Low", status: "Completed", detail: "Prepare seating, stationery, and printed agendas for the operations review." },
];

const statusClass = (status: TaskStatus) => status.toLowerCase().replace(" ", "-");

export function AdministrationEmployeePage({ active, user, onNotify }: { active: string; user: User; onNotify: (message: string) => void }) {
  const [tasks, setTasks] = useState(seedTasks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | TaskStatus>("All");
  const [selected, setSelected] = useState<AdminTask | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminTask | null>(null);

  const visibleTasks = useMemo(() => tasks.filter((task) =>
    (filter === "All" || task.status === filter) &&
    `${task.title} ${task.category} ${task.id}`.toLowerCase().includes(query.toLowerCase())
  ), [tasks, query, filter]);

  const updateStatus = (task: AdminTask, status: TaskStatus) => {
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status } : item));
    setSelected((current) => current?.id === task.id ? { ...task, status } : current);
    onNotify(`${task.id} marked ${status.toLowerCase()}.`);
  };
  const removeTask = () => {
    if (!confirmDelete) return;
    setTasks((current) => current.filter((task) => task.id !== confirmDelete.id));
    setConfirmDelete(null);
    onNotify("Administrative task deleted.");
  };

  if (active === "Administrative Tasks") return <TasksView tasks={visibleTasks} query={query} filter={filter} onQuery={setQuery} onFilter={setFilter} onSelect={setSelected} onStatus={updateStatus} onDelete={setConfirmDelete} confirmDelete={confirmDelete} onCancelDelete={() => setConfirmDelete(null)} onConfirmDelete={removeTask} onCreate={() => setShowForm(true)} showForm={showForm} onCloseForm={() => setShowForm(false)} onCreateTask={(task) => { setTasks((current) => [task, ...current]); setShowForm(false); onNotify("Administrative task created."); }} />;
  if (active === "Documents & Records") return <SimpleList title="Documents & records" eyebrow="ADMINISTRATION / RECORDS" copy="Find and manage the office records assigned to your workspace." icon={FileText} items={["Employee handbook 2026", "September attendance archive", "Office supplier contracts", "Visitor access register"]} action="Upload record" onAction={() => onNotify("Record upload is ready for the next file.")} />;
  if (active === "Assets & Inventory") return <SimpleList title="Assets & inventory" eyebrow="ADMINISTRATION / INVENTORY" copy="Keep office supplies and equipment records accurate." icon={Package} items={["Reception supplies · 24 items", "Printer toner · 8 units", "Meeting room equipment · 12 items", "Staff access cards · 36 active"]} action="Add inventory item" onAction={() => onNotify("Inventory item form opened.")} />;
  if (active === "Office Maintenance") return <SimpleList title="Office maintenance" eyebrow="ADMINISTRATION / MAINTENANCE" copy="Track facilities issues and planned office upkeep." icon={Settings2} items={["Reception lighting inspection · Due 17 Oct", "Air conditioning service · Scheduled 22 Oct", "Kitchen supplies check · Completed", "Boardroom projector issue · In progress"]} action="Report issue" onAction={() => onNotify("Maintenance issue form opened.")} />;
  if (active === "Meetings & Schedule") return <SimpleList title="Meetings & schedule" eyebrow="ADMINISTRATION / SCHEDULE" copy="Coordinate meetings, rooms, and administrative deadlines." icon={CalendarDays} items={["Operations review · 14 Oct · 10:00 AM", "Monthly office planning · 18 Oct · 09:30 AM", "Supplier review · 21 Oct · 02:00 PM"]} action="Schedule meeting" onAction={() => onNotify("Meeting scheduling form opened.")} />;
  if (active === "Requests") return <RequestsView onNotify={onNotify} />;
  if (active === "Notifications") return <NotificationsView />;
  if (active === "My Profile") return <ProfileView user={user} />;

  const counts = { total: tasks.length, pending: tasks.filter((task) => task.status === "Pending").length, progress: tasks.filter((task) => task.status === "In Progress").length, completed: tasks.filter((task) => task.status === "Completed").length };
  return <section className="page-section administration-workspace">
    <PageHeader eyebrow="ADMINISTRATION / OFFICE OPERATIONS" title={`Good morning, ${user.firstName}`} copy="Manage office operations, records, assets, and administrative follow-ups from one workspace." />
    <div className="stat-grid admin-dashboard-stats">
      <StatCard label="Total tasks" value={String(counts.total)} icon={ClipboardList} />
      <StatCard label="Pending tasks" value={String(counts.pending)} icon={Clock3} />
      <StatCard label="In progress" value={String(counts.progress)} icon={Settings2} />
      <StatCard label="Completed tasks" value={String(counts.completed)} icon={CheckCircle2} />
    </div>
    <div className="admin-dashboard-grid">
      <div className="panel admin-dashboard-panel"><PanelTitle title="Recent administrative tasks" copy="Your latest office operations work." icon={ClipboardList} /><div className="admin-task-list">{tasks.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} onClick={() => setSelected(task)} />)}</div><button className="button button-link" onClick={() => onNotify("Select Administrative Tasks from the sidebar to view the full list.")}>View all tasks <span>→</span></button></div>
      <div className="panel admin-dashboard-panel"><PanelTitle title="Task status" copy="Current workload by status." icon={CheckCircle2} /><div className="admin-status-chart">{[["Pending", counts.pending, "#f2a93b"], ["In Progress", counts.progress, "#2563eb"], ["Completed", counts.completed, "#15956c"]].map(([label, value, color]) => <div className="admin-chart-row" key={label}><div><span>{label}</span><strong>{value}</strong></div><div className="admin-chart-track"><i style={{ width: `${counts.total ? Number(value) / counts.total * 100 : 0}%`, background: color as string }} /></div></div>)}</div></div>
    </div>
    <div className="admin-dashboard-grid admin-dashboard-grid-bottom">
      <div className="panel admin-dashboard-panel"><PanelTitle title="Upcoming deadlines" copy="Tasks requiring attention soon." icon={CalendarDays} />{tasks.filter((task) => task.status !== "Completed").slice(0, 3).map((task) => <Deadline key={task.id} task={task} onClick={() => setSelected(task)} />)}</div>
      <div className="panel admin-dashboard-panel"><PanelTitle title="Pending requests" copy="Requests awaiting administrative action." icon={Archive} /><RequestLine title="Printer supplies replenishment" meta="Submitted by Production · 12 Oct" /><RequestLine title="Visitor access approval" meta="Submitted by Operations · 13 Oct" /><button className="button button-link" onClick={() => onNotify("Select Requests from the sidebar to review all requests.")}>Review requests <span>→</span></button></div>
    </div>
    {selected && <TaskDetails task={selected} onClose={() => setSelected(null)} onStatus={updateStatus} onDelete={() => { setConfirmDelete(selected); setSelected(null); }} />}
    {showForm && <TaskForm onClose={() => setShowForm(false)} onCreate={(task) => { setTasks((current) => [task, ...current]); setShowForm(false); onNotify("Administrative task created."); }} />}
    {confirmDelete && <ConfirmDialog title="Delete administrative task?" copy={`This will remove ${confirmDelete.id} from your task list.`} onCancel={() => setConfirmDelete(null)} onConfirm={removeTask} />}
  </section>;
}

function PanelTitle({ title, copy, icon: Icon }: { title: string; copy: string; icon: typeof Bell }) { return <div className="panel-heading"><div><h2>{title}</h2><p>{copy}</p></div><Icon size={17} /></div>; }
function TaskRow({ task, onClick }: { task: AdminTask; onClick: () => void }) { return <button className="admin-task-row" onClick={onClick}><span className={`admin-task-dot ${statusClass(task.status)}`} /><span><strong>{task.title}</strong><small>{task.id} · {task.category}</small></span><b className={`admin-status ${statusClass(task.status)}`}>{task.status}</b></button>; }
function Deadline({ task, onClick }: { task: AdminTask; onClick: () => void }) { return <button className="admin-deadline" onClick={onClick}><span><strong>{task.due}</strong><small>{task.id} · {task.title}</small></span><b className={`admin-priority ${task.priority.toLowerCase()}`}>{task.priority}</b></button>; }
function RequestLine({ title, meta }: { title: string; meta: string }) { return <div className="admin-request-line"><span><strong>{title}</strong><small>{meta}</small></span><b>Pending</b></div>; }

function TasksView({ tasks, query, filter, onQuery, onFilter, onSelect, onStatus, onDelete, confirmDelete, onCancelDelete, onConfirmDelete, onCreate, showForm, onCloseForm, onCreateTask }: { tasks: AdminTask[]; query: string; filter: "All" | TaskStatus; onQuery: (value: string) => void; onFilter: (value: "All" | TaskStatus) => void; onSelect: (task: AdminTask) => void; onStatus: (task: AdminTask, status: TaskStatus) => void; onDelete: (task: AdminTask) => void; confirmDelete: AdminTask | null; onCancelDelete: () => void; onConfirmDelete: () => void; onCreate: () => void; showForm: boolean; onCloseForm: () => void; onCreateTask: (task: AdminTask) => void }) {
  return <section className="page-section administration-workspace"><PageHeader eyebrow="ADMINISTRATION / TASKS" title="Administrative tasks" copy="Search, prioritize, and update office administration work." action="New task" onAction={onCreate} /><div className="admin-task-toolbar"><label><Search size={15} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search tasks, categories, or IDs" /></label><select value={filter} onChange={(event) => onFilter(event.target.value as "All" | TaskStatus)}><option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option></select></div><div className="panel admin-full-task-list">{tasks.map((task) => <div className="admin-full-task" key={task.id}><TaskRow task={task} onClick={() => onSelect(task)} /><div className="admin-task-actions"><select value={task.status} onChange={(event) => onStatus(task, event.target.value as TaskStatus)} aria-label={`Update ${task.id} status`}><option>Pending</option><option>In Progress</option><option>Completed</option></select><button className="icon-button" onClick={() => onDelete(task)} aria-label={`Delete ${task.id}`}><Trash2 size={15} /></button></div></div>)}{!tasks.length && <div className="empty-state"><ClipboardList size={30} /><h3>No administrative tasks found</h3><p>Try another filter or create a new task.</p></div>}</div>{showForm && <TaskForm onClose={onCloseForm} onCreate={onCreateTask} />}{confirmDelete && <ConfirmDialog title="Delete administrative task?" copy={`This will remove ${confirmDelete.id} from your task list.`} onCancel={onCancelDelete} onConfirm={onConfirmDelete} />}</section>;
}

function TaskDetails({ task, onClose, onStatus, onDelete }: { task: AdminTask; onClose: () => void; onStatus: (task: AdminTask, status: TaskStatus) => void; onDelete: () => void }) { return <div className="admin-dialog-backdrop" onClick={onClose}><div className="panel admin-task-dialog" onClick={(event) => event.stopPropagation()}><div className="panel-heading"><div><span className="eyebrow">{task.id} · {task.category}</span><h2>{task.title}</h2><p>{task.detail}</p></div><button className="icon-button" onClick={onClose} aria-label="Close task details"><X size={16} /></button></div><div className="admin-detail-grid"><span><small>Due date</small><strong>{task.due}</strong></span><span><small>Priority</small><strong>{task.priority}</strong></span><span><small>Assigned to</small><strong>{task.owner}</strong></span><span><small>Status</small><strong>{task.status}</strong></span></div><div className="admin-dialog-actions"><button className="button" onClick={onDelete}>Delete</button><select value={task.status} onChange={(event) => onStatus(task, event.target.value as TaskStatus)}><option>Pending</option><option>In Progress</option><option>Completed</option></select><button className="button button-primary" onClick={onClose}>Done</button></div></div></div>; }

function TaskForm({ onClose, onCreate }: { onClose: () => void; onCreate: (task: AdminTask) => void }) { const [title, setTitle] = useState(""); const [category, setCategory] = useState("Office supplies"); const [due, setDue] = useState(""); const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim() || !due.trim()) return; onCreate({ id: `ADM-${String(Date.now()).slice(-3)}`, title, category, owner: "Maryam Rahimi", due, priority: "Medium", status: "Pending", detail: "New office administration task created from the workspace." }); }; return <div className="admin-dialog-backdrop" onClick={onClose}><form className="panel admin-task-dialog" onSubmit={submit} onClick={(event) => event.stopPropagation()}><div className="panel-heading"><div><span className="eyebrow">NEW TASK</span><h2>Create administrative task</h2><p>Add a clear follow-up for office operations.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close task form"><X size={16} /></button></div><label>Task title<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Check office supplies" /></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Office supplies</option><option>Records</option><option>Inventory</option><option>Maintenance</option><option>Meetings</option></select></label><label>Due date<input required value={due} onChange={(event) => setDue(event.target.value)} placeholder="e.g. 20 Oct 2026" /></label><div className="admin-dialog-actions"><button type="button" className="button" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary"><Plus size={14} /> Create task</button></div></form></div>; }

function ConfirmDialog({ title, copy, onCancel, onConfirm }: { title: string; copy: string; onCancel: () => void; onConfirm: () => void }) { return <div className="admin-dialog-backdrop"><div className="panel admin-confirm-dialog"><h2>{title}</h2><p>{copy}</p><div className="admin-dialog-actions"><button className="button" onClick={onCancel}>Cancel</button><button className="button button-danger" onClick={onConfirm}>Delete task</button></div></div></div>; }
function SimpleList({ title, eyebrow, copy, icon: Icon, items, action, onAction }: { title: string; eyebrow: string; copy: string; icon: typeof Bell; items: string[]; action: string; onAction: () => void }) { return <section className="page-section administration-workspace"><PageHeader eyebrow={eyebrow} title={title} copy={copy} action={action} onAction={onAction} /><div className="panel admin-simple-list">{items.map((item) => <div key={item}><span><Icon size={16} /></span><strong>{item}</strong><button className="button button-link" onClick={onAction}>View <span>→</span></button></div>)}{!items.length && <div className="empty-state"><Archive size={30} /><h3>Nothing here yet</h3><p>New administration records will appear here.</p></div>}</div></section>; }
function RequestsView({ onNotify }: { onNotify: (message: string) => void }) { return <SimpleList title="Requests" eyebrow="ADMINISTRATION / REQUESTS" copy="Review internal office requests and coordinate follow-up." icon={ClipboardList} items={["Additional stationery request · Pending", "Visitor access request · Pending", "Meeting room booking · Approved"]} action="New request" onAction={() => onNotify("Request form opened.")} />; }
function NotificationsView() { return <SimpleList title="Notifications" eyebrow="ADMINISTRATION / UPDATES" copy="Important office operations updates." icon={Bell} items={["Office schedule reminder · Today", "Supplier delivery confirmed · Yesterday", "New records policy available · 08 Oct 2026"]} action="Mark all as read" onAction={() => undefined} />; }
function ProfileView({ user }: { user: User }) { return <section className="page-section administration-workspace"><PageHeader eyebrow="ADMINISTRATION / MY PROFILE" title="My profile" copy="View your employee information." /><div className="panel admin-profile-card"><div className="admin-profile-avatar">{user.firstName.slice(0, 2).toUpperCase()}</div><div><span className="eyebrow">EMPLOYEE PROFILE</span><h2>{user.name}</h2><p>{user.role}</p><div className="admin-profile-grid"><span><small>Employee ID</small><strong>{user.employeeId}</strong></span><span><small>Department</small><strong>{user.department}</strong></span><span><small>Email</small><strong>{user.email}</strong></span><span><small>Phone</small><strong>Not provided</strong></span><span><small>Joining date</small><strong>01 Jan 2026</strong></span></div></div></div></section>; }
