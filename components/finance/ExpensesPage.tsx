"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Expense, ExpenseCategory, ExpenseHistory, ExpenseStatus, Project, Role } from "../../lib/types";
import { PageHeader } from "../common/PageHeader";

const storageKey = "cmcsExpenses";
const categories: ExpenseCategory[] = [
  "Travel", "Transportation", "Equipment Rental", "Production", "Technical",
  "Food & Accommodation", "Office Supplies", "Staff", "Other",
];
const statuses: ExpenseStatus[] = ["Draft", "Pending Approval", "Approved", "Rejected", "Paid"];
const paymentMethods = ["Bank Transfer", "Cash", "Card", "Mobile Wallet", "Other"];
const usd = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const actorName = (role: Role) => role === "ceo" ? "Ahmad Khan" : role === "hoo" ? "Wali Khan" : "Farid Ahmad";

function seedExpenses(projects: Project[]): Expense[] {
  const first = projects[0];
  const second = projects[1] ?? first;
  if (!first) return [];
  return [
    {
      id: "EXP-2026-001",
      projectId: first.id,
      project: first.name,
      title: "Field travel and transport",
      category: "Travel",
      description: "Crew travel for the community awareness shoot.",
      amount: 1850,
      expenseDate: "2026-10-12",
      vendor: "Kabul Transport Services",
      paymentMethod: "Bank Transfer",
      receiptName: "field-travel-invoice.pdf",
      status: "Approved",
      submittedBy: "Farid Ahmad",
      history: [
        { status: "Draft", date: "2026-10-12", actor: "Farid Ahmad" },
        { status: "Pending Approval", date: "2026-10-12", actor: "Farid Ahmad" },
        { status: "Approved", date: "2026-10-13", actor: "Ahmad Khan", note: "Approved for project delivery." },
      ],
    },
    {
      id: "EXP-2026-002",
      projectId: second.id,
      project: second.name,
      title: "Production equipment rental",
      category: "Equipment Rental",
      description: "Camera and lighting package rental.",
      amount: 4200,
      expenseDate: "2026-10-14",
      vendor: "Ariana Camera House",
      paymentMethod: "Card",
      receiptName: "camera-rental.pdf",
      status: "Pending Approval",
      submittedBy: "Farid Ahmad",
      history: [
        { status: "Draft", date: "2026-10-14", actor: "Farid Ahmad" },
        { status: "Pending Approval", date: "2026-10-14", actor: "Farid Ahmad", note: "Routed to authorized approvers." },
      ],
    },
  ];
}

type FormState = Omit<Expense, "id" | "project" | "submittedBy" | "history" | "status"> & { status: ExpenseStatus };
const blankForm = (project?: Project): FormState => ({
  projectId: project?.id ?? "",
  title: "",
  category: "Production",
  description: "",
  amount: 0,
  expenseDate: today(),
  vendor: "",
  paymentMethod: "Bank Transfer",
  receiptName: "",
  status: "Draft",
});

