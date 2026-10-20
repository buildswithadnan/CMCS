"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CircleDollarSign,
  FileText,
  MessageSquare,
  Plus,
  Printer,
  Search,
  Send,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { Invoice, Payment, Project, Quotation } from "../../lib/types";
import { invoiceSeed, money, paymentSeed, quotationSeed } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";

type InvoiceFilter =
  | "All"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Revision Requested";
type Decision = "Approved" | "Rejected" | "Revision Requested";

const displayStatus = (status: string): Exclude<InvoiceFilter, "All"> =>
  status === "Pending approval"
    ? "Pending"
    : status === "Revision requested"
      ? "Revision Requested"
      : (status as Exclude<InvoiceFilter, "All">);

const statusKey = (status: string) =>
  status.toLowerCase().replaceAll(" ", "-");

export function InvoicePage({
  projects,
  canReview = false,
  canSubmit = false,
  onSubmitted,
  onRevisionRequested,
}: {
  projects: Project[];
  canReview?: boolean;
  canSubmit?: boolean;
  onSubmitted?: (invoice: Invoice, project: Project) => void;
  onRevisionRequested?: (
    invoice: Invoice,
    project: Project,
    comment: string,
  ) => void;
}) {
  const [section, setSection] = useState<"invoices" | "payments">("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>(invoiceSeed);
  const [filter, setFilter] = useState<InvoiceFilter>("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "details">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [decision, setDecision] = useState<{
    invoice: Invoice;
    action: Decision;
  } | null>(null);
  const [revisionComment, setRevisionComment] = useState("");

  const projectFor = (invoice: Invoice) =>
    projects.find((project) => project.id === invoice.projectId);
  const quotationFor = (invoice: Invoice): Quotation | undefined =>
    quotationSeed.find((quotation) => quotation.id === invoice.quotationId);

  const selected = invoices.find((invoice) => invoice.id === selectedId);
  const selectedProject = selected ? projectFor(selected) : undefined;

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesFilter =
          filter === "All" || displayStatus(invoice.status) === filter;
        const matchesQuery = `${invoice.id} ${invoice.quotationId} ${invoice.projectId} ${invoice.project} ${projectFor(invoice)?.client ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [filter, invoices, query],
  );

  const summary = {
    total: invoices.length,
    pending: invoices.filter((invoice) => displayStatus(invoice.status) === "Pending").length,
    revisions: invoices.filter((invoice) => displayStatus(invoice.status) === "Revision Requested").length,
    approved: invoices.filter((invoice) => displayStatus(invoice.status) === "Approved").length,
    rejected: invoices.filter((invoice) => displayStatus(invoice.status) === "Rejected").length,
  };

  function openDetails(invoice: Invoice) {
    setSelectedId(invoice.id);
    setView("details");
  }

  function applyDecision(invoice: Invoice, action: Decision, comment = "") {
    const status = action === "Revision Requested" ? "Revision requested" : action;
    setInvoices((current) =>
      current.map((item) => (item.id === invoice.id ? { ...item, status } : item)),
    );
    if (action === "Revision Requested") {
      const project = projectFor(invoice);
      if (project) onRevisionRequested?.(invoice, project, comment);
    }
    setDecision(null);
    setRevisionComment("");
    setView("list");
  }

  return (
    <section className="page-section quotation-management invoice-management">
      <div className="invoice-subnav" role="tablist" aria-label="Invoice views">
        <button
          className={section === "invoices" ? "selected" : ""}
          onClick={() => setSection("invoices")}
          role="tab"
          aria-selected={section === "invoices"}
        >
          Invoices
        </button>
        <button
          className={section === "payments" ? "selected" : ""}
          onClick={() => setSection("payments")}
          role="tab"
          aria-selected={section === "payments"}
        >
          Payments
        </button>
      </div>
      {section === "payments" ? (
        <PaymentPage
          invoices={invoices}
          projects={projects}
          canManage={canSubmit}
        />
      ) : (
        <>
        {view === "list" && (
        <>
          <PageHeader
            eyebrow="FINANCE / INVOICES"
            title="Invoice management"
            copy="Review invoices linked to their quotations and CMCS projects."
            action={canSubmit ? "Submit invoice" : undefined}
            onAction={canSubmit ? () => setShowSubmit(true) : undefined}
          />
          <InvoiceStats summary={summary} />
          <div className="quotation-toolbar">
            <label className="inline-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search invoice, quotation, project, or client..."
              />
            </label>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as InvoiceFilter)}
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Revision Requested</option>
            </select>
          </div>
          <InvoiceList
            invoices={filteredInvoices}
            projectFor={projectFor}
            canSubmit={canSubmit}
            onOpen={openDetails}
            onResubmit={(invoice) =>
              setInvoices((current) =>
                current.map((item) =>
                  item.id === invoice.id
                    ? { ...item, status: "Pending approval" }
                    : item,
                ),
              )
            }
          />
        </>
        )}
      {view === "details" && selected && selectedProject && (
        <InvoiceDetails
          invoice={selected}
          project={selectedProject}
          quotation={quotationFor(selected)}
          canReview={canReview}
          onBack={() => setView("list")}
          onPrint={() => window.print()}
          onDecision={(action) => {
            setRevisionComment("");
            setDecision({ invoice: selected, action });
          }}
        />
      )}
      {showSubmit && (
        <InvoiceSubmitDialog
          projects={projects}
          invoices={invoices}
          onCancel={() => setShowSubmit(false)}
          onSubmit={(invoice) => {
            setInvoices((current) => [invoice, ...current]);
            setShowSubmit(false);
            onSubmitted?.(invoice, projectFor(invoice)!);
          }}
        />
      )}
      {decision && (
        <InvoiceDecisionDialog
          invoice={decision.invoice}
          action={decision.action}
          comment={revisionComment}
          onCommentChange={setRevisionComment}
          onCancel={() => setDecision(null)}
          onConfirm={() =>
            applyDecision(decision.invoice, decision.action, revisionComment)
          }
        />
      )}
        </>
      )}
    </section>
  );
}

function InvoiceStats({
  summary,
}: {
  summary: { total: number; pending: number; revisions: number; approved: number; rejected: number };
}) {
  return (
    <div className="quotation-stats invoice-stats">
      <article><span>Total invoices</span><strong>{summary.total}</strong><small>Across active projects</small></article>
      <article><span>Pending review</span><strong>{summary.pending}</strong><small>CEO actions required</small></article>
      <article><span>Revision requests</span><strong>{summary.revisions}</strong><small>Need Finance updates</small></article>
      <article><span>Approved</span><strong>{summary.approved}</strong><small>Ready for processing</small></article>
      <article><span>Rejected</span><strong>{summary.rejected}</strong><small>Review history</small></article>
    </div>
  );
}

function PaymentPage({
  invoices,
  projects,
  canManage,
}: {
  invoices: Invoice[];
  projects: Project[];
  canManage: boolean;
}) {
  const [payments, setPayments] = useState<Payment[]>(paymentSeed);
  const [filter, setFilter] = useState<"All" | "Paid" | "Partially Paid" | "Unpaid">("All");
  const [query, setQuery] = useState("");
  const [recording, setRecording] = useState<Invoice | null>(null);
  const approvedInvoices = invoices.filter((invoice) => invoice.status === "Approved");
  const projectFor = (invoice: Invoice) => projects.find((project) => project.id === invoice.projectId);
  const paymentFor = (invoice: Invoice) => payments.find((payment) => payment.invoiceId === invoice.id);
  const statusFor = (invoice: Invoice) => {
    const paid = paymentFor(invoice)?.amountPaid ?? 0;
    return paid >= invoice.amount ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid";
  };
  const rows = approvedInvoices.filter((invoice) => {
    const status = statusFor(invoice);
    const matchesFilter = filter === "All" || filter === status;
    const project = projectFor(invoice);
    const matchesQuery = `${invoice.id} ${invoice.projectId} ${invoice.quotationId} ${project?.client ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });
  const totals = {
    total: approvedInvoices.length,
    paid: approvedInvoices.filter((invoice) => statusFor(invoice) === "Paid").length,
    partial: approvedInvoices.filter((invoice) => statusFor(invoice) === "Partially Paid").length,
    unpaid: approvedInvoices.filter((invoice) => statusFor(invoice) === "Unpaid").length,
  };
  const financials = approvedInvoices.reduce(
    (summary, invoice) => {
      const amountPaid = paymentFor(invoice)?.amountPaid ?? 0;
      summary.total += invoice.amount;
      summary.paid += Math.min(amountPaid, invoice.amount);
      return summary;
    },
    { total: 0, paid: 0 },
  );
  const remaining = Math.max(0, financials.total - financials.paid);
  const collectionRate = financials.total
    ? Math.round((financials.paid / financials.total) * 100)
    : 0;

  function savePayment(invoice: Invoice, amountPaid: number) {
    const existing = paymentFor(invoice);
    const next: Payment = {
      id: existing?.id ?? `PAY-2026-${String(payments.length + 18).padStart(3, "0")}`,
      invoiceId: invoice.id,
      projectId: invoice.projectId,
      quotationId: invoice.quotationId,
      project: invoice.project,
      amount: invoice.amount,
      amountPaid,
      status: amountPaid >= invoice.amount ? "Paid" : amountPaid > 0 ? "Partially Paid" : "Unpaid",
      generationStatus: "—",
      paymentStatus: amountPaid >= invoice.amount ? "Paid" : amountPaid > 0 ? "Partially Paid" : "Unpaid",
    };
    setPayments((current) =>
      existing
        ? current.map((payment) => (payment.id === existing.id ? next : payment))
        : [next, ...current],
    );
    setRecording(null);
  }

  return (
    <div className="payment-management">
      <PageHeader
        eyebrow="FINANCE / INVOICES / PAYMENTS"
        title="Payment progress"
        copy="Track collections for approved invoices linked to their projects and quotations."
      />
      <div className="payment-finance-stats">
        <article className="payment-finance-card payment-finance-card-total">
          <span className="payment-finance-icon"><CircleDollarSign size={18} /></span>
          <div><small>Total amount</small><strong>{money(financials.total)}</strong><em>{totals.total} approved invoices</em></div>
        </article>
        <article className="payment-finance-card payment-finance-card-paid">
          <span className="payment-finance-icon"><WalletCards size={18} /></span>
          <div><small>Amount paid</small><strong>{money(financials.paid)}</strong><em>{collectionRate}% collected</em></div>
        </article>
        <article className="payment-finance-card payment-finance-card-remaining">
          <span className="payment-finance-icon"><TrendingUp size={18} /></span>
          <div><small>Remaining amount</small><strong>{money(remaining)}</strong><em>Outstanding balance</em></div>
        </article>
        <article className="payment-finance-card payment-finance-card-status">
          <span className="payment-finance-icon"><FileText size={18} /></span>
          <div><small>Payment status</small><strong>{totals.paid} / {totals.total}</strong><em>{totals.unpaid} awaiting payment</em></div>
        </article>
      </div>
      <div className="payment-dashboard-grid">
        <section className="panel payment-chart-card">
          <div className="payment-panel-heading">
            <div><span className="eyebrow">COLLECTION OVERVIEW</span><h2>Payment collection</h2><p>Paid versus outstanding across approved invoices.</p></div>
            <strong>{collectionRate}%</strong>
          </div>
          <div className="payment-chart-content">
            <div className="payment-donut" style={{ background: `conic-gradient(#248d68 ${collectionRate}%, #e8edf5 ${collectionRate}% 100%)` }}>
              <div><strong>{collectionRate}%</strong><span>collected</span></div>
            </div>
            <div className="payment-chart-legend">
              <div><span className="payment-legend-dot paid" /><span>Amount paid</span><strong>{money(financials.paid)}</strong></div>
              <div><span className="payment-legend-dot remaining" /><span>Remaining</span><strong>{money(remaining)}</strong></div>
              <div className="payment-chart-total"><span>Total receivable</span><strong>{money(financials.total)}</strong></div>
            </div>
          </div>
        </section>
      </div>
      <div className="payment-invoice-progress">
        <div className="payment-panel-heading"><div><span className="eyebrow">RECEIVABLES</span><h2>Invoice payment progress</h2><p>Monitor how much has been collected for each approved invoice.</p></div></div>
        <div className="payment-progress-list">
          {approvedInvoices.map((invoice) => {
            const amountPaid = Math.min(paymentFor(invoice)?.amountPaid ?? 0, invoice.amount);
            const progress = invoice.amount ? Math.round((amountPaid / invoice.amount) * 100) : 0;
            return <div className="payment-progress-item" key={invoice.id}><div><strong>{invoice.id}</strong><span>{projectFor(invoice)?.client ?? "—"}</span></div><div className="payment-progress-track"><span style={{ width: `${progress}%` }} /></div><strong>{progress}%</strong></div>;
          })}
          {!approvedInvoices.length && <p className="payment-empty-chart">No approved invoices are available for payment tracking.</p>}
        </div>
      </div>
      <div className="quotation-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, project, quotation, or client..." />
        </label>
        <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
          <option>All</option>
          <option>Paid</option>
          <option>Partially Paid</option>
          <option>Unpaid</option>
        </select>
      </div>
      <div className="panel quotation-list-panel payment-list-panel">
        <div className="quotation-list-head payment-list-head">
          <span>Invoice</span><span>Project</span><span>Quotation</span><span>Client</span>
          <span>Total amount</span><span>Amount paid</span><span>Remaining balance</span><span>Status</span><span>Actions</span>
        </div>
        {rows.map((invoice) => {
          const payment = paymentFor(invoice);
          const project = projectFor(invoice);
          const amountPaid = payment?.amountPaid ?? 0;
          const remaining = Math.max(0, invoice.amount - amountPaid);
          const status = statusFor(invoice);
          return (
            <div className="quotation-list-row payment-list-row" key={invoice.id}>
              <span><strong className="payment-id">{invoice.id}</strong><small>{invoice.project}</small></span>
              <span className="payment-link">{invoice.projectId}</span>
              <span className="payment-link">{invoice.quotationId}</span>
              <span><strong>{project?.client ?? "—"}</strong></span>
              <strong>{money(invoice.amount)}</strong>
              <strong>{money(amountPaid)}</strong>
              <strong className={remaining ? "payment-balance" : ""}>{money(remaining)}</strong>
              <span className={`quotation-status payment-${statusKey(status)}`}>{status}</span>
              <span className="quotation-row-actions">
                {canManage && <button className="text-button" onClick={() => setRecording(invoice)}>Record payment</button>}
              </span>
            </div>
          );
        })}
        {!rows.length && <div className="empty-state"><FileText size={30} /><h3>No approved invoices found</h3><p>Payment records are shown after an invoice is approved.</p></div>}
      </div>
      {recording && (
        <PaymentDialog
          invoice={recording}
          currentAmount={paymentFor(recording)?.amountPaid ?? 0}
          onCancel={() => setRecording(null)}
          onSave={(amount) => savePayment(recording, amount)}
        />
      )}
    </div>
  );
}

