"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Archive,
  Bell,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Clock4,
  ExternalLink,
  HardDrive,
  MapPin,
  MailOpen,
  Pencil,
  Search,
  Send,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { EmployeeTask, EquipmentAssignment, Project, TaskStatus, User } from "../../lib/types";
import { technicalEquipmentSeed, technicalTasksSeed } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";

const taskStorageKey = "cmcsTechnicalTasks";
const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function TechnicalEmployeePage({ active, user, projects, onNotify }: { active: string; user: User; projects: Project[]; onNotify: (message: string) => void }) {
  const [tasks, setTasks] = useState<EmployeeTask[]>(technicalTasksSeed);
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const equipment = technicalEquipmentSeed.filter((item) => item.assignedTo === user.name);
  const assignedProjects = projects.filter((project) => project.department === "Technical" || project.assignedEmployees?.includes(user.name));

  useEffect(() => {
    const saved = window.localStorage.getItem(taskStorageKey);
    if (saved) {
      try { setTasks(JSON.parse(saved) as EmployeeTask[]); } catch { setTasks(technicalTasksSeed); }
    }
  }, []);
  useEffect(() => {
    window.localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  }, [tasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => (statusFilter === "All" || task.status === statusFilter) && `${task.title} ${task.id}`.toLowerCase().includes(query.toLowerCase())), [tasks, query, statusFilter]);
  const projectById = (id: string) => projects.find((project) => project.id === id);
  const updateProgress = (task: EmployeeTask, progress: number) => {
    const nextStatus: TaskStatus = progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Pending";
    const next = { ...task, progress, status: nextStatus };
    setTasks((current) => current.map((item) => item.id === task.id ? next : item));
    setSelectedTask(next);
    onNotify(`${task.id} updated to ${progress}%`);
  };

  if (active === "My Projects") return <ProjectsView projects={assignedProjects} projectById={projectById} />;
  if (active === "My Tasks") return <TasksView tasks={visibleTasks} projects={projects} query={query} statusFilter={statusFilter} onQuery={setQuery} onStatus={setStatusFilter} onSelect={setSelectedTask} />;
  if (active === "My Schedule") return <ScheduleView tasks={tasks} projects={projects} />;
  if (active === "Equipment & Resources") return <EquipmentView equipment={equipment} projectById={projectById} />;
  if (active === "Attendance") return <AttendanceView user={user} />;
  if (active === "Leave Requests") return <LeaveView onNotify={onNotify} />;
  if (active === "Notifications") return <NotificationsView onNavigate={onNotify} />;
  if (active === "My Profile") return <ProfileView user={user} />;

  const metrics = {
    projects: assignedProjects.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    active: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length,
  };
  return <section className="page-section technical-workspace">
    <PageHeader eyebrow="TECHNICAL / EMPLOYEE WORKSPACE" title={`Good morning, ${user.firstName}`} copy="Stay on top of your assigned technical work, equipment, and schedule." />
    <div className="stat-grid technical-stat-grid">
      <StatCard label="My projects" value={String(metrics.projects)} icon={ClipboardList} />
      <StatCard label="Pending tasks" value={String(metrics.pending)} icon={Clock3} tone="purple" />
      <StatCard label="In progress" value={String(metrics.active)} icon={Activity} tone="indigo" />
      <StatCard label="Completed tasks" value={String(metrics.completed)} icon={CheckCircle2} tone="green" />
    </div>
    <div className="technical-dashboard-grid">
      <div className="panel"><div className="panel-heading"><div><h2>My assigned tasks</h2><p>Update progress as work moves forward.</p></div><button className="text-button" onClick={() => onNotify("Choose My Tasks from the sidebar to view all tasks.")}>View details <ExternalLink size={13} /></button></div><TaskList tasks={tasks.slice(0, 3)} projects={projects} onSelect={setSelectedTask} /></div>
      <div className="panel"><div className="panel-heading"><div><h2>Upcoming deadlines</h2><p>Plan your next deliverables.</p></div><CalendarDays size={16} /></div>{tasks.filter((task) => task.status !== "Completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((task) => <div className="technical-deadline" key={task.id}><span><strong>{task.title}</strong><small>{projectById(task.projectId)?.name}</small></span><b>{dateLabel(task.dueDate)}</b></div>)}</div>
    </div>
    <div className="panel"><div className="panel-heading"><div><h2>Equipment assigned to me</h2><p>Relevant resources for active technical projects.</p></div><HardDrive size={16} /></div><EquipmentTable equipment={equipment} projectById={projectById} /></div>
    {selectedTask && <TaskModal task={selectedTask} project={projectById(selectedTask.projectId)} onClose={() => setSelectedTask(null)} onProgress={(value) => updateProgress(selectedTask, value)} />}
  </section>;
}

function TaskList({ tasks, projects, onSelect }: { tasks: EmployeeTask[]; projects: Project[]; onSelect: (task: EmployeeTask) => void }) {
  return <div className="technical-task-list">{tasks.map((task) => <button className="technical-task-row" key={task.id} onClick={() => onSelect(task)}><span className="technical-task-icon"><Wrench size={14} /></span><span><strong>{task.title}</strong><small>{projects.find((project) => project.id === task.projectId)?.name}</small></span><span className="technical-progress"><i><b style={{ width: `${task.progress}%` }} /></i><small>{task.progress}%</small></span><span className={`status-pill ${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span></button>)}</div>;
}

function TasksView({ tasks, projects, query, statusFilter, onQuery, onStatus, onSelect }: { tasks: EmployeeTask[]; projects: Project[]; query: string; statusFilter: TaskStatus | "All"; onQuery: (value: string) => void; onStatus: (value: TaskStatus | "All") => void; onSelect: (task: EmployeeTask) => void }) {
  return <section className="page-section technical-workspace"><PageHeader eyebrow="TECHNICAL / MY TASKS" title="My tasks" copy="Review task details, deadlines, and update your own progress." /><div className="technical-toolbar"><label className="inline-search"><Search size={15} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search my tasks..." /></label><select value={statusFilter} onChange={(event) => onStatus(event.target.value as TaskStatus | "All")}><option>All</option><option>Pending</option><option>In Progress</option><option>Completed</option></select></div><div className="panel"><TaskList tasks={tasks} projects={projects} onSelect={onSelect} />{!tasks.length && <div className="empty-state"><Search size={28} /><h3>No tasks found</h3><p>Try another search or status filter.</p></div>}</div></section>;
}

function ProjectsView({ projects, projectById }: { projects: Project[]; projectById: (id: string) => Project | undefined }) {
  return <section className="page-section technical-workspace"><PageHeader eyebrow="TECHNICAL / MY PROJECTS" title="My projects" copy="Projects assigned to the Technical department by Head of Operations." /><div className="technical-project-grid">{projects.map((project) => <article className="panel technical-project-card" key={project.id}><div className="technical-project-card-head"><span className="project-dot" /><span className={`status-pill ${project.status.toLowerCase().replaceAll(" ", "-")}`}>{project.status}</span></div><h2>{project.name}</h2><p>{project.client} · {project.id}</p><div className="technical-project-meta"><span><small>Schedule</small>{dateLabel(project.start)} – {dateLabel(project.end)}</span><span><small>Progress</small>{project.progress}%</span></div><div className="technical-progress"><i><b style={{ width: `${project.progress}%` }} /></i></div><small className="technical-project-tasks">{projectById(project.id) ? "Assigned technical work available" : "Project details available"}</small></article>)}</div></section>;
}

function ScheduleView({ tasks, projects }: { tasks: EmployeeTask[]; projects: Project[] }) {
  const orderedTasks = tasks.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const activeTasks = tasks.filter((task) => task.status !== "Completed").length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const nextTask = orderedTasks.find((task) => task.status !== "Completed");
  return (
    <section className="page-section technical-workspace">
      <PageHeader
        eyebrow="TECHNICAL / MY SCHEDULE"
        title="My schedule"
        copy="A focused view of your upcoming technical deliverables and deadlines."
      />
      <div className="schedule-summary-grid">
        <article className="schedule-summary-card schedule-summary-blue">
          <span className="schedule-summary-icon"><CalendarDays size={17} /></span>
          <span><small>Upcoming tasks</small><strong>{activeTasks}</strong><em>Assigned deadlines</em></span>
        </article>
        <article className="schedule-summary-card schedule-summary-amber">
          <span className="schedule-summary-icon"><Clock3 size={17} /></span>
          <span><small>Next deadline</small><strong>{nextTask ? dateLabel(nextTask.dueDate) : "None"}</strong><em>{nextTask?.title ?? "All tasks complete"}</em></span>
        </article>
        <article className="schedule-summary-card schedule-summary-green">
          <span className="schedule-summary-icon"><CheckCircle2 size={17} /></span>
          <span><small>Completed</small><strong>{completedTasks}</strong><em>Tasks delivered</em></span>
        </article>
      </div>
      <div className="schedule-board">
        <div className="panel schedule-timeline-panel">
          <div className="panel-heading">
            <div><h2>Delivery timeline</h2><p>Work is ordered by due date so the next action is always visible.</p></div>
            <span className="schedule-board-label"><CalendarDays size={14} /> October 2026</span>
          </div>
          <div className="schedule-timeline">
            {orderedTasks.map((task, index) => {
              const project = projects.find((item) => item.id === task.projectId);
              return <div className="schedule-timeline-item" key={task.id}>
                <div className="schedule-date-column"><strong>{new Date(`${task.dueDate}T00:00:00`).getDate()}</strong><span>{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString("en-US", { month: "short" })}</span></div>
                <div className="schedule-timeline-line"><i className={task.status === "Completed" ? "is-complete" : ""} />{index < orderedTasks.length - 1 && <b />}</div>
                <div className="schedule-timeline-content">
                  <div className="schedule-timeline-top"><div><span className={`schedule-priority ${task.priority.toLowerCase()}`}>{task.priority} priority</span><h3>{task.title}</h3></div><span className={`status-pill ${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span></div>
                  <p>{project?.name ?? task.projectId}</p>
                  <div className="schedule-task-progress"><span><i><b style={{ width: `${task.progress}%` }} /></i>{task.progress}% complete</span><small>Due {dateLabel(task.dueDate)}</small></div>
                </div>
              </div>;
            })}
          </div>
        </div>
        <aside className="panel schedule-focus-panel">
          <div className="panel-heading"><div><h2>Schedule focus</h2><p>Keep your next delivery moving.</p></div><Activity size={15} /></div>
          {nextTask ? <><div className="schedule-focus-date"><strong>{dateLabel(nextTask.dueDate)}</strong><span>Next deadline</span></div><h3>{nextTask.title}</h3><p>{nextTask.description}</p><div className="schedule-focus-project"><small>PROJECT</small><strong>{projects.find((project) => project.id === nextTask.projectId)?.name ?? nextTask.projectId}</strong></div><div className="schedule-focus-progress"><div><span>Current progress</span><strong>{nextTask.progress}%</strong></div><i><b style={{ width: `${nextTask.progress}%` }} /></i></div></> : <div className="empty-state"><CheckCircle2 size={26} /><h3>All caught up</h3><p>Every assigned task is complete.</p></div>}
        </aside>
      </div>
    </section>
  );
}
function EquipmentView({ equipment, projectById }: { equipment: EquipmentAssignment[]; projectById: (id: string) => Project | undefined }) { return <section className="page-section technical-workspace"><PageHeader eyebrow="TECHNICAL / RESOURCES" title="Equipment & resources" copy="View equipment currently assigned to your technical work." /><div className="panel"><EquipmentTable equipment={equipment} projectById={projectById} /></div></section>; }
function EquipmentTable({ equipment, projectById }: { equipment: EquipmentAssignment[]; projectById: (id: string) => Project | undefined }) { return <div className="table-wrap"><table className="technical-table"><thead><tr><th>Equipment</th><th>Project</th><th>Condition</th><th>Return date</th></tr></thead><tbody>{equipment.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.id} · {item.category}</small></td><td>{projectById(item.projectId)?.name ?? item.projectId}</td><td><span className={`status-pill ${item.condition === "Good" ? "completed" : "pending-approval"}`}>{item.condition}</span></td><td>{dateLabel(item.returnDate)}</td></tr>)}</tbody></table></div>; }
function AttendanceView({ user }: { user: User }) {
  const week = [
    { day: "Mon", date: "12 Oct", status: "Present", time: "08:04 AM", hours: "8h 12m" },
    { day: "Tue", date: "13 Oct", status: "Present", time: "08:11 AM", hours: "In progress" },
    { day: "Wed", date: "14 Oct", status: "Scheduled", time: "—", hours: "Not started" },
    { day: "Thu", date: "15 Oct", status: "Scheduled", time: "—", hours: "Not started" },
    { day: "Fri", date: "16 Oct", status: "Scheduled", time: "—", hours: "Not started" },
  ];

  return <section className="page-section technical-workspace">
    <PageHeader eyebrow="TECHNICAL / ATTENDANCE" title="Attendance" copy="Track your working days, hours, and attendance record." />
    <div className="attendance-hero panel">
      <div className="attendance-identity">
        <div className="attendance-avatar">{user.firstName.slice(0, 2).toUpperCase()}</div>
        <div><span className="eyebrow">EMPLOYEE RECORD</span><h2>{user.name}</h2><p>{user.role} · {user.employeeId}</p></div>
      </div>
      <div className="attendance-live-status"><span className="attendance-live-dot" /><div><strong>Present today</strong><small>Clocked in at 08:11 AM</small></div></div>
      <div className="attendance-location"><MapPin size={15} /><span><small>WORK LOCATION</small><strong>CMCS Technical Office</strong></span></div>
    </div>
    <div className="attendance-summary-grid">
      <article className="attendance-summary-card"><span className="attendance-summary-icon attendance-summary-blue"><CalendarCheck2 size={17} /></span><span><small>Attendance rate</small><strong>92%</strong><em>Last 30 days</em></span></article>
      <article className="attendance-summary-card"><span className="attendance-summary-icon attendance-summary-teal"><Clock4 size={17} /></span><span><small>Hours this month</small><strong>142h</strong><em>Target: 160h</em></span></article>
      <article className="attendance-summary-card"><span className="attendance-summary-icon attendance-summary-amber"><CheckCircle2 size={17} /></span><span><small>Days present</small><strong>22</strong><em>Of 24 working days</em></span></article>
      <article className="attendance-summary-card"><span className="attendance-summary-icon attendance-summary-purple"><Clock3 size={17} /></span><span><small>Average check-in</small><strong>08:07</strong><em>AM · This month</em></span></article>
    </div>
    <div className="attendance-content-grid">
      <div className="panel attendance-week-panel">
        <div className="panel-heading"><div><h2>This week</h2><p>12 Oct – 16 Oct 2026 · Your weekly attendance activity.</p></div><span className="attendance-week-label"><CalendarDays size={14} /> Week 42</span></div>
        <div className="attendance-week attendance-week-modern">{week.map((record) => <div className={`attendance-day-card ${record.status.toLowerCase()}`} key={record.date}><div className="attendance-day-heading"><span>{record.day}</span><strong>{record.date}</strong></div><b>{record.status}</b><small>{record.status === "Present" ? <><Clock3 size={12} /> {record.time}</> : record.time}</small><em>{record.hours}</em></div>)}</div>
        <div className="attendance-legend"><span><i className="attendance-legend-dot present" />Present</span><span><i className="attendance-legend-dot scheduled" />Scheduled</span><span><i className="attendance-legend-dot absent" />Absent</span></div>
      </div>
      <aside className="panel attendance-insight-panel">
        <div className="panel-heading"><div><h2>Monthly overview</h2><p>October 2026</p></div><Activity size={15} /></div>
        <div className="attendance-rate"><div><span>Attendance score</span><strong>92%</strong></div><i><b /></i><small>2 days remaining in the current period</small></div>
        <div className="attendance-breakdown"><div><span><i className="present" />Present</span><strong>22 days</strong></div><div><span><i className="late" />Late check-in</span><strong>2 days</strong></div><div><span><i className="absent" />Absent</span><strong>2 days</strong></div></div>
        <div className="attendance-insight-note"><CheckCircle2 size={15} /><span><strong>Good attendance consistency</strong><small>Your record is above the department average this month.</small></span></div>
      </aside>
    </div>
  </section>;
}
function LeaveView({ onNotify }: { onNotify: (message: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const requests = [
    { type: "Annual leave", dates: "18 Oct 2026 – 20 Oct 2026", days: "3 days", submitted: "Submitted 06 Oct 2026", status: "Pending review", tone: "pending-approval" },
    { type: "Sick leave", dates: "09 Sep 2026", days: "1 day", submitted: "Submitted 09 Sep 2026", status: "Approved", tone: "approved" },
  ];

  const openForm = () => {
    setSubmitted(false);
    setShowForm(true);
  };
  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setShowForm(false);
    onNotify("Leave request submitted for review.");
  };

  return <section className="page-section technical-workspace">
    <PageHeader eyebrow="TECHNICAL / LEAVE REQUESTS" title="Leave requests" copy="Plan time away and track the status of your requests." action="Request leave" onAction={openForm} />
    {submitted && <div className="leave-success"><CheckCircle2 size={16} /><span><strong>Request submitted</strong><small>Your leave request has been sent to your approver for review.</small></span><button onClick={() => setSubmitted(false)} aria-label="Dismiss confirmation"><X size={14} /></button></div>}
    <div className="leave-summary-grid">
      <article className="leave-summary-card"><span className="leave-summary-icon leave-summary-blue"><CalendarRange size={17} /></span><span><small>Annual leave balance</small><strong>14 days</strong><em>Remaining this year</em></span></article>
      <article className="leave-summary-card"><span className="leave-summary-icon leave-summary-teal"><CheckCircle2 size={17} /></span><span><small>Approved leave</small><strong>6 days</strong><em>Used in 2026</em></span></article>
      <article className="leave-summary-card"><span className="leave-summary-icon leave-summary-amber"><Clock3 size={17} /></span><span><small>Pending requests</small><strong>1</strong><em>Awaiting review</em></span></article>
    </div>
    <div className="leave-content-grid">
      <div className="panel leave-history-panel">
        <div className="panel-heading"><div><h2>Request history</h2><p>Review your recent and upcoming time off.</p></div><CalendarDays size={16} /></div>
        <div className="leave-request-list">{requests.map((request) => <article className="leave-request-card" key={request.type}><div className="leave-request-icon"><CalendarDays size={16} /></div><div className="leave-request-main"><div className="leave-request-top"><div><span className="eyebrow">{request.type}</span><h3>{request.dates}</h3></div><span className={`status-pill ${request.tone}`}>{request.status}</span></div><div className="leave-request-meta"><span>{request.days}</span><span>{request.submitted}</span></div></div><button className="leave-request-arrow" onClick={() => onNotify(`${request.type}: ${request.status}`)} aria-label={`View ${request.type} details`}><ExternalLink size={15} /></button></article>)}</div>
      </div>
      <aside className="panel leave-balance-panel">
        <div className="panel-heading"><div><h2>Leave balance</h2><p>Current allowance overview.</p></div><CalendarRange size={15} /></div>
        <div className="leave-balance-total"><strong>14</strong><span>days available</span></div>
        <div className="leave-balance-progress"><div><span>Used</span><strong>6 of 20 days</strong></div><i><b /></i></div>
        <div className="leave-balance-note"><CalendarCheck2 size={14} /><span><strong>Next planned leave</strong><small>18 Oct – 20 Oct 2026</small></span></div>
      </aside>
    </div>
    {showForm && <div className="leave-form-backdrop" onClick={() => setShowForm(false)}><form className="panel leave-request-form" onSubmit={submitRequest} onClick={(event) => event.stopPropagation()}><div className="panel-heading"><div><span className="eyebrow">NEW REQUEST</span><h2>Request leave</h2><p>Submit your time off request for approval.</p></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close leave request form"><X size={17} /></button></div><div className="leave-form-grid"><label>Leave type<select defaultValue="Annual leave"><option>Annual leave</option><option>Sick leave</option><option>Personal leave</option></select></label><label>Number of days<input type="number" min="1" defaultValue="1" /></label><label>Start date<input type="date" defaultValue="2026-10-18" required /></label><label>End date<input type="date" defaultValue="2026-10-20" required /></label><label className="leave-form-full">Reason<textarea placeholder="Add a short reason for your request..." rows={3} required /></label></div><div className="leave-form-footer"><span><CheckCircle2 size={14} />Your request will be routed to the authorized approver.</span><button className="button button-primary" type="submit"><Send size={14} />Submit request</button></div></form></div>}
  </section>;
}
function NotificationsView({ onNavigate }: { onNavigate: (message: string) => void }) {
  const [filter, setFilter] = useState<"All" | "Unread" | "Tasks" | "Resources">("All");
  const [readIds, setReadIds] = useState<string[]>([]);
  const notifications = [
    { id: "task-assigned", type: "Tasks", title: "New task assigned", text: "Prepare backup network plan is due 19 Oct 2026.", time: "Today · 09:24 AM", icon: ClipboardList, tone: "blue", unread: true },
    { id: "equipment-service", type: "Resources", title: "Equipment service reminder", text: "Sennheiser field audio kit needs service before return.", time: "Yesterday · 03:40 PM", icon: Wrench, tone: "amber", unread: true },
    { id: "schedule-updated", type: "Tasks", title: "Schedule updated", text: "The Sports Event Live Stream delivery timeline has changed.", time: "10 Oct 2026 · 11:15 AM", icon: CalendarDays, tone: "teal", unread: false },
    { id: "leave-approved", type: "Leave", title: "Leave request approved", text: "Your sick leave request for 09 Sep 2026 was approved.", time: "09 Sep 2026 · 02:05 PM", icon: CheckCircle2, tone: "green", unread: false },
  ];
  const visible = notifications.filter((item) => (filter === "All" || (filter === "Unread" ? item.unread && !readIds.includes(item.id) : item.type === filter)));
  const unreadCount = notifications.filter((item) => item.unread && !readIds.includes(item.id)).length;
  const markRead = (id: string, title: string) => {
    setReadIds((current) => current.includes(id) ? current : [...current, id]);
    onNavigate(`${title} marked as read`);
  };
  const markAllRead = () => {
    setReadIds(notifications.map((item) => item.id));
    onNavigate("All notifications marked as read");
  };

  return <section className="page-section technical-workspace">
    <PageHeader eyebrow="TECHNICAL / NOTIFICATIONS" title="Notifications" copy="Stay informed about assigned work, schedules, and resources." />
    <div className="notification-summary-grid">
      <article className="notification-summary-card notification-summary-primary"><span className="notification-summary-icon"><Bell size={17} /></span><span><small>Total updates</small><strong>{notifications.length}</strong><em>Recent activity</em></span></article>
      <article className="notification-summary-card"><span className="notification-summary-icon notification-icon-purple"><MailOpen size={17} /></span><span><small>Unread</small><strong>{unreadCount}</strong><em>Needs your attention</em></span></article>
      <article className="notification-summary-card"><span className="notification-summary-icon notification-icon-teal"><ClipboardList size={17} /></span><span><small>Task updates</small><strong>{notifications.filter((item) => item.type === "Tasks").length}</strong><em>Assigned work</em></span></article>
      <article className="notification-summary-card"><span className="notification-summary-icon notification-icon-amber"><Archive size={17} /></span><span><small>Archived</small><strong>0</strong><em>Nothing archived</em></span></article>
    </div>
    <div className="notification-content-grid">
      <div className="panel notification-list-panel">
        <div className="panel-heading notification-list-heading"><div><h2>Activity center</h2><p>Updates relevant to your employee workspace.</p></div><button className="notification-mark-all" onClick={markAllRead}><MailOpen size={13} /> Mark all as read</button></div>
        <div className="notification-filter-bar">{(["All", "Unread", "Tasks", "Resources"] as const).map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}{item === "Unread" && unreadCount > 0 && <b>{unreadCount}</b>}</button>)}</div>
        <div className="notification-list">{visible.map((item) => { const Icon = item.icon; const isRead = readIds.includes(item.id) || !item.unread; return <article className={`notification-card ${isRead ? "is-read" : "is-unread"}`} key={item.id}><span className={`notification-card-icon ${item.tone}`}><Icon size={16} /></span><div className="notification-card-content"><div className="notification-card-top"><span className="eyebrow">{item.type}</span><time>{item.time}</time></div><h3>{item.title}</h3><p>{item.text}</p><div className="notification-card-actions">{!isRead && <button onClick={() => markRead(item.id, item.title)}><MailOpen size={12} /> Mark as read</button>}<button onClick={() => onNavigate(item.text)}>View details <ExternalLink size={12} /></button></div></div>{!isRead && <i className="notification-unread-dot" aria-label="Unread" />}</article>; })}</div>
        {!visible.length && <div className="empty-state notification-empty"><MailOpen size={28} /><h3>No notifications found</h3><p>There are no updates in this category.</p></div>}
      </div>
      <aside className="panel notification-preferences-panel"><div className="panel-heading"><div><h2>Notification guide</h2><p>What you will see here.</p></div><Bell size={15} /></div><div className="notification-guide-row"><span className="notification-guide-icon blue"><ClipboardList size={14} /></span><span><strong>Task updates</strong><small>New assignments, deadlines, and progress changes.</small></span></div><div className="notification-guide-row"><span className="notification-guide-icon amber"><Wrench size={14} /></span><span><strong>Resource alerts</strong><small>Equipment service and return reminders.</small></span></div><div className="notification-guide-row"><span className="notification-guide-icon teal"><CalendarDays size={14} /></span><span><strong>Schedule changes</strong><small>Changes that affect your delivery timeline.</small></span></div><div className="notification-preference-note"><strong>Stay on track</strong><small>Check notifications before starting your daily technical work.</small></div></aside>
    </div>
  </section>;
}
function ProfileView({ user }: { user: User }) { return <section className="page-section technical-workspace"><PageHeader eyebrow="TECHNICAL / MY PROFILE" title="My profile" copy="Your CMCS employee information." /><div className="panel profile-card"><div className="profile-avatar">{user.firstName.slice(0, 2).toUpperCase()}</div><div><h2>{user.name}</h2><p>{user.role}</p><dl><div><dt>Employee ID</dt><dd>{user.employeeId}</dd></div><div><dt>Department</dt><dd>{user.department}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div></dl></div></div></section>; }
function TaskModal({ task, project, onClose, onProgress }: { task: EmployeeTask; project?: Project; onClose: () => void; onProgress: (value: number) => void }) { return <div className="modal-backdrop" onClick={onClose}><div className="panel technical-task-modal" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" onClick={onClose} aria-label="Close task details"><X size={17} /></button><span className="eyebrow">{task.id} · {task.priority} PRIORITY</span><h2>{task.title}</h2><p>{task.description}</p><div className="task-modal-meta"><span><small>Project</small>{project?.name ?? task.projectId}</span><span><small>Due date</small>{dateLabel(task.dueDate)}</span></div><label className="task-progress-editor">My progress <strong>{task.progress}%</strong><input type="range" min="0" max="100" step="5" value={task.progress} onChange={(event) => onProgress(Number(event.target.value))} /><small>Only your own task progress can be updated.</small></label><button className="button button-primary" onClick={onClose}>Done</button></div></div>; }
