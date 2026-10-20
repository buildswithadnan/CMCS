"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  Printer,
  Receipt,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Expense,
  ExpenseCategory,
  ExpenseHistory,
  ExpenseStatus,
  Project,
  Role,
} from "../../lib/types";
import { PageHeader } from "../common/PageHeader";

// ─── constants ───────────────────────────────────────────────────────────────

const storageKey = "cmcsExpenses";

const categories: ExpenseCategory[] = [
  "Travel",
  "Transportation",
  "Equipment Rental",
  "Production",
  "Technical",
  "Food & Accommodation",
  "Office Supplies",
  "Staff",
  "Other",
];

const statuses: ExpenseStatus[] = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Rejected",
  "Paid",
];

const paymentMethods = [
  "Bank Transfer",
  "Cash",
  "Card",
  "Mobile Wallet",
  "Other",
];

// ─── helpers ─────────────────────────────────────────────────────────────────

const usd = (n: number) =>
  "$" +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const today = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  return `${d} ${months[Number(m) - 1]} ${y}`;
};

const actorName = (role: Role) =>
  role === "ceo"
    ? "Ahmad Khan"
    : role === "hoo"
    ? "Wali Khan"
    : "Farid Ahmad";

const statusClass = (s: string) =>
  s.toLowerCase().replaceAll(" ", "-");

// ─── seed data ────────────────────────────────────────────────────────────────

function seedExpenses(projects: Project[]): Expense[] {
  const first = projects[0];
  const second = projects[1] ?? first;
  const third = projects[2] ?? first;
  if (!first) return [];
  return [
    {
      id: "EXP-2026-001",
      projectId: first.id,
      project: first.name,
      title: "Field travel and transport",
      category: "Travel",
      description:
        "Crew ground travel and vehicle hire for the community awareness shoot across Kabul districts.",
      amount: 1850,
      expenseDate: "2026-10-12",
      vendor: "Kabul Transport Services",
      paymentMethod: "Bank Transfer",
      receiptName: "field-travel-invoice.pdf",
      status: "Approved",
      submittedBy: "Farid Ahmad",
      history: [
        { status: "Draft", date: "2026-10-12", actor: "Farid Ahmad" },
        {
          status: "Pending Approval",
          date: "2026-10-12",
          actor: "Farid Ahmad",
        },
        {
          status: "Approved",
          date: "2026-10-13",
          actor: "Ahmad Khan",
          note: "Approved for project delivery.",
        },
      ],
    },
    {
      id: "EXP-2026-002",
      projectId: second.id,
      project: second.name,
      title: "Production equipment rental",
      category: "Equipment Rental",
      description:
        "Camera body, lighting package, and grip equipment rental for election coverage days.",
      amount: 4200,
      expenseDate: "2026-10-14",
      vendor: "Ariana Camera House",
      paymentMethod: "Card",
      receiptName: "camera-rental.pdf",
      status: "Pending Approval",
      submittedBy: "Farid Ahmad",
      history: [
        { status: "Draft", date: "2026-10-14", actor: "Farid Ahmad" },
        {
          status: "Pending Approval",
          date: "2026-10-14",
          actor: "Farid Ahmad",
          note: "Routed to authorized approvers.",
        },
      ],
    },
    {
      id: "EXP-2026-003",
      projectId: third.id,
      project: third.name,
      title: "Crew accommodation",
      category: "Food & Accommodation",
      description:
        "Two-night hotel stay for four crew members during the documentary pre-production trip.",
      amount: 99,
      expenseDate: "2026-10-20",
      vendor: "Serena Hotel Kabul",
      paymentMethod: "Cash",
      receiptName: "",
      status: "Pending Approval",
      submittedBy: "Farid Ahmad",
      history: [
        { status: "Draft", date: "2026-10-20", actor: "Farid Ahmad" },
        {
          status: "Pending Approval",
          date: "2026-10-20",
          actor: "Farid Ahmad",
        },
      ],
    },
  ];
}

// ─── types ────────────────────────────────────────────────────────────────────

type FormState = Omit<
  Expense,
  "id" | "project" | "submittedBy" | "history" | "status"
