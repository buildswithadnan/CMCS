"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Edit2,
  Eye,
  FileText,
  Plus,
  Search,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { Project, Salary, PaymentStatus } from "../../lib/types";
import { PageHeader } from "../common/PageHeader";

/* ── seed data ────────────────────────────────────────────── */
const mockSalaries: Salary[] = [
  {
    id: "SAL-001",
    employeeName: "Hafizullah Khan",
    employeeId: "EMP-001",
    projectId: "PRJ-2026-0042",
    project: "UNDP Community Awareness Campaign",
    role: "Director of Photography",
    amount: 85000,
    paymentStatus: "Paid",
    paymentDate: "2026-10-15",
    paidAmount: 85000,
    history: [{ date: "2026-10-15", action: "Payment Completed", amount: 85000, actor: "Finance Manager" }],
  },
  {
    id: "SAL-002",
    employeeName: "Ahmad Rahimi",
    employeeId: "EMP-002",
    projectId: "PRJ-2026-0036",
    project: "Herat Cultural Heritage Series",
    role: "Camera Operator",
    amount: 65000,
    paymentStatus: "Partially Paid",
    paymentDate: "2026-10-20",
    paidAmount: 32500,
    history: [{ date: "2026-10-10", action: "Partial Payment", amount: 32500, actor: "Finance Manager", note: "50% advance payment" }],
  },
  {
    id: "SAL-003",
    employeeName: "Wali Khan",
    employeeId: "EMP-003",
    projectId: "PRJ-2026-0045",
    project: "National Election Coverage",
    role: "Field Producer",
    amount: 95000,
    paymentStatus: "Unpaid",
    paymentDate: "2026-10-25",
    paidAmount: 0,
  },
  {
    id: "SAL-004",
    employeeName: "Zainab Ahmad",
    employeeId: "EMP-004",
    projectId: "PRJ-2026-0052",
    project: "Women in Media Forum Documentary",
    role: "Editor",
    amount: 70000,
    paymentStatus: "Paid",
    paymentDate: "2026-10-12",
    paidAmount: 70000,
    history: [{ date: "2026-10-12", action: "Payment Completed", amount: 70000, actor: "Finance Manager" }],
  },
  {
    id: "SAL-005",
    employeeName: "Shoaib Ahmad",
    employeeId: "EMP-005",
    projectId: "PRJ-2026-0031",
    project: "Youth Media Training Series",
    role: "Sound Engineer",
    amount: 55000,
    paymentStatus: "Unpaid",
    paymentDate: "2026-10-28",
    paidAmount: 0,
  },
];

/* ── helpers ──────────────────────────────────────────────── */
const fmt    = (n: number) => `${n.toLocaleString()} AFN`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_META: Record<PaymentStatus, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  Paid:            { label: "Paid",          cls: "sal-pill-green",  icon: CheckCircle2 },
  "Partially Paid":{ label: "Partially Paid",cls: "sal-pill-amber",  icon: Clock        },
  Unpaid:          { label: "Unpaid",        cls: "sal-pill-red",    icon: Clock        },
};

function StatusPill({ status }: { status: PaymentStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className={`sal-pill ${m.cls}`}>
      <Icon size={10} />
      {m.label}
    </span>
  );
}