function PaymentDialog({
  invoice,
  currentAmount,
  onCancel,
  onSave,
}: {
  invoice: Invoice;
  currentAmount: number;
  onCancel: () => void;
  onSave: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(String(currentAmount));
  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed >= 0 && parsed <= invoice.amount;
  return (
    <div className="dialog-backdrop"><div className="dialog payment-dialog">
      <div className="dialog-head"><div><span className="eyebrow">PAYMENT RECORD</span><h2>{invoice.id}</h2><p>{invoice.project} · Total {money(invoice.amount)}</p></div><button className="icon-button" onClick={onCancel}><X size={18} /></button></div>
      <label className="invoice-submit-field">Amount paid (USD)<input type="number" min="0" max={invoice.amount} value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
      <p className="payment-dialog-note">Remaining balance: <strong>{valid ? money(invoice.amount - parsed) : "Enter a valid amount"}</strong></p>
      <div className="dialog-actions"><button className="button button-secondary" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={!valid} onClick={() => onSave(parsed)}>Save payment</button></div>
    </div></div>
  );
}

function InvoiceList({
  invoices,
  projectFor,
  canSubmit,
  onOpen,
  onResubmit,
}: {
  invoices: Invoice[];
  projectFor: (invoice: Invoice) => Project | undefined;
  canSubmit: boolean;
  onOpen: (invoice: Invoice) => void;
  onResubmit: (invoice: Invoice) => void;
}) {
  return (
    <div className="panel quotation-list-panel invoice-list-panel">
      <div className="quotation-list-head invoice-list-head">
        <span>Invoice</span><span>Quotation / project</span><span>Client</span>
        <span>Date</span><span>Amount</span><span>Status</span><span>Actions</span>
      </div>
      {invoices.map((invoice) => {
        const project = projectFor(invoice);
        return (
          <div className="quotation-list-row invoice-list-row" key={invoice.id}>
            <button className="quotation-id-link" onClick={() => onOpen(invoice)}>
              <FileText size={16} />
              <span><strong>{invoice.id}</strong><small>{invoice.projectId}</small></span>
            </button>
            <span>
              <button className="text-button" onClick={() => onOpen(invoice)}>{invoice.quotationId}</button>
              <small>{invoice.projectId}</small>
            </span>
            <span><strong>{project?.client ?? "—"}</strong><small>{invoice.project}</small></span>
            <span>{invoice.submitted ?? "Not submitted"}</span>
            <strong>{money(invoice.amount)}</strong>
            <span className={`quotation-status ${statusKey(invoice.status)}`}>
              {displayStatus(invoice.status)}
            </span>
            <span className="quotation-row-actions invoice-row-actions">
              <button className="text-button" onClick={() => onOpen(invoice)}>
                View details <ArrowUpRight size={13} />
              </button>
              {canSubmit && displayStatus(invoice.status) === "Revision Requested" && (
                <button className="text-button" onClick={() => onResubmit(invoice)}>Resubmit</button>
              )}
            </span>
          </div>
        );
      })}
      {!invoices.length && (
        <div className="empty-state"><FileText size={30} /><h3>No invoices found</h3><p>Choose another status or search term.</p></div>
      )}
    </div>
  );
}

function InvoiceDetails({
  invoice,
  project,
  quotation,
  canReview,
  onBack,
  onPrint,
  onDecision,
}: {
  invoice: Invoice;
  project: Project;
  quotation?: Quotation;
  canReview: boolean;
  onBack: () => void;
  onPrint: () => void;
  onDecision: (action: Decision) => void;
}) {
  const pending = displayStatus(invoice.status) === "Pending";
  return (
    <section className="quotation-details-page">
      <button className="text-button back-link" onClick={onBack}><ArrowLeft size={14} /> Back to invoices</button>
      <div className="quotation-detail-heading">
        <div><span className="eyebrow">INVOICE DETAIL · {invoice.id}</span><h1>{project.name}</h1><p>{project.client} · {project.owner}</p></div>
        <div className="quotation-detail-actions">
          <span className={`quotation-status ${statusKey(invoice.status)}`}>{displayStatus(invoice.status)}</span>
          <button className="button button-secondary" onClick={onPrint}><Printer size={14} /> Print / PDF</button>
        </div>
      </div>
      <div className="quotation-detail-grid">
        <div className="panel quotation-paper-wrap invoice-paper">
          <div className="panel-heading"><div><span className="eyebrow">INVOICE SUMMARY</span><h2>{invoice.id}</h2><p>Submitted {invoice.submitted ?? "—"}</p></div><FileText size={18} /></div>
          <div className="quotation-details">
            <span>Invoice ID<strong>{invoice.id}</strong></span>
            <span>Quotation ID<strong>{invoice.quotationId}</strong></span>
            <span>Project ID<strong>{invoice.projectId}</strong></span>
            <span>Client<strong>{project.client}</strong></span>
            <span>Amount<strong>{money(invoice.amount)}</strong></span>
            <span>Payment<strong>{invoice.paymentStatus}</strong></span>
            <span>Generation<strong>{invoice.generationStatus}</strong></span>
            <span>Submission date<strong>{invoice.submitted ?? "—"}</strong></span>
          </div>
          <div className="panel invoice-linked-record">
            <span className="eyebrow">LINKED QUOTATION</span>
            <h3>{quotation?.id ?? invoice.quotationId}</h3>
            <p>{quotation?.vendor ?? "Quotation record"} · {project.name}</p>
          </div>
        </div>
        <aside className="quotation-side-panel">
          <div className="panel">
            <div className="panel-heading"><div><span className="eyebrow">WORKFLOW</span><h2>Approval status</h2></div><Send size={16} /></div>
            <div className="approval-route"><span className="route-done">Finance prepared</span><span className={pending ? "route-active" : ""}>CEO review</span></div>
            {canReview && pending && (
              <div className="review-actions">
                <button className="button button-secondary" onClick={() => onDecision("Revision Requested")}>Request revision</button>
                <button className="button button-primary" onClick={() => onDecision("Approved")}>Approve</button>
                <button className="button button-danger" onClick={() => onDecision("Rejected")}>Reject</button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function InvoiceSubmitDialog({
  projects,
  invoices,
  onCancel,
  onSubmit,
}: {
  projects: Project[];
  invoices: Invoice[];
  onCancel: () => void;
  onSubmit: (invoice: Invoice) => void;
}) {
  const available = projects.find((project) => !invoices.some((invoice) => invoice.projectId === project.id));
  const [projectId, setProjectId] = useState(available?.id ?? "");
  const project = projects.find((item) => item.id === projectId);
  const quotation = quotationSeed.find((item) => item.projectId === projectId);
  return (
    <div className="dialog-backdrop"><div className="dialog invoice-submit-dialog">
      <div className="dialog-head"><div><span className="eyebrow">FINANCE / INVOICES</span><h2>Submit invoice</h2><p>Link the invoice to an existing quotation and project.</p></div><button className="icon-button" onClick={onCancel}><X size={18} /></button></div>
      <label className="invoice-submit-field">Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((item) => <option key={item.id} value={item.id} disabled={invoices.some((invoice) => invoice.projectId === item.id)}>{item.id} · {item.client}</option>)}</select></label>
      <div className="detail-grid"><span>Quotation<strong>{quotation?.id ?? "No quotation available"}</strong></span><span>Amount<strong>{project ? money(project.budget) : "—"}</strong></span></div>
      <div className="dialog-actions"><button className="button button-secondary" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={!project || !quotation} onClick={() => { if (!project || !quotation) return; onSubmit({ id: `INV-2026-${String(25 + invoices.length).padStart(3, "0")}`, projectId: project.id, quotationId: quotation.id, project: project.name, amount: project.budget, submitted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), status: "Pending approval", generationStatus: "Generated", paymentStatus: "Not issued" }); }}><Plus size={14} /> Submit invoice</button></div>
    </div></div>
  );
}

function InvoiceDecisionDialog({
  invoice,
  action,
  comment,
  onCommentChange,
  onCancel,
  onConfirm,
}: {
  invoice: Invoice;
  action: Decision;
  comment: string;
  onCommentChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const revision = action === "Revision Requested";
  return (
    <div className="dialog-backdrop"><div className="dialog confirmation-dialog">
      <div className="dialog-head"><div><span className="eyebrow">INVOICE REVIEW</span><h2>{revision ? "Request invoice revision" : "Confirm decision"}</h2><p>This will {revision ? "request a revision for" : action.toLowerCase()} <strong>{invoice.id}</strong>.</p></div><button className="icon-button" onClick={onCancel}><X size={18} /></button></div>
      {revision && <label className="invoice-comment-field"><span><MessageSquare size={14} /> Explain the required changes</span><textarea value={comment} onChange={(event) => onCommentChange(event.target.value)} placeholder="Add clear guidance for the Finance Department..." rows={4} autoFocus /></label>}
      <div className="dialog-actions"><button className="button button-secondary" onClick={onCancel}>Cancel</button><button className={`button ${action === "Rejected" ? "button-danger" : "button-primary"}`} disabled={revision && !comment.trim()} onClick={onConfirm}>{revision ? "Request revision" : action}</button></div>
    </div></div>
  );
}