> & { status: ExpenseStatus };

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

// ─── PDF document component ───────────────────────────────────────────────────

function ExpenseDocument({
  expense,
  project,
}: {
  expense: Expense;
  project?: Project;
}) {
  return (
    <div className="exp-doc">
      {/* ── Header: logo left, ID box right ── */}
      <div className="exp-doc-header">
        <div className="exp-doc-brand">
          <img
            src="/assets/chinar-logo.png"
            alt="Chinar"
            className="exp-doc-logo"
          />
          <div>
            <strong>CHINAR</strong>
            <span>MEDIA &amp; ENTERTAINMENT (PVT.) LTD.</span>
          </div>
        </div>
        <div className="exp-doc-id-box">
          <div className="exp-doc-id-title">Expense Report</div>
          <div className="exp-doc-id-row">
            <span>No:</span>
            <strong>{expense.id}</strong>
          </div>
          <div className="exp-doc-id-row">
            <span>Date:</span>
            <strong>{fmtDate(expense.expenseDate)}</strong>
          </div>
          <div className="exp-doc-id-row">
            <span>Status:</span>
            <strong>{expense.status}</strong>
          </div>
        </div>
      </div>

      {/* ── Project / Client / Submitted-by row ── */}
      <div className="exp-doc-meta-row">
        <div className="exp-doc-meta-cell">
          <span className="exp-doc-label">Project:</span>
          <strong>{expense.project}</strong>
        </div>
        <div className="exp-doc-meta-cell">
          <span className="exp-doc-label">Client:</span>
          <strong>{project?.client ?? "—"}</strong>
        </div>
        <div className="exp-doc-meta-cell exp-doc-meta-last">
          <span className="exp-doc-label">Submitted by:</span>
          <strong>{expense.submittedBy}</strong>
        </div>
      </div>

      {/* ── Category / Payment / Vendor / Receipt ── */}
      <div className="exp-doc-terms-row">
        <div className="exp-doc-term">
          <span>Category</span>
          <strong>{expense.category}</strong>
        </div>
        <div className="exp-doc-term">
          <span>Payment Method</span>
          <strong>{expense.paymentMethod}</strong>
        </div>
        <div className="exp-doc-term">
          <span>Vendor / Payee</span>
          <strong>{expense.vendor}</strong>
        </div>
        <div className="exp-doc-term exp-doc-term-last">
          <span>Receipt</span>
          <strong>{expense.receiptName || "Not uploaded"}</strong>
        </div>
      </div>

      {/* ── Line-item table ── */}
      <table className="exp-doc-table">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "55%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Date</th>
            <th>Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              <strong>{expense.title}</strong>
              {expense.description && (
                <p className="exp-doc-item-note">{expense.description}</p>
              )}
            </td>
            <td>{fmtDate(expense.expenseDate)}</td>
            <td className="exp-doc-amount">{usd(expense.amount)}</td>
          </tr>
          {[...Array(3)].map((_, i) => (
            <tr key={i} className="exp-doc-empty-row">
              <td />
              <td />
              <td />
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals block (separate from table to avoid rowspan clipping) ── */}
      <div className="exp-doc-totals">
        <div className="exp-doc-totals-note">
          Note: All amounts are in USD. This expense report was prepared by the
          Finance Department of Chinar Media &amp; Entertainment.
        </div>
        <div className="exp-doc-totals-right">
          <div className="exp-doc-total-row">
            <span>Total Amount</span>
            <strong>{usd(expense.amount)}</strong>
          </div>
          <div className="exp-doc-total-row exp-doc-total-grand">
            <span>Grand Total</span>
            <strong>{usd(expense.amount)}</strong>
          </div>
        </div>
      </div>

      {/* ── Approval history ── */}
      <div className="exp-doc-history">
        <div className="exp-doc-history-title">Approval History</div>
        <table className="exp-doc-history-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Date</th>
              <th>Actor</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {expense.history.map((h, i) => (
              <tr key={i}>
                <td>{h.status}</td>
                <td>{h.date}</td>
                <td>{h.actor}</td>
                <td>{h.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="exp-doc-footer">
        <strong>(Expense Report)</strong>
        <p>
          Add: House# 6, 3rd Street, Kolola Pushta, District 4, Kabul,
          Afghanistan.
          <br />
          Tel: +93 799 491112 &nbsp; Email: info@chinar.tv, www.chinar.tv
        </p>
      </div>
    </div>
  );
}

// ─── PDF Preview Modal ────────────────────────────────────────────────────────

function ExpensePreviewModal({
  expense,
  project,
  onClose,
}: {
  expense: Expense;
  project?: Project;
  onClose: () => void;
}) {
  const docRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (!docRef.current) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    // collect all stylesheets from current page
    const styles = Array.from(document.styleSheets)
      .map((ss) => {
        try {
          return Array.from(ss.cssRules)
            .map((r) => r.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>${expense.id} — Expense Report</title>
      <style>
        ${styles}
        @media print {
          body { margin: 0; }
          .exp-doc { box-shadow: none !important; }
        }
      </style>
      </head><body style="background:#f0f4f8;padding:30px;">
      ${docRef.current.outerHTML}
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="exp-preview-backdrop" role="dialog" aria-modal="true" aria-label="Expense document preview">
      <div className="exp-preview-shell">
        {/* Toolbar */}
        <div className="exp-preview-toolbar">
          <div>
            <span className="eyebrow">EXPENSE DOCUMENT</span>
            <h2>{expense.id}</h2>
          </div>
          <div className="exp-preview-actions">
            <button className="button button-secondary" onClick={handlePrint}>
              <Printer size={14} /> Print / Download PDF
            </button>
            <button
              className="icon-button"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="exp-preview-scroll">
          <div ref={docRef}>
            <ExpenseDocument expense={expense} project={project} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function ExpenseStat({
  icon,
  label,
  value,
  detail,
  tone = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <article className={`stat-card expense-stat ${tone}`}>
      <div>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

// ─── Expense Form ─────────────────────────────────────────────────────────────

function ExpenseForm({
  form,
  projects,
  receipt,
  canCreate,
  editing,
  onChange,
  onReceipt,
  onBack,
  onSave,
}: {
  form: FormState;
  projects: Project[];
  receipt: File | null;
  canCreate: boolean;
  editing: Expense | null;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onReceipt: (file: File | null) => void;
  onBack: () => void;
  onSave: (event: FormEvent, submit: boolean) => void;
}) {
  const fileChange = (event: ChangeEvent<HTMLInputElement>) =>
    onReceipt(event.target.files?.[0] ?? null);

  return (
    <section className="page-section expenses-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={15} /> Back to expenses
      </button>

      <PageHeader
        eyebrow="FINANCE / EXPENSES"
        title={editing ? "Edit expense" : "Create expense"}
        copy="Fill in the expense details, then save a draft or submit for approval."
      />

      <form
        className="panel expense-form"
        onSubmit={(event) =>
          onSave(
            event,
            event.nativeEvent.submitter instanceof HTMLElement &&
              event.nativeEvent.submitter.dataset.action === "submit",
          )
        }
      >
        {/* Section: Basic info */}
        <div className="exp-form-section-title">
          <FileText size={15} />
          <h3>Expense information</h3>
        </div>

        <div className="expense-form-grid">
          <label>
            Project <span className="exp-required">*</span>
            <select
              value={form.projectId}
              onChange={(e) => onChange("projectId", e.target.value)}
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Expense title <span className="exp-required">*</span>
            <input
              required
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="e.g. Field location transport"
            />
          </label>

          <label>
            Category <span className="exp-required">*</span>
            <select
              value={form.category}
              onChange={(e) =>
                onChange("category", e.target.value as ExpenseCategory)
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            Amount (USD) <span className="exp-required">*</span>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount || ""}
              onChange={(e) => onChange("amount", Number(e.target.value))}
              placeholder="0.00"
            />
          </label>

          <label>
            Expense date <span className="exp-required">*</span>
            <input
              required
              type="date"
              value={form.expenseDate}
              onChange={(e) => onChange("expenseDate", e.target.value)}
            />
          </label>

          <label>
            Vendor / payee <span className="exp-required">*</span>
            <input
              required
              value={form.vendor}
              onChange={(e) => onChange("vendor", e.target.value)}
              placeholder="Company or individual name"
            />
          </label>

          <label>
            Payment method
            <select
              value={form.paymentMethod}
              onChange={(e) => onChange("paymentMethod", e.target.value)}
            >
              {paymentMethods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>

          <label>
            Receipt
            <div className="exp-file-input-wrap">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={fileChange}
                id="exp-receipt-file"
                className="exp-file-hidden"
              />
              <label htmlFor="exp-receipt-file" className="exp-file-label">
                <FileText size={14} />
                {receipt?.name ?? form.receiptName
                  ? (receipt?.name ?? form.receiptName)
                  : "Choose file (PDF or image)"}
              </label>
            </div>
            <small>Attach a receipt or invoice for audit purposes.</small>
          </label>

          <label className="expense-form-full">
            Description
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={4}
              placeholder="Explain what this expense covers, including any relevant context…"
            />
          </label>
        </div>

        {/* Actions */}
        <div className="expense-form-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onBack}
          >
            Cancel
          </button>
          <div className="exp-form-primary-actions">
            <button
              type="submit"
              className="button button-secondary"
              disabled={!canCreate}
            >
              Save draft
            </button>
            <button
              type="submit"
              data-action="submit"
              className="button button-primary"
              disabled={!canCreate}
            >
              Save &amp; submit
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

// ─── Expense Details ──────────────────────────────────────────────────────────

function ExpenseDetails({
  expense,
  project,
  canApprove,
  canCreate,
  comment,
  onComment,
  onBack,
  onEdit,
  onDelete,
  onDecision,
  onPaid,
}: {
  expense: Expense;
  project?: Project;
  canApprove: boolean;
  canCreate: boolean;
  comment: string;
  onComment: (v: string) => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDecision: (s: "Approved" | "Rejected") => void;
  onPaid: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <section className="page-section expenses-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={15} /> Back to expenses
      </button>

      <div className="exp-detail-header">
        <div>
          <span className="eyebrow">
            FINANCE / EXPENSES / {expense.id}
          </span>
          <h1>{expense.title}</h1>
          <p>
            {expense.project} · {usd(expense.amount)}
          </p>
        </div>
        <div className="exp-detail-header-actions">
          <span className={`status-pill ${statusClass(expense.status)}`}>
            {expense.status}
          </span>
          {canCreate && expense.status === "Draft" && (
            <button className="button button-secondary" onClick={onEdit}>
              Edit expense
            </button>
          )}
          <button
            className="button button-secondary"
            onClick={() => setShowPreview(true)}
          >
            <Eye size={14} /> Preview document
          </button>
          <button
            className="button button-primary"
            onClick={() => setShowPreview(true)}
          >
            <Download size={14} /> Generate PDF
          </button>
        </div>
      </div>

      <div className="expense-detail-grid">
        {/* Main card */}
        <div className="panel expense-detail-card">
          <div className="expense-detail-top">
            <div>
              <span className="eyebrow">EXPENSE AMOUNT</span>
            </div>
            <strong className="exp-amount-large">{usd(expense.amount)}</strong>
          </div>

          <div className="detail-grid">
            <div>
              <small>Expense ID</small>
              <strong>{expense.id}</strong>
            </div>
            <div>
              <small>Project</small>
              <strong>{expense.project}</strong>
            </div>
            <div>
              <small>Category</small>
              <strong>{expense.category}</strong>
            </div>
            <div>
              <small>Expense date</small>
              <strong>{fmtDate(expense.expenseDate)}</strong>
            </div>
            <div>
              <small>Vendor / payee</small>
              <strong>{expense.vendor}</strong>
            </div>
            <div>
              <small>Payment method</small>
              <strong>{expense.paymentMethod}</strong>
            </div>
            <div>
              <small>Submitted by</small>
              <strong>{expense.submittedBy}</strong>
            </div>
            <div>
              <small>Client</small>
              <strong>{project?.client ?? "—"}</strong>
            </div>
            <div className="detail-full">
              <small>Description</small>
              <p>{expense.description || "No description provided."}</p>
            </div>
            <div className="detail-full">
              <small>Receipt</small>
              <strong>
                {expense.receiptName ? (
                  <span className="receipt-name">
                    <FileText size={14} />
                    {expense.receiptName}
                  </span>
                ) : (
                  "No receipt uploaded"
                )}
              </strong>
            </div>
          </div>

          {canCreate && expense.status === "Draft" && (
            <button className="button button-danger" onClick={onDelete}>
              <Trash2 size={14} /> Delete draft
            </button>
          )}
        </div>

        {/* Sidebar */}
        <aside className="expense-side-column">
          {canApprove && expense.status === "Pending Approval" && (
            <div className="panel expense-review">
              <div className="panel-heading">
                <div>
                  <h2>Review expense</h2>
                  <p>Authorized approvers must leave a comment.</p>
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => onComment(e.target.value)}
                placeholder="Add approval or rejection comments…"
                rows={4}
              />
              <div className="review-actions">
                <button
                  className="button button-danger"
                  onClick={() => onDecision("Rejected")}
                >
                  Reject
                </button>
                <button
                  className="button button-primary"
                  onClick={() => onDecision("Approved")}
                >
                  Approve
                </button>
              </div>
            </div>
          )}

          {canApprove && expense.status === "Approved" && (
            <div className="panel expense-review">
              <h2>Payment</h2>
              <p>Record the payment after approval is complete.</p>
              <button className="button button-primary" onClick={onPaid}>
                <Check size={14} /> Mark as paid
              </button>
            </div>
          )}

          {/* Generate document panel */}
          <div className="panel exp-generate-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">DOCUMENT</span>
                <h2>Expense report</h2>
                <p>Generate a formatted PDF for this expense.</p>
              </div>
              <FileText size={16} />
            </div>
            <div className="exp-generate-actions">
              <button
                className="exp-generate-btn"
                onClick={() => setShowPreview(true)}
              >
                <Eye size={14} />
                <div>
                  <strong>Preview document</strong>
                  <small>View before printing</small>
                </div>
              </button>
              <button
                className="exp-generate-btn exp-generate-btn-primary"
                onClick={() => setShowPreview(true)}
              >
                <Printer size={14} />
                <div>
                  <strong>Generate &amp; download PDF</strong>
                  <small>Opens print dialog</small>
                </div>
              </button>
            </div>
          </div>

          {/* Approval history */}
          <div className="panel expense-history">
            <div className="panel-heading">
              <div>
                <h2>Approval history</h2>
                <p>Every workflow transition is recorded.</p>
              </div>
            </div>
            {expense.history
              .slice()
              .reverse()
              .map((item, index) => (
                <div
                  className="expense-history-entry"
                  key={`${item.date}-${index}`}
                >
                  <i />
                  <span>
                    <strong>{item.status}</strong>
                    <small>
                      {item.date} · {item.actor}
                    </small>
                    {item.note && <em>{item.note}</em>}
                  </span>
                </div>
              ))}
          </div>
        </aside>
      </div>

      {showPreview && (
        <ExpensePreviewModal
          expense={expense}
          project={project}
          onClose={() => setShowPreview(false)}
        />
      )}
    </section>
  );
}

// ─── Main ExpensesPage ────────────────────────────────────────────────────────

export function ExpensesPage({
  projects,
  role,
  onNotify,
}: {
  projects: Project[];
  role: Role;
  onNotify: (message: string) => void;
}) {
  const canApprove =
    role === "ceo" || role === "hoo" || role === "admin";
  const canCreate = role === "finance" || role === "admin";

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "All">(
    "All",
  );
  const [categoryFilter, setCategoryFilter] = useState<
    ExpenseCategory | "All"
  >("All");
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

  // Load from localStorage
  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved) as Expense[]);
      } catch {
        setExpenses(seedExpenses(projects));
      }
    } else {
      setExpenses(seedExpenses(projects));
    }
  }, [projects]);

  // Persist to localStorage
  useEffect(() => {
    if (expenses.length)
      window.localStorage.setItem(storageKey, JSON.stringify(expenses));
  }, [expenses]);

  // Filtered + sorted list
  const filtered = useMemo(
    () =>
      expenses
        .filter(
          (e) =>
            (statusFilter === "All" || e.status === statusFilter) &&
            (categoryFilter === "All" || e.category === categoryFilter) &&
            `${e.id} ${e.title} ${e.project} ${e.vendor}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "amount"
            ? b.amount - a.amount
            : b.expenseDate.localeCompare(a.expenseDate),
        ),
    [expenses, statusFilter, categoryFilter, query, sort],
  );

  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const totals = {
    total: expenses.reduce((s, e) => s + e.amount, 0),
    pending: expenses.filter((e) => e.status === "Pending Approval").length,
    approved: expenses
      .filter((e) => e.status === "Approved")
      .reduce((s, e) => s + e.amount, 0),
    paid: expenses
      .filter((e) => e.status === "Paid")
      .reduce((s, e) => s + e.amount, 0),
  };

  function flash(msg: string) {
    setNotice(msg);
    onNotify(msg);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function openNew(project?: Project) {
    setEditing(null);
    setIsCreating(true);
    setSelected(null);
    setReceipt(null);
    setForm(blankForm(project ?? projects[0]));
  }

  function openEdit(expense: Expense) {
    setSelected(null);
    setIsCreating(false);
    setEditing(expense);
    setReceipt(null);
    setForm({
      projectId: expense.projectId,
      title: expense.title,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      vendor: expense.vendor,
      paymentMethod: expense.paymentMethod,
      receiptName: expense.receiptName ?? "",
      status: expense.status,
    });
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((cur) => ({ ...cur, [key]: value }));
  }

  function save(event: FormEvent, submit: boolean) {
    event.preventDefault();
    const project = projects.find((p) => p.id === form.projectId);
    if (
      !project ||
      !form.title.trim() ||
      !form.vendor.trim() ||
      form.amount <= 0 ||
      !form.expenseDate
    ) {
      flash("Complete all required fields before saving.");
      return;
    }
    if (!canCreate) {
      flash("Only Finance can create or edit expenses.");
      return;
    }
    const nextStatus: ExpenseStatus = submit ? "Pending Approval" : "Draft";
    const nextHistory: ExpenseHistory = {
      status: nextStatus,
      date: today(),
      actor: actorName(role),
      note: submit ? "Submitted for approval." : "Draft saved.",
    };
    const next: Expense = {
      id:
        editing?.id ??
        `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, "0")}`,
      ...form,
      project: project.name,
      submittedBy: editing?.submittedBy ?? actorName(role),
      receiptName: receipt?.name ?? form.receiptName,
      status: nextStatus,
      history: [...(editing?.history ?? []), nextHistory],
    };
    setExpenses((cur) =>
      editing
        ? cur.map((e) => (e.id === editing.id ? next : e))
        : [next, ...cur],
    );
    setEditing(null);
    setIsCreating(false);
    flash(
      `${next.id} ${submit ? "submitted for approval" : "saved as a draft"}.`,
    );
  }

  function remove(expense: Expense) {
    if (!canCreate || expense.status !== "Draft") {
      flash("Only Finance can delete draft expenses.");
      return;
    }
    setExpenses((cur) => cur.filter((e) => e.id !== expense.id));
    setSelected(null);
    flash(`${expense.id} deleted.`);
  }

  function decide(status: "Approved" | "Rejected") {
    if (!selected || !canApprove || !comment.trim()) {
      flash("Add an approval comment before deciding.");
      return;
    }
    const next = {
      ...selected,
      status,
      history: [
        ...selected.history,
        {
          status,
          date: today(),
          actor: actorName(role),
          note: comment.trim(),
        },
      ],
    };
    setExpenses((cur) => cur.map((e) => (e.id === next.id ? next : e)));
    setSelected(next);
    setComment("");
    flash(`${next.id} ${status.toLowerCase()}.`);
  }

  function markPaid() {
    if (!selected || !canApprove || selected.status !== "Approved") return;
    const next = {
      ...selected,
      status: "Paid" as const,
      history: [
        ...selected.history,
        {
          status: "Paid" as const,
          date: today(),
          actor: actorName(role),
          note: "Payment recorded.",
        },
      ],
    };
    setExpenses((cur) => cur.map((e) => (e.id === next.id ? next : e)));
    setSelected(next);
    flash(`${next.id} marked paid.`);
  }

  function changePage(n: number) {
    setPage(Math.min(totalPages, Math.max(1, n)));
  }

  // Route to sub-views
  if (editing || isCreating) {
    return (
      <ExpenseForm
        form={form}
        projects={projects}
        receipt={receipt}
        canCreate={canCreate}
        editing={editing}
        onChange={updateForm}
        onReceipt={setReceipt}
        onBack={() => {
          setEditing(null);
          setIsCreating(false);
        }}
        onSave={save}
      />
    );
  }

  if (selected) {
    const project = projects.find((p) => p.id === selected.projectId);
    return (
      <ExpenseDetails
        expense={selected}
        project={project}
        canApprove={canApprove}
        canCreate={canCreate}
        comment={comment}
        onComment={setComment}
        onBack={() => setSelected(null)}
        onEdit={() => openEdit(selected)}
        onDelete={() => remove(selected)}
        onDecision={decide}
        onPaid={markPaid}
      />
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <section className="page-section expenses-page">
      <PageHeader
        eyebrow="FINANCE / EXPENSES"
        title="Expense management"
        copy="Track project spending, route approvals, and keep every receipt auditable."
        action={canCreate ? "Create expense" : undefined}
        onAction={() => openNew()}
      />

      {/* Summary cards */}
      <div className="stat-grid expense-stats">
        <ExpenseStat
          icon={<CircleDollarSign size={17} />}
          label="Total expenses"
          value={usd(totals.total)}
          detail={`${expenses.length} recorded expense${expenses.length !== 1 ? "s" : ""}`}
        />
        <ExpenseStat
          icon={<Receipt size={17} />}
          label="Pending approval"
          value={String(totals.pending)}
          detail="Awaiting authorized review"
          tone="amber"
        />
        <ExpenseStat
          icon={<Check size={17} />}
          label="Approved expenses"
          value={usd(totals.approved)}
          detail="Ready for payment"
          tone="green"
        />
        <ExpenseStat
          icon={<Check size={17} />}
          label="Paid expenses"
          value={usd(totals.paid)}
          detail="Payment completed"
          tone="purple"
        />
      </div>

      {/* Toolbar */}
      <div className="expense-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search ID, title, project, or vendor…"
          />
        </label>
        <div className="expense-filters">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ExpenseStatus | "All");
              setPage(1);
            }}
          >
            <option value="All">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as ExpenseCategory | "All");
              setPage(1);
            }}
          >
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "date" | "amount")}
          >
            <option value="date">Newest first</option>
            <option value="amount">Highest amount</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="panel expense-table-panel">
        <div className="table-wrap">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Expense</th>
                <th>Project</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <button
                      className="expense-id-link"
                      onClick={() => setSelected(expense)}
                    >
                      <FileText size={15} />
                      <span>
                        <strong>{expense.id}</strong>
                        <small>{expense.title}</small>
                      </span>
                    </button>
                  </td>
                  <td>{expense.project}</td>
                  <td>{expense.category}</td>
                  <td>
                    <strong>{usd(expense.amount)}</strong>
                  </td>
                  <td>{expense.expenseDate}</td>
                  <td>
                    <span
                      className={`status-pill ${statusClass(expense.status)}`}
                    >
                      {expense.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="expense-review-action"
                      onClick={() => setSelected(expense)}
                      aria-label={`View details for ${expense.id}`}
                    >
                      View details <ChevronDown size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!visible.length && (
            <div className="empty-state">
              <Search size={28} />
              <h3>No expenses found</h3>
              <p>Try another search term or clear the filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="expense-pagination">
          <span>
            Showing{" "}
            {filtered.length
              ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`
              : "0"}{" "}
            of {filtered.length}
          </span>
          <div>
            <button
              className="button button-secondary"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              Previous
            </button>
            <b>
              Page {page} of {totalPages}
            </b>
            <button
              className="button button-secondary"
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {notice && <div className="toast">{notice}</div>}
    </section>
  );
}