/* ── Salary Dialog ────────────────────────────────────────── */
function SalaryDialog({
  salary, projects, onClose, onSave, mode,
}: {
  salary: Salary | null; projects: Project[];
  onClose: () => void; onSave: (s: Salary) => void;
  mode: "add" | "edit" | "view";
}) {
  const [form, setForm] = useState<Salary>(
    salary ?? {
      id: "", employeeName: "", employeeId: "", projectId: "",
      project: "", role: "", amount: 0, paymentStatus: "Unpaid",
      paymentDate: "", paidAmount: 0, notes: "", history: [],
    }
  );

  const isView = mode === "view";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isView) return;
    const proj = projects.find((p) => p.id === form.projectId);
    onSave({
      ...form,
      id: salary?.id || `SAL-${String(Date.now()).slice(-4)}`,
      project: proj?.name || "",
      history: [
        ...(form.history || []),
        { date: new Date().toISOString().split("T")[0], action: salary ? "Updated" : "Created", amount: form.amount, actor: "Finance Manager" },
      ],
    });
  }

  const paidPct = form.amount > 0 ? Math.round(((form.paidAmount || 0) / form.amount) * 100) : 0;

  return (
    <div className="sal-modal-overlay" onClick={onClose}>
      <div className="sal-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sal-modal-head">
          <div className="sal-modal-head-left">
            <div className="sal-modal-avatar">
              {form.employeeName ? form.employeeName.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <div>
              <span className="sal-eyebrow">
                {mode === "add" ? "NEW SALARY RECORD" : mode === "edit" ? "EDIT RECORD" : "SALARY DETAILS"}
              </span>
              <h2 className="sal-modal-title">
                {form.employeeName || "New Salary Record"}
              </h2>
              {form.id && <code className="sal-modal-id">{form.id}</code>}
            </div>
          </div>
          <button className="sal-modal-close icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* View mode: payment progress banner */}
        {isView && (
          <div className="sal-modal-progress-banner">
            <div className="sal-modal-progress-info">
              <span>Payment progress</span>
              <strong>{paidPct}%</strong>
            </div>
            <div className="sal-progress-track">
              <div
                className="sal-progress-fill"
                style={{
                  width: `${paidPct}%`,
                  background: paidPct === 100 ? "#16a34a" : paidPct > 0 ? "#d97706" : "#dc2626",
                }}
              />
            </div>
            <div className="sal-modal-progress-amounts">
              <span>Paid: <strong>{fmt(form.paidAmount || 0)}</strong></span>
              <span>Total: <strong>{fmt(form.amount)}</strong></span>
            </div>
          </div>
        )}

        <form className="sal-modal-form" onSubmit={handleSubmit}>
          <div className="sal-form-grid">
            <label className="sal-form-field">
              <span>Employee Name {!isView && <b className="sal-req">*</b>}</span>
              <input
                type="text" value={form.employeeName} disabled={isView} required={!isView}
                placeholder="e.g. Ahmad Khan"
                onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              />
            </label>
            <label className="sal-form-field">
              <span>Employee ID {!isView && <b className="sal-req">*</b>}</span>
              <input
                type="text" value={form.employeeId} disabled={isView} required={!isView}
                placeholder="e.g. EMP-001"
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              />
            </label>
            <label className="sal-form-field sal-field-span">
              <span>Project {!isView && <b className="sal-req">*</b>}</span>
              <select
                value={form.projectId} disabled={isView} required={!isView}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </label>
            <label className="sal-form-field">
              <span>Assigned Role {!isView && <b className="sal-req">*</b>}</span>
              <input
                type="text" value={form.role} disabled={isView} required={!isView}
                placeholder="e.g. Director of Photography"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </label>
            <label className="sal-form-field">
              <span>Salary Amount (AFN) {!isView && <b className="sal-req">*</b>}</span>
              <input
                type="number" value={form.amount} disabled={isView} required={!isView} min={0}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </label>
            <label className="sal-form-field">
              <span>Payment Status {!isView && <b className="sal-req">*</b>}</span>
              <select
                value={form.paymentStatus} disabled={isView} required={!isView}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </label>
            <label className="sal-form-field">
              <span>Payment Date {!isView && <b className="sal-req">*</b>}</span>
              <input
                type="date" value={form.paymentDate} disabled={isView} required={!isView}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
              />
            </label>
            {form.paymentStatus === "Partially Paid" && (
              <label className="sal-form-field">
                <span>Paid Amount (AFN)</span>
                <input
                  type="number" value={form.paidAmount || 0} disabled={isView} min={0} max={form.amount}
                  onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })}
                />
              </label>
            )}
            <label className="sal-form-field sal-field-span">
              <span>Notes</span>
              <textarea
                value={form.notes || ""} disabled={isView} rows={3}
                placeholder="Optional payment notes or remarks…"
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>

          {/* Payment History */}
          {isView && form.history && form.history.length > 0 && (
            <div className="sal-modal-history">
              <h3 className="sal-modal-history-title">Payment History</h3>
              <div className="sal-history-list">
                {form.history.map((h, i) => (
                  <div key={i} className="sal-history-item">
                    <div className="sal-history-dot" />
                    <div className="sal-history-body">
                      <div className="sal-history-row">
                        <strong>{h.action}</strong>
                        <time>{h.date}</time>
                      </div>
                      {h.amount != null && (
                        <div className="sal-history-amount">{fmt(h.amount)}</div>
                      )}
                      {h.note && <p className="sal-history-note">{h.note}</p>}
                      <small className="sal-history-actor">By {h.actor}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sal-modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              {isView ? "Close" : "Cancel"}
            </button>
            {!isView && (
              <button type="submit" className="button button-primary">
                <DollarSign size={14} />
                {mode === "add" ? "Add Salary Record" : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ Main Page ════════════════════════════════════════════ */
export function SalariesPage({
  projects,
  onNotify,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
}) {
  const [salaries, setSalaries]         = useState<Salary[]>(mockSalaries);
  const [query, setQuery]               = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [selected, setSelected]         = useState<Salary | null>(null);
  const [mode, setMode]                 = useState<"add" | "edit" | "view" | null>(null);

  const filtered = useMemo(() =>
    salaries.filter((s) => {
      const q = query.toLowerCase();
      return (
        (s.employeeName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.project.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q)) &&
        (statusFilter === "All" || s.paymentStatus === statusFilter)
      );
    }),
    [salaries, query, statusFilter]
  );

  const stats = useMemo(() => {
    const total        = salaries.reduce((a, s) => a + s.amount, 0);
    const paid         = salaries.filter((s) => s.paymentStatus === "Paid").reduce((a, s) => a + s.amount, 0);
    const unpaid       = salaries.filter((s) => s.paymentStatus === "Unpaid").reduce((a, s) => a + s.amount, 0);
    const partial      = salaries.filter((s) => s.paymentStatus === "Partially Paid").reduce((a, s) => a + (s.paidAmount || 0), 0);
    const paidCount    = salaries.filter((s) => s.paymentStatus === "Paid").length;
    const unpaidCount  = salaries.filter((s) => s.paymentStatus === "Unpaid").length;
    const partialCount = salaries.filter((s) => s.paymentStatus === "Partially Paid").length;
    const paidPct      = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, unpaid, partial, paidCount, unpaidCount, partialCount, paidPct };
  }, [salaries]);

  function handleSave(salary: Salary) {
    if (mode === "add") {
      setSalaries((p) => [...p, salary]);
      onNotify(`Salary record ${salary.id} added successfully`);
    } else {
      setSalaries((p) => p.map((s) => (s.id === salary.id ? salary : s)));
      onNotify(`Salary record ${salary.id} updated successfully`);
    }
    setMode(null);
    setSelected(null);
  }

  function openView(s: Salary)  { setSelected(s); setMode("view"); }
  function openEdit(s: Salary)  { setSelected(s); setMode("edit"); }
  function openAdd()            { setSelected(null); setMode("add"); }
  function closeDialog()        { setMode(null); setSelected(null); }

  return (
    <>
      <PageHeader
        eyebrow="FINANCE / SALARIES"
        title="Employee Salaries"
        copy="Manage project-based employee salary payments and track payment history."
        action="Add Salary"
        onAction={openAdd}
      />

      {/* ── KPI cards ──────────────────────────────────────── */}
      <div className="sal-kpi-grid">
        <div className="sal-kpi-card">
          <div className="sal-kpi-icon sal-kpi-icon-blue">
            <Banknote size={18} />
          </div>
          <div className="sal-kpi-body">
            <span className="sal-kpi-label">Total Payroll</span>
            <strong className="sal-kpi-value">{fmt(stats.total)}</strong>
            <small className="sal-kpi-sub">{salaries.length} records</small>
          </div>
        </div>

        <div className="sal-kpi-card">
          <div className="sal-kpi-icon sal-kpi-icon-green">
            <CheckCircle2 size={18} />
          </div>
          <div className="sal-kpi-body">
            <span className="sal-kpi-label">Paid</span>
            <strong className="sal-kpi-value sal-kpi-green">{fmt(stats.paid)}</strong>
            <small className="sal-kpi-sub">{stats.paidCount} employee{stats.paidCount !== 1 ? "s" : ""}</small>
          </div>
        </div>

        <div className="sal-kpi-card">
          <div className="sal-kpi-icon sal-kpi-icon-red">
            <Clock size={18} />
          </div>
          <div className="sal-kpi-body">
            <span className="sal-kpi-label">Unpaid</span>
            <strong className="sal-kpi-value sal-kpi-red">{fmt(stats.unpaid)}</strong>
            <small className="sal-kpi-sub">{stats.unpaidCount} pending</small>
          </div>
        </div>

        <div className="sal-kpi-card">
          <div className="sal-kpi-icon sal-kpi-icon-amber">
            <TrendingUp size={18} />
          </div>
          <div className="sal-kpi-body">
            <span className="sal-kpi-label">Partially Paid</span>
            <strong className="sal-kpi-value sal-kpi-amber">{fmt(stats.partial)}</strong>
            <small className="sal-kpi-sub">{stats.partialCount} in progress</small>
          </div>
        </div>
      </div>

      {/* ── Payment progress bar ───────────────────────────── */}
      <div className="sal-progress-panel">
        <div className="sal-progress-panel-head">
          <span>Overall payment completion</span>
          <strong>{stats.paidPct}%</strong>
        </div>
        <div className="sal-progress-track sal-progress-track-lg">
          <div
            className="sal-progress-fill sal-progress-fill-green"
            style={{ width: `${stats.paidPct}%` }}
          />
        </div>
        <div className="sal-progress-panel-legend">
          <span><i className="sal-dot sal-dot-green" />Paid ({stats.paidCount})</span>
          <span><i className="sal-dot sal-dot-amber" />Partial ({stats.partialCount})</span>
          <span><i className="sal-dot sal-dot-red"   />Unpaid ({stats.unpaidCount})</span>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="sal-toolbar">
        <label className="sal-search">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by employee, project, or role…"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </label>

        <div className="sal-filter-tabs">
          {(["All", "Paid", "Partially Paid", "Unpaid"] as const).map((s) => (
            <button
              key={s}
              className={`sal-filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s as PaymentStatus | "All")}
            >
              {s}
              {s !== "All" && (
                <span className="sal-filter-count">
                  {s === "Paid" ? stats.paidCount : s === "Unpaid" ? stats.unpaidCount : stats.partialCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="panel sal-table-panel">
        <div className="table-wrap">
          <table className="sal-table">
            <thead>
              <tr>
                <th>Salary ID</th>
                <th>Employee</th>
                <th>Project</th>
                <th>Role</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="sal-empty">
                      <FileText size={30} />
                      <h3>No salary records found</h3>
                      <p>Try adjusting your search or filter.</p>
                    </div>
                  </td>
                </tr>
              )}

              {filtered.map((s) => {
                const paidPct = s.amount > 0 ? Math.round(((s.paidAmount || 0) / s.amount) * 100) : 0;
                return (
                  <tr key={s.id} className="sal-row">
                    {/* ID */}
                    <td>
                      <button className="sal-id-btn" onClick={() => openView(s)}>
                        <span className="sal-id-icon"><DollarSign size={11} /></span>
                        {s.id}
                        <ChevronRight size={11} className="sal-id-chevron" />
                      </button>
                    </td>

                    {/* Employee */}
                    <td>
                      <div className="sal-employee-cell">
                        <div className="sal-avatar">
                          {s.employeeName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{s.employeeName}</strong>
                          <small>{s.employeeId}</small>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td>
                      <div className="sal-project-cell">
                        <strong>{s.project}</strong>
                        <small>{s.projectId}</small>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <span className="sal-role">{s.role}</span>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className="sal-amount">{fmt(s.amount)}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <div className="sal-status-cell">
                        <StatusPill status={s.paymentStatus} />
                        {s.paymentStatus === "Partially Paid" && (
                          <div className="sal-partial-detail">
                            <div className="sal-progress-track sal-progress-track-sm">
                              <div
                                className="sal-progress-fill"
                                style={{ width: `${paidPct}%`, background: "#d97706" }}
                              />
                            </div>
                            <small>{fmt(s.paidAmount || 0)} of {fmt(s.amount)}</small>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <span className="sal-date">{fmtDate(s.paymentDate)}</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="sal-row-actions">
                        <button
                          className="sal-action-btn sal-action-view"
                          title="View details"
                          onClick={() => openView(s)}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="sal-action-btn sal-action-edit"
                          title="Edit record"
                          onClick={() => openEdit(s)}
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="sal-table-footer">
            <span>Showing {filtered.length} of {salaries.length} records</span>
            <span className="sal-table-footer-total">
              Total: <strong>{fmt(filtered.reduce((a, s) => a + s.amount, 0))}</strong>
            </span>
          </div>
        )}
      </div>

      {mode && (
        <SalaryDialog
          salary={selected}
          projects={projects}
          onClose={closeDialog}
          onSave={handleSave}
          mode={mode}
        />
      )}
    </>
  );
}
