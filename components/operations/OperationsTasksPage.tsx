"use client";

import { FormEvent, useMemo, useState } from "react";
import { ClipboardList, Plus, Search, UserRound, X } from "lucide-react";
import { EmployeeTask, Project, TaskStatus, User } from "../../lib/types";
import { technicalTasksSeed, users } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";

const taskStatus: TaskStatus[] = ["Pending", "In Progress", "Completed"];

export function OperationsTasksPage({
  projects,
  onNotify,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
}) {
  const [tasks, setTasks] = useState<EmployeeTask[]>(technicalTasksSeed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TaskStatus | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: projects[0]?.id ?? "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium" as EmployeeTask["priority"],
  });
  const employees = Object.values(users).filter((user) => user.role !== "CEO / Founder Manager" && user.role !== "Head of Operations");
  const visible = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (status === "All" || task.status === status) &&
          `${task.id} ${task.title} ${task.assignedTo}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [tasks, query, status],
  );
  const projectName = (id: string) => projects.find((project) => project.id === id)?.name ?? "Unassigned project";

  function createTask(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.assignedTo || !form.projectId || !form.dueDate) return;
    const task: EmployeeTask = {
      id: `TSK-OPS-${String(tasks.length + 1).padStart(3, "0")}`,
      title: form.title.trim(),
      description: form.description.trim(),
      projectId: form.projectId,
      dueDate: form.dueDate,
      status: "Pending",
      progress: 0,
      priority: form.priority,
      assignedTo: form.assignedTo,
    };
    setTasks((current) => [task, ...current]);
    setShowForm(false);
    setForm({ title: "", description: "", projectId: projects[0]?.id ?? "", assignedTo: "", dueDate: "", priority: "Medium" });
    onNotify(`${task.id} assigned to ${task.assignedTo}.`);
  }

  return (
    <section className="page-section operations-tasks">
      <PageHeader
        eyebrow="OPERATIONS / TASKS"
        title="Task management"
        copy="Create, assign, and monitor operational tasks across project teams."
        action="Create task"
        onAction={() => setShowForm(true)}
      />
      <div className="stat-grid operations-task-stats">
        <TaskStat label="Total tasks" value={tasks.length} />
        <TaskStat label="Pending" value={tasks.filter((task) => task.status === "Pending").length} />
        <TaskStat label="In progress" value={tasks.filter((task) => task.status === "In Progress").length} />
        <TaskStat label="Completed" value={tasks.filter((task) => task.status === "Completed").length} />
      </div>
      <div className="module-toolbar">
        <label className="inline-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks or assignees..." /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus | "All")}><option>All</option>{taskStatus.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <div className="panel operations-task-list">
        <div className="list-heading"><span>Task</span><span>Project</span><span>Assigned to</span><span>Due date</span><span>Status</span></div>
        {visible.map((task) => (
          <div className="list-row operations-task-row" key={task.id}>
            <span><strong>{task.title}</strong><small>{task.id} · {task.priority} priority</small></span>
            <span>{projectName(task.projectId)}</span>
            <span><UserRound size={14} /> {task.assignedTo}</span>
            <span>{task.dueDate}</span>
            <span className={`status-pill ${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span>
          </div>
        ))}
        {!visible.length && <div className="empty-state"><ClipboardList size={28} /><h3>No tasks found</h3><p>Try another search or status filter.</p></div>}
      </div>
      {showForm && (
        <div className="dialog-backdrop">
          <form className="dialog operations-task-dialog" onSubmit={createTask}>
            <div className="dialog-head"><div><span className="eyebrow">OPERATIONS / TASKS</span><h2>Create and assign task</h2><p>Give an employee a clear project deliverable.</p></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close task form"><X size={18} /></button></div>
            <label className="operations-task-field operations-task-field-wide"><span>Task title</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Prepare project production schedule" /></label>
            <label className="operations-task-field operations-task-field-wide"><span>Description <em>Optional</em></span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add instructions, expectations, or useful context..." rows={3} /></label>
            <div className="operations-task-form-grid">
              <label className="operations-task-field"><span>Project</span><select required value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <label className="operations-task-field"><span>Assign to</span><select required value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.employeeId} value={employee.name}>{employee.name} · {employee.department}</option>)}</select></label>
              <label className="operations-task-field"><span>Due date</span><input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
              <label className="operations-task-field"><span>Priority</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as EmployeeTask["priority"] })}><option>Low</option><option>Medium</option><option>High</option></select></label>
            </div>
            <div className="dialog-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" type="submit"><Plus size={14} /> Assign task</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

function TaskStat({ label, value }: { label: string; value: number }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong><small>Operational tasks</small></article>;
}
