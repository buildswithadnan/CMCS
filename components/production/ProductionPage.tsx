"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ExternalLink,
  MapPin,
  Search,
  Send,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  EmployeeTask,
  Project,
  TaskStatus,
  User,
} from "../../lib/types";
import {
  attendanceToday,
  employeeAttendance,
} from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";

// ─── Production-specific task seed ───────────────────────────────────────────

const PROD_TASKS_KEY = "cmcsProductionTasks";

const productionTasksSeed: EmployeeTask[] = [
  {
    id: "TSK-PROD-001",
    projectId: "PRJ-2026-0042",
    title: "Shoot community awareness sequences",
    description:
      "Film the planned sequences for the UNDP community awareness campaign. Ensure all locations are scouted and crew briefed.",
    dueDate: "2026-10-18",
    status: "In Progress",
    progress: 60,
    priority: "High",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-002",
    projectId: "PRJ-2026-0036",
    title: "Set up lighting and camera rigs",
    description:
      "Prepare the full lighting grid and camera positions for the Herat Cultural Heritage Series shoot.",
    dueDate: "2026-10-14",
    status: "Completed",
    progress: 100,
    priority: "High",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-003",
    projectId: "PRJ-2026-0045",
    title: "Pre-production location scouting",
    description:
      "Scout and document the key filming locations in Kabul for the documentary pre-production phase.",
    dueDate: "2026-10-20",
    status: "Pending",
    progress: 0,
    priority: "Medium",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-004",
    projectId: "PRJ-2026-0052",
    title: "Coordinate crew assignments for Women in Media Forum",
    description:
      "Confirm all crew roles, brief the team, and distribute the production schedule for the UN Women documentary.",
    dueDate: "2026-10-24",
    status: "Pending",
    progress: 0,
    priority: "Medium",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-005",
    projectId: "PRJ-2026-0031",
    title: "Final review of training footage",
    description:
      "Review all raw footage from the Youth Media Training Series and prepare it for post-production.",
    dueDate: "2026-10-07",
    status: "Completed",
    progress: 100,
    priority: "Low",
    assignedTo: "Ahmad Rahimi",
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const priorityClass = (p: string) => p.toLowerCase();

// ─── Task progress modal ──────────────────────────────────────────────────────

function TaskModal({
  task,
  project,
  onClose,
  onProgress,
}: {
  task: EmployeeTask;
  project?: Project;
  onClose: () => void;
  onProgress: (value: number) => void;
}) {
  const [val, setVal] = useState(task.progress);
  return (
    <div className="dialog-backdrop">
      <div className="dialog prod-task-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">PRODUCTION / {task.id}</span>
            <h2>{task.title}</h2>
            <p>{project?.name ?? task.projectId}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="prod-task-meta">
          <span>
            <small>Priority</small>
            <b className={`prod-priority ${priorityClass(task.priority)}`}>
              {task.priority}
            </b>
          </span>
          <span>
            <small>Due date</small>
            <strong>{fmtDate(task.dueDate)}</strong>
          </span>
          <span>
            <small>Assigned to</small>
            <strong>{task.assignedTo}</strong>
          </span>
          <span>
            <small>Status</small>
            <span
              className={`status-pill ${task.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {task.status}
            </span>
          </span>
        </div>

        {task.description && (
          <p className="prod-task-desc">{task.description}</p>
        )}

        <label className="prod-progress-label">
          Update progress — {val}%
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
          />
          <div className="prod-progress-bar">
            <span style={{ width: `${val}%` }} />
          </div>
        </label>

        <div className="dialog-actions">
          <button className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              onProgress(val);
              onClose();
            }}
          >
            <Send size={14} /> Save progress
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard view ───────────────────────────────────────────────────────────

function DashboardView({
  user,
  tasks,
  projects,
  onSelectTask,
  onNavigate,
}: {
  user: User;
  tasks: EmployeeTask[];
  projects: Project[];
  onSelectTask: (task: EmployeeTask) => void;
  onNavigate: (page: string) => void;
}) {
  const myProjects = projects.filter(
    (p) =>
      p.department === "Production" ||
      p.owner === user.name ||
      p.assignedEmployees?.includes(user.name),
  );

  const metrics = {
    projects: myProjects.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    active: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const prodAttendance = attendanceToday.filter(
    (a) => a.department === "Production",
  );
  const present = prodAttendance.filter((a) => a.status === "Present").length;

  return (
    <section className="page-section prod-workspace">
      <PageHeader
        eyebrow="PRODUCTION / DASHBOARD"
        title={`Good morning, ${user.firstName}`}
        copy="Overview of your production projects, tasks, and team attendance."
      />

      {/* Stats */}
      <div className="stat-grid prod-stat-grid">
        <StatCard
          label="My projects"
          value={String(metrics.projects)}
          sub="Production dept"
          icon={ClipboardList}
        />
        <StatCard
          label="Pending tasks"
          value={String(metrics.pending)}
          sub="Not yet started"
          icon={Clock3}
          tone="purple"
        />
        <StatCard
          label="In progress"
          value={String(metrics.active)}
          sub="Active work"
          icon={Activity}
          tone="indigo"
        />
        <StatCard
          label="Completed"
          value={String(metrics.completed)}
          sub="Delivered"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      {/* Dashboard grid */}
      <div className="prod-dashboard-grid">
        {/* Tasks overview */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>My tasks</h2>
              <p>Latest assigned production work.</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("My Tasks")}
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="prod-task-list">
            {tasks.slice(0, 4).map((task) => {
              const proj = projects.find((p) => p.id === task.projectId);
              return (
                <button
                  key={task.id}
                  className="prod-task-row"
                  onClick={() => onSelectTask(task)}
                >
                  <div className="prod-task-row-main">
                    <strong>{task.title}</strong>
                    <small>{proj?.name ?? task.projectId}</small>
                  </div>
                  <div className="prod-task-row-right">
                    <div className="prod-mini-progress">
                      <span style={{ width: `${task.progress}%` }} />
                    </div>
                    <small>{task.progress}%</small>
                    <span
                      className={`status-pill ${task.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </button>
              );
            })}
            {!tasks.length && (
              <p className="prod-empty-note">No tasks assigned yet.</p>
            )}
          </div>
        </div>

        {/* Projects summary */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Active projects</h2>
              <p>Production projects you are leading or part of.</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Projects")}
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="prod-proj-list">
            {myProjects.slice(0, 4).map((proj) => (
              <div key={proj.id} className="prod-proj-row">
                <span
                  className={`prod-proj-dot ${proj.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                />
                <div className="prod-proj-info">
                  <strong>{proj.name}</strong>
                  <small>
                    {proj.client} · Lead: {proj.owner}
                  </small>
                </div>
                <div className="prod-mini-progress">
                  <span style={{ width: `${proj.progress}%` }} />
                </div>
                <small>{proj.progress}%</small>
              </div>
            ))}
            {!myProjects.length && (
              <p className="prod-empty-note">No production projects found.</p>
            )}
          </div>
        </div>

        {/* Today's attendance */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Production attendance today</h2>
              <p>
                {present} of {prodAttendance.length} present
              </p>
            </div>
            <CalendarDays size={16} />
          </div>
          <div className="prod-att-list">
            {prodAttendance.map((person) => (
              <div key={person.name} className="prod-att-row">
                <span
                  className={`prod-att-dot prod-att-${person.status.toLowerCase()}`}
                />
                <div className="prod-att-info">
                  <strong>{person.name}</strong>
                  <small>{person.department}</small>
                </div>
                <span
                  className={`status-pill ${person.status.toLowerCase()}`}
                >
                  {person.status}
                </span>
                <time>{person.time}</time>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Tasks view ───────────────────────────────────────────────────────────────

function MyTasksView({
  tasks,
  projects,
  onSelectTask,
}: {
  tasks: EmployeeTask[];
  projects: Project[];
  onSelectTask: (task: EmployeeTask) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<
    "All" | "High" | "Medium" | "Low"
  >("All");

  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (statusFilter === "All" || t.status === statusFilter) &&
          (priorityFilter === "All" || t.priority === priorityFilter) &&
          `${t.title} ${t.id} ${t.assignedTo}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [tasks, query, statusFilter, priorityFilter],
  );

  return (
    <section className="page-section prod-workspace">
      <PageHeader
        eyebrow="PRODUCTION / MY TASKS"
        title="My tasks"
        copy="Review assigned tasks, priorities, and update your progress."
      />

      {/* Summary cards */}
      <div className="prod-task-summary">
        {(
          [
            { label: "Total", count: tasks.length, cls: "" },
            {
              label: "Pending",
              count: tasks.filter((t) => t.status === "Pending").length,
              cls: "amber",
            },
            {
              label: "In Progress",
              count: tasks.filter((t) => t.status === "In Progress").length,
              cls: "blue",
            },
            {
              label: "Completed",
              count: tasks.filter((t) => t.status === "Completed").length,
              cls: "green",
            },
          ] as const
        ).map((item) => (
          <div key={item.label} className={`prod-task-chip prod-task-chip-${item.cls}`}>
            <strong>{item.count}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="prod-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TaskStatus | "All")
          }
        >
          <option value="All">All statuses</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value as "All" | "High" | "Medium" | "Low",
            )
          }
        >
          <option value="All">All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Task cards */}
      <div className="prod-task-cards">
        {visible.map((task) => {
          const proj = projects.find((p) => p.id === task.projectId);
          return (
            <article key={task.id} className="panel prod-task-card">
              <div className="prod-task-card-head">
                <div>
                  <span className="eyebrow">{task.id}</span>
                  <h3>{task.title}</h3>
                  <small>{proj?.name ?? task.projectId}</small>
                </div>
                <span
                  className={`status-pill ${task.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {task.status}
                </span>
              </div>

              {task.description && (
                <p className="prod-task-card-desc">{task.description}</p>
              )}

              <div className="prod-task-card-meta">
                <span>
                  <b className={`prod-priority ${priorityClass(task.priority)}`}>
                    {task.priority} priority
                  </b>
                </span>
                <span>
                  <Clock3 size={12} /> Due {fmtDate(task.dueDate)}
                </span>
                <span>
                  <UserRound size={12} /> {task.assignedTo}
                </span>
              </div>

              <div className="prod-task-card-progress">
                <div className="prod-task-progress-bar">
                  <span style={{ width: `${task.progress}%` }} />
                </div>
                <small>{task.progress}% complete</small>
              </div>

              <button
                className="button button-secondary prod-task-card-btn"
                onClick={() => onSelectTask(task)}
              >
                Update progress <ExternalLink size={13} />
              </button>
            </article>
          );
        })}
        {!visible.length && (
          <div className="empty-state">
            <ClipboardList size={28} />
            <h3>No tasks found</h3>
            <p>Try adjusting the filters or search term.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Projects view ────────────────────────────────────────────────────────────

function ProjectsView({
  projects,
  user,
}: {
  projects: Project[];
  user: User;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const myProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.department === "Production" ||
          p.owner === user.name ||
          p.assignedEmployees?.includes(user.name),
      ),
    [projects, user],
  );

  const visible = useMemo(
    () =>
      myProjects.filter(
        (p) =>
          (statusFilter === "All" || p.status === statusFilter) &&
          `${p.name} ${p.client} ${p.id} ${p.owner}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [myProjects, statusFilter, query],
  );

  return (
    <section className="page-section prod-workspace">
      <PageHeader
        eyebrow=""
        title="Projects"
        copy=""
      />

      <div className="prod-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          <option>In Progress</option>
          <option>Upcoming</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="prod-proj-cards">
        {visible.map((proj) => {
          const isLead = proj.owner === user.name;
          return (
            <article key={proj.id} className="panel prod-proj-card">
              <div className="prod-proj-card-head">
                <div>
                  <span className="eyebrow">{proj.id}</span>
                  <h3>{proj.name}</h3>
                </div>
                <span
                  className={`status-pill ${proj.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {proj.status}
                </span>
              </div>

              <div className="prod-proj-card-meta">
                <div>
                  <small>Client</small>
                  <strong>{proj.client}</strong>
                </div>
                <div>
                  <small>Project Lead</small>
                  <strong className={isLead ? "prod-lead-you" : ""}>
                    <Users size={12} /> {proj.owner}
                    {isLead && (
                      <span className="prod-lead-badge">You</span>
                    )}
                  </strong>
                </div>
                <div>
                  <small>Schedule</small>
                  <strong>
                    {fmtDate(proj.start)} – {fmtDate(proj.end)}
                  </strong>
                </div>
                <div>
                  <small>Department</small>
                  <strong>{proj.department}</strong>
                </div>
              </div>

              <div className="prod-proj-card-progress">
                <div className="prod-proj-progress-bar">
                  <span style={{ width: `${proj.progress}%` }} />
                </div>
                <small>{proj.progress}% complete</small>
              </div>

              {proj.assignedEmployees?.length ? (
                <div className="prod-proj-team">
                  <small>Team ({proj.assignedEmployees.length})</small>
                  <div className="prod-team-avatars">
                    {proj.assignedEmployees.slice(0, 4).map((name) => (
                      <span key={name} className="prod-team-avatar" title={name}>
                        {name.slice(0, 2).toUpperCase()}
                      </span>
                    ))}
                    {proj.assignedEmployees.length > 4 && (
                      <span className="prod-team-more">
                        +{proj.assignedEmployees.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
        {!visible.length && (
          <div className="empty-state">
            <ClipboardList size={28} />
            <h3>No projects found</h3>
            <p>Try adjusting the filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Attendance view ──────────────────────────────────────────────────────────

function AttendanceView({ user }: { user: User }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const myRecord = employeeAttendance.find(
    (rec) => rec.employee === user.name,
  );

  const present = myRecord?.records.filter((r) => r.status === "Present").length ?? 0;
  const late = myRecord?.records.filter((r) => r.status === "Late").length ?? 0;
  const absent = myRecord?.records.filter((r) => r.status === "Absent").length ?? 0;

  function handleCheckIn() {
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setCheckedIn(true);
    setCheckInTime(now);
  }

  return (
    <section className="page-section prod-workspace">
      <PageHeader
        eyebrow="PRODUCTION / ATTENDANCE"
        title="Attendance"
        copy="Track your check-in, attendance history, and monthly record."
      />

      {/* Hero card */}
      <div className="panel prod-att-hero">
        <div className="prod-att-identity">
          <div className="prod-att-avatar">
            {user.firstName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="eyebrow">EMPLOYEE RECORD</span>
            <h2>{user.name}</h2>
            <p>
              {user.role} · {user.employeeId}
            </p>
          </div>
        </div>

        <div className="prod-att-live">
          {checkedIn ? (
            <>
              <span className="prod-att-live-dot" />
              <div>
                <strong>Checked in</strong>
                <small>At {checkInTime}</small>
              </div>
            </>
          ) : (
            <div>
              <strong>Not checked in</strong>
              <small>12 October 2026</small>
            </div>
          )}
        </div>

        <div className="prod-att-location">
          <MapPin size={14} />
          <div>
            <small>WORK LOCATION</small>
            <strong>CMCS Production Office</strong>
          </div>
        </div>

        <div className="prod-att-actions">
          {!checkedIn ? (
            <button className="button button-primary" onClick={handleCheckIn}>
              <CheckCircle2 size={14} /> Check in
            </button>
          ) : (
            <button
              className="button button-secondary"
              onClick={() => {
                setCheckedIn(false);
                setCheckInTime(null);
              }}
            >
              Check out
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="prod-att-summary">
        <div className="prod-att-chip prod-att-chip-green">
          <strong>{present}</strong>
          <span>Days present</span>
        </div>
        <div className="prod-att-chip prod-att-chip-amber">
          <strong>{late}</strong>
          <span>Late check-ins</span>
        </div>
        <div className="prod-att-chip prod-att-chip-red">
          <strong>{absent}</strong>
          <span>Days absent</span>
        </div>
        <div className="prod-att-chip prod-att-chip-blue">
          <strong>{myRecord?.completedProjects ?? 0}</strong>
          <span>Completed projects</span>
        </div>
      </div>

      {/* History table */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Attendance history</h2>
            <p>Recent daily records — last 5 working days.</p>
          </div>
          <CalendarDays size={16} />
        </div>
        <div className="table-wrap">
          <table className="prod-att-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check-in time</th>
              </tr>
            </thead>
            <tbody>
              {myRecord?.records.map((rec) => (
                <tr key={rec.date}>
                  <td>{fmtDate(rec.date)}</td>
                  <td>
                    <span
                      className={`status-pill ${rec.status.toLowerCase()}`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td>{rec.time}</td>
                </tr>
              ))}
              {!myRecord?.records.length && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#9aa5b5" }}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Main ProductionPage export ───────────────────────────────────────────────

export function ProductionPage({
  active,
  user,
  projects,
  onNotify,
}: {
  active: string;
  user: User;
  projects: Project[];
  onNotify: (message: string) => void;
}) {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);

  // Load / seed tasks from localStorage
  useEffect(() => {
    const saved = window.localStorage.getItem(PROD_TASKS_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved) as EmployeeTask[]);
      } catch {
        setTasks(productionTasksSeed);
      }
    } else {
      setTasks(productionTasksSeed);
    }
  }, []);

  useEffect(() => {
    if (tasks.length)
      window.localStorage.setItem(PROD_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function updateProgress(task: EmployeeTask, progress: number) {
    const nextStatus: TaskStatus =
      progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Pending";
    const next = { ...task, progress, status: nextStatus };
    setTasks((cur) => cur.map((t) => (t.id === task.id ? next : t)));
    onNotify(`${task.id} updated to ${progress}%`);
  }

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assignedTo === user.name),
    [tasks, user.name],
  );

  // ── Route to sub-views ──────────────────────────────────────────────────────
  if (active === "My Tasks")
    return (
      <>
        <MyTasksView
          tasks={myTasks}
          projects={projects}
          onSelectTask={setSelectedTask}
        />
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            project={projects.find((p) => p.id === selectedTask.projectId)}
            onClose={() => setSelectedTask(null)}
            onProgress={(v) => {
              updateProgress(selectedTask, v);
              setSelectedTask(null);
            }}
          />
        )}
      </>
    );

  if (active === "Projects")
    return <ProjectsView projects={projects} user={user} />;

  if (active === "Attendance")
    return <AttendanceView user={user} />;

  // ── Default: Dashboard ──────────────────────────────────────────────────────
  return (
    <>
      <DashboardView
        user={user}
        tasks={myTasks}
        projects={projects}
        onSelectTask={setSelectedTask}
        onNavigate={onNotify}
      />
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          project={projects.find((p) => p.id === selectedTask.projectId)}
          onClose={() => setSelectedTask(null)}
          onProgress={(v) => {
            updateProgress(selectedTask, v);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