export function ExpensesPage({ projects, role, onNotify }: { projects: Project[]; role: Role; onNotify: (message: string) => void }) {
  const canApprove = role === "ceo" || role === "hoo" || role === "admin";
  const canCreate = role === "finance" || role === "admin";
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "All">("All");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Expense | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm(projects[0]));
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const pageSize = 6;

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try { setExpenses(JSON.parse(saved) as Expense[]); } catch { setExpenses(seedExpenses(projects)); }
    } else setExpenses(seedExpenses(projects));
  }, [projects]);
  useEffect(() => {
    if (expenses.length) window.localStorage.setItem(storageKey, JSON.stringify(expenses));
  }, [expenses]);

  const filtered = useMemo(() => expenses
    .filter((expense) => (statusFilter === "All" || expense.status === statusFilter)
      && (categoryFilter === "All" || expense.category === categoryFilter)
      && `${expense.id} ${expense.title} ${expense.project} ${expense.vendor}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "amount" ? b.amount - a.amount : b.expenseDate.localeCompare(a.expenseDate)), [expenses, statusFilter, categoryFilter, query, sort]);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const totals = {
    total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    pending: expenses.filter((expense) => expense.status === "Pending Approval").length,
    approved: expenses.filter((expense) => expense.status === "Approved").reduce((sum, expense) => sum + expense.amount, 0),
    paid: expenses.filter((expense) => expense.status === "Paid").reduce((sum, expense) => sum + expense.amount, 0),
  };
  const summaries = projects.map((project) => ({ project, amount: expenses.filter((expense) => expense.projectId === project.id).reduce((sum, expense) => sum + expense.amount, 0) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxSummary = Math.max(...summaries.map((item) => item.amount), 1);

  function flash(message: string) { setNotice(message); onNotify(message); window.setTimeout(() => setNotice(""), 2600); }
  function openNew(project?: Project) { setEditing(null); setIsCreating(true); setSelected(null); setReceipt(null); setForm(blankForm(project ?? projects[0])); }
  function openEdit(expense: Expense) { setSelected(null); setIsCreating(false); setEditing(expense); setReceipt(null); setForm({ projectId: expense.projectId, title: expense.title, category: expense.category, description: expense.description, amount: expense.amount, expenseDate: expense.expenseDate, vendor: expense.vendor, paymentMethod: expense.paymentMethod, receiptName: expense.receiptName ?? "", status: expense.status }); }
  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function save(event: FormEvent, submit: boolean) {
    event.preventDefault();
    const project = projects.find((item) => item.id === form.projectId);
    if (!project || !form.title.trim() || !form.vendor.trim() || form.amount <= 0 || !form.expenseDate) { flash("Complete the required expense fields before saving."); return; }
    if (!canCreate) { flash("Only Finance can create or edit expenses."); return; }
    const nextStatus: ExpenseStatus = submit ? "Pending Approval" : "Draft";
    const nextHistory: ExpenseHistory = { status: nextStatus, date: today(), actor: actorName(role), note: submit ? "Submitted for approval." : "Draft saved." };
    const next: Expense = { id: editing?.id ?? `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, "0")}`, ...form, project: project.name, submittedBy: editing?.submittedBy ?? actorName(role), receiptName: receipt?.name ?? form.receiptName, status: nextStatus, history: [...(editing?.history ?? []), nextHistory] };
    setExpenses((current) => editing ? current.map((item) => item.id === editing.id ? next : item) : [next, ...current]);
    setEditing(null);
    setIsCreating(false);
    flash(`${next.id} ${submit ? "submitted for approval" : "saved as a draft"}.`);
  }
  function remove(expense: Expense) { if (!canCreate || expense.status !== "Draft") { flash("Only Finance can delete draft expenses."); return; } setExpenses((current) => current.filter((item) => item.id !== expense.id)); setSelected(null); flash(`${expense.id} deleted.`); }
  function decide(status: "Approved" | "Rejected") {
    if (!selected || !canApprove || !comment.trim()) { flash("Add an approval comment before deciding."); return; }
    const next = { ...selected, status, history: [...selected.history, { status, date: today(), actor: actorName(role), note: comment.trim() }] };
    setExpenses((current) => current.map((item) => item.id === next.id ? next : item)); setSelected(next); setComment(""); flash(`${next.id} ${status.toLowerCase()}.`);
  }
  function markPaid() {
    if (!selected || !canApprove || selected.status !== "Approved") return;
    const next = { ...selected, status: "Paid" as const, history: [...selected.history, { status: "Paid" as const, date: today(), actor: actorName(role), note: "Payment recorded." }] };
    setExpenses((current) => current.map((item) => item.id === next.id ? next : item)); setSelected(next); flash(`${next.id} marked paid.`);
  }
  function changePage(next: number) { setPage(Math.min(totalPages, Math.max(1, next))); }

  if (editing || isCreating) return <ExpenseForm form={form} projects={projects} receipt={receipt} canCreate={canCreate} editing={editing} onChange={updateForm} onReceipt={setReceipt} onBack={() => { setEditing(null); setIsCreating(false); }} onSave={save} />;
  if (selected) return <ExpenseDetails expense={selected} canApprove={canApprove} canCreate={canCreate} comment={comment} onComment={setComment} onBack={() => setSelected(null)} onEdit={() => openEdit(selected)} onDelete={() => remove(selected)} onDecision={decide} onPaid={markPaid} />;
  return (
    <section className="page-section expenses-page">
      <PageHeader eyebrow="FINANCE / EXPENSES" title="Expense management" copy="Track project spending, route approvals, and keep every receipt auditable." action={canCreate ? "Create expense" : undefined} onAction={() => openNew()} />
      <div className="stat-grid expense-stats">
        <ExpenseStat icon={<CircleDollarSign size={17} />} label="Total expenses" value={usd(totals.total)} detail={`${expenses.length} recorded expenses`} />
        <ExpenseStat icon={<Receipt size={17} />} label="Pending approval" value={String(totals.pending)} detail="Awaiting authorized review" tone="amber" />
        <ExpenseStat icon={<Check size={17} />} label="Approved expenses" value={usd(totals.approved)} detail="Ready for payment" tone="green" />
        <ExpenseStat icon={<Check size={17} />} label="Paid expenses" value={usd(totals.paid)} detail="Payment completed" tone="purple" />
      </div>
      <div className="expense-report-grid">
        <div className="panel expense-chart"><div className="panel-heading"><div><h2>Project-wise expense summary</h2><p>Spend across projects with recorded expenses.</p></div></div>{summaries.length ? summaries.map(({ project, amount }) => <div className="expense-bar-row" key={project.id}><span title={project.name}>{project.name}</span><div><i style={{ width: `${(amount / maxSummary) * 100}%` }} /></div><strong>{usd(amount)}</strong></div>) : <div className="empty-state">No project expenses yet.</div>}</div>
        <div className="panel expense-breakdown"><div className="panel-heading"><div><h2>Approval workflow</h2><p>Draft → Pending Approval → Approved/Rejected → Paid</p></div></div><div className="workflow-steps">{statuses.map((status, index) => <span key={status}><b>{index + 1}</b>{status}</span>)}</div><p className="expense-workflow-note">{canApprove ? "You are an authorized approver. Decisions require a comment." : "Finance can prepare and submit expenses for approval."}</p></div>
      </div>
      <div className="expense-toolbar"><label className="inline-search"><Search size={15} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search ID, title, project, or vendor..." /></label><div className="expense-filters"><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as ExpenseStatus | "All"); setPage(1); }}><option value="All">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value as ExpenseCategory | "All"); setPage(1); }}><option value="All">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value as "date" | "amount")}><option value="date">Newest first</option><option value="amount">Highest amount</option></select></div></div>
      <div className="panel expense-table-panel"><div className="table-wrap"><table className="expense-table"><thead><tr><th>Expense</th><th>Project</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map((expense) => <tr key={expense.id}><td><button className="expense-id-link" onClick={() => setSelected(expense)}><FileText size={15} /><span><strong>{expense.id}</strong><small>{expense.title}</small></span></button></td><td>{expense.project}</td><td>{expense.category}</td><td><strong>{usd(expense.amount)}</strong></td><td>{expense.expenseDate}</td><td><span className={`status-pill ${expense.status.toLowerCase().replaceAll(" ", "-")}`}>{expense.status}</span></td><td><button className="icon-button" onClick={() => setSelected(expense)} aria-label={`Open ${expense.id}`}><ChevronDown size={16} /></button></td></tr>)}</tbody></table>{!visible.length && <div className="empty-state"><Search size={28} /><h3>No expenses found</h3><p>Try another search or filter.</p></div>}</div><div className="expense-pagination"><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button className="button button-secondary" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button><b>Page {page} of {totalPages}</b><button className="button button-secondary" disabled={page === totalPages} onClick={() => changePage(page + 1)}>Next</button></div></div></div>
      {notice && <div className="toast">{notice}</div>}
    </section>
  );
}

function ExpenseStat({ icon, label, value, detail, tone = "" }: { icon: ReactNode; label: string; value: string; detail: string; tone?: string }) { return <article className={`stat-card expense-stat ${tone}`}><div><span>{label}</span>{icon}</div><strong>{value}</strong><small>{detail}</small></article>; }

function ExpenseForm({ form, projects, receipt, canCreate, editing, onChange, onReceipt, onBack, onSave }: { form: FormState; projects: Project[]; receipt: File | null; canCreate: boolean; editing: Expense | null; onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void; onReceipt: (file: File | null) => void; onBack: () => void; onSave: (event: FormEvent, submit: boolean) => void }) {
  const fileChange = (event: ChangeEvent<HTMLInputElement>) => onReceipt(event.target.files?.[0] ?? null);
  return <section className="page-section expenses-page"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to expenses</button><PageHeader eyebrow="FINANCE / EXPENSES" title={editing ? "Edit expense" : "Create expense"} copy="Add the expense details and save a draft or submit it for approval." /><form className="panel expense-form" onSubmit={(event) => onSave(event, event.nativeEvent.submitter instanceof HTMLElement && event.nativeEvent.submitter.dataset.action === "submit")}><div className="expense-form-grid"><label>Project<select value={form.projectId} onChange={(event) => onChange("projectId", event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Expense title<input required value={form.title} onChange={(event) => onChange("title", event.target.value)} placeholder="e.g. Location transport" /></label><label>Category<select value={form.category} onChange={(event) => onChange("category", event.target.value as ExpenseCategory)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Amount (USD)<input required type="number" min="0.01" step="0.01" value={form.amount || ""} onChange={(event) => onChange("amount", Number(event.target.value))} /></label><label>Expense date<input required type="date" value={form.expenseDate} onChange={(event) => onChange("expenseDate", event.target.value)} /></label><label>Vendor / payee<input required value={form.vendor} onChange={(event) => onChange("vendor", event.target.value)} /></label><label>Payment method<select value={form.paymentMethod} onChange={(event) => onChange("paymentMethod", event.target.value)}>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label><label>Receipt upload<input type="file" accept=".pdf,image/*" onChange={fileChange} /><small>{receipt?.name ?? form.receiptName ?? "PDF or image receipt"}</small></label><label className="expense-form-full">Description<textarea value={form.description} onChange={(event) => onChange("description", event.target.value)} rows={4} placeholder="Explain what the expense covers..." /></label></div><div className="expense-form-actions"><button type="button" className="button button-secondary" onClick={onBack}>Cancel</button><button type="submit" className="button button-secondary" disabled={!canCreate}>Save draft</button><button type="submit" data-action="submit" className="button button-primary" disabled={!canCreate}>Save and submit</button></div></form></section>;
}

function ExpenseDetails({ expense, canApprove, canCreate, comment, onComment, onBack, onEdit, onDelete, onDecision, onPaid }: { expense: Expense; canApprove: boolean; canCreate: boolean; comment: string; onComment: (value: string) => void; onBack: () => void; onEdit: () => void; onDelete: () => void; onDecision: (status: "Approved" | "Rejected") => void; onPaid: () => void }) {
  return <section className="page-section expenses-page"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to expenses</button><PageHeader eyebrow={`FINANCE / ${expense.id}`} title={expense.title} copy={`${expense.project} · ${usd(expense.amount)}`} action={canCreate && expense.status === "Draft" ? "Edit expense" : undefined} onAction={onEdit} /><div className="expense-detail-grid"><div className="panel expense-detail-card"><div className="expense-detail-top"><div><span className="eyebrow">EXPENSE STATUS</span><span className={`status-pill ${expense.status.toLowerCase().replaceAll(" ", "-")}`}>{expense.status}</span></div><strong>{usd(expense.amount)}</strong></div><div className="detail-grid"><div><small>Expense ID</small><strong>{expense.id}</strong></div><div><small>Project</small><strong>{expense.project}</strong></div><div><small>Category</small><strong>{expense.category}</strong></div><div><small>Expense date</small><strong>{expense.expenseDate}</strong></div><div><small>Vendor / payee</small><strong>{expense.vendor}</strong></div><div><small>Payment method</small><strong>{expense.paymentMethod}</strong></div><div className="detail-full"><small>Description</small><p>{expense.description || "No description provided."}</p></div><div className="detail-full"><small>Receipt</small><strong>{expense.receiptName ? <span className="receipt-name"><FileText size={14} />{expense.receiptName}</span> : "No receipt uploaded"}</strong></div></div>{canCreate && expense.status === "Draft" && <button className="button button-danger" onClick={onDelete}><Trash2 size={14} /> Delete draft</button>}</div><aside className="expense-side-column">{(canApprove && expense.status === "Pending Approval") && <div className="panel expense-review"><div className="panel-heading"><div><h2>Review expense</h2><p>Authorized approvers must leave a comment.</p></div></div><textarea value={comment} onChange={(event) => onComment(event.target.value)} placeholder="Add approval or rejection comments..." rows={4} /><div className="review-actions"><button className="button button-danger" onClick={() => onDecision("Rejected")}>Reject</button><button className="button button-primary" onClick={() => onDecision("Approved")}>Approve</button></div></div>}{canApprove && expense.status === "Approved" && <div className="panel expense-review"><h2>Payment</h2><p>Record the payment after approval is complete.</p><button className="button button-primary" onClick={onPaid}><Check size={14} /> Mark as paid</button></div>}<div className="panel expense-history"><div className="panel-heading"><div><h2>Approval history</h2><p>Every workflow transition is recorded.</p></div></div>{expense.history.slice().reverse().map((item, index) => <div className="expense-history-entry" key={`${item.date}-${index}`}><i /><span><strong>{item.status}</strong><small>{item.date} · {item.actor}</small>{item.note && <em>{item.note}</em>}</span></div>)}</div></aside></div></section>;
}
