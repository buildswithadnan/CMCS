"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Download,
  Eye,
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
import {
  invoiceSeed,
  money,
  paymentSeed,
  quotationSeed,
} from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";

// ─── types ────────────────────────────────────────────────────────────────────

type InvoiceFilter =
  | "All"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Revision Requested";
type Decision = "Approved" | "Rejected" | "Revision Requested";

// ─── helpers ─────────────────────────────────────────────────────────────────

const usd = (n: number) =>
  "$" +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const displayStatus = (status: string): Exclude<InvoiceFilter, "All"> =>
  status === "Pending approval"
    ? "Pending"
    : status === "Revision requested"
    ? "Revision Requested"
    : (status as Exclude<InvoiceFilter, "All">);

const statusKey = (status: string) =>
  status.toLowerCase().replaceAll(" ", "-");

// ─── Invoice PDF document ─────────────────────────────────────────────────────

function InvoiceDocument({
  invoice,
  project,
  quotation,
}: {
  invoice: Invoice;
  project: Project;
  quotation?: Quotation;
}) {
  const items = quotation?.items ?? [];
  const hasItems = items.length > 0;

  // Build line items: use quotation items if available, otherwise a single summary row
  const lineItems = hasItems
    ? items
    : [
        {
          id: "default",
          description: invoice.project,
          quantity: 1,
          days: 1,
          unitPrice: invoice.amount,
          category: project.department ?? "Production",
          subcategory: "Services",
          itemNo: "1",
          taxRate: 0,
        },
      ];

  const subtotal = lineItems.reduce(
    (s, item) => s + item.quantity * item.days * item.unitPrice,
    0,
  );

  const paymentTerm = quotation?.paymentTerm ?? "50% advance, 50% on delivery";
  const deliveryTime = quotation?.deliveryTime ?? "As per project schedule";

  return (
    <div className="inv-doc">
      {/* ── Header ── */}
      <div className="inv-doc-header">
        <div className="inv-doc-brand">
          <img
            src="/assets/chinar-logo.png"
            alt="Chinar TV"
            className="inv-doc-logo"
          />
          <div>
            <strong>CHINAR</strong>
            <span>MEDIA &amp; ENTERTAINMENT (PVT.) LTD.</span>
          </div>
        </div>
        <div className="inv-doc-id-box">
          <div className="inv-doc-id-title">Invoice</div>
          <div className="inv-doc-id-row">
            <span>No:</span>
            <strong>{invoice.id}</strong>
          </div>
          <div className="inv-doc-id-row">
            <span>Date:</span>
            <strong>{invoice.submitted ?? "—"}</strong>
          </div>
          <div className="inv-doc-id-row">
            <span>Quotation:</span>
            <strong>{invoice.quotationId}</strong>
          </div>
          <div className="inv-doc-id-row">
            <span>Status:</span>
            <strong>{displayStatus(invoice.status)}</strong>
          </div>
        </div>
      </div>

      {/* ── Bill-to / Project row ── */}
      <div className="inv-doc-meta-row">
        <div className="inv-doc-meta-cell">
          <span className="inv-doc-label">Bill To:</span>
          <strong>{project.client}</strong>
          <small>{invoice.project}</small>
        </div>
        <div className="inv-doc-meta-cell">
          <span className="inv-doc-label">Project:</span>
          <strong>{project.name}</strong>
          <small>{invoice.projectId}</small>
        </div>
        <div className="inv-doc-meta-cell inv-doc-meta-last">
          <span className="inv-doc-label">Project Lead:</span>
          <strong>{project.owner}</strong>
          <small>{project.department} Department</small>
        </div>
      </div>

      {/* ── Terms row ── */}
      <div className="inv-doc-terms-row">
        <div className="inv-doc-term">
          <span>Payment Term</span>
          <strong>{paymentTerm}</strong>
        </div>
        <div className="inv-doc-term">
          <span>Delivery Time</span>
          <strong>{deliveryTime}</strong>
        </div>
        <div className="inv-doc-term">
          <span>Payment Status</span>
          <strong>{invoice.paymentStatus}</strong>
        </div>
        <div className="inv-doc-term inv-doc-term-last">
          <span>Prepared By</span>
          <strong>{quotation?.submittedBy ?? "Finance Department"}</strong>
        </div>
      </div>

      {/* ── Line-item table ── */}
      <table className="inv-doc-table">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "38%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "13%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Days</th>
            <th>Unit Price (USD)</th>
            <th>Total (USD)</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => (
            <tr key={item.id}>
              <td>{item.itemNo ?? i + 1}</td>
              <td>
                <strong>{item.description || invoice.project}</strong>
              </td>
              <td>{item.category ?? "Production"}</td>
              <td>{item.quantity}</td>
              <td>{item.days}</td>
              <td>{usd(item.unitPrice)}</td>
              <td>{usd(item.quantity * item.days * item.unitPrice)}</td>
            </tr>
          ))}
          {/* spacer rows for visual balance */}
          {lineItems.length < 3 &&
            Array.from({ length: 3 - lineItems.length }).map((_, i) => (
              <tr key={`spacer-${i}`} className="inv-doc-empty-row">
                <td /><td /><td /><td /><td /><td /><td />
              </tr>
            ))}
        </tbody>
      </table>

      {/* ── Totals block ── */}
      <div className="inv-doc-totals">
        <div className="inv-doc-totals-note">
          <strong>Bank Details:</strong><br />
          Bank: Azizi Bank, Kabul Branch<br />
          Account Name: Chinar Media &amp; Entertainment<br />
          Account No: 0123456789<br />
          <br />
          Note: Payment should be made within the agreed payment term.
          All amounts are quoted in USD.
        </div>
        <div className="inv-doc-totals-right">
          <div className="inv-doc-total-row">
            <span>Sub Total</span>
            <strong>{usd(subtotal)}</strong>
          </div>
          {quotation?.discount ? (
            <div className="inv-doc-total-row">
              <span>Discount</span>
              <strong>({usd(quotation.discount)})</strong>
            </div>
          ) : null}
          {quotation?.mediaRights ? (
            <div className="inv-doc-total-row">
              <span>Media Rights</span>
              <strong>{usd(quotation.mediaRights)}</strong>
            </div>
          ) : null}
          <div className="inv-doc-total-row inv-doc-total-grand">
            <span>Grand Total</span>
            <strong>{usd(invoice.amount)}</strong>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="inv-doc-footer">
        <strong>(Invoice)</strong>
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

function InvoicePdfModal({
  invoice,
  project,
  quotation,
  onClose,
}: {
  invoice: Invoice;
  project: Project;
  quotation?: Quotation;
  onClose: () => void;
}) {
  const docRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (!docRef.current) return;
    const win = window.open("", "_blank", "width=960,height=740");
    if (!win) return;

    // Collect all page styles
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
      <title>${invoice.id} — Invoice</title>
      <style>
        ${styles}
        body{margin:0;background:#f0f4f8;padding:30px;font-family:'DM Sans',Arial,sans-serif}
        @media print{body{background:#fff;padding:0}.inv-doc{box-shadow:none!important;border-radius:0!important}}
      </style>
      </head><body>
      ${docRef.current.outerHTML}
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  }

  return (
    <div
      className="inv-pdf-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Invoice PDF preview"
    >
      <div className="inv-pdf-shell">
        {/* Toolbar */}
        <div className="inv-pdf-toolbar">
          <div>
            <span className="eyebrow">INVOICE DOCUMENT</span>
            <h2>{invoice.id}</h2>
          </div>
          <div className="inv-pdf-toolbar-actions">
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
        <div className="inv-pdf-scroll">
          <div ref={docRef}>
            <InvoiceDocument
              invoice={invoice}
              project={project}
              quotation={quotation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function InvoiceStats({
  summary,
}: {
  summary: {
    total: number;
    pending: number;
    revisions: number;
    approved: number;
    rejected: number;
  };
}) {
  return (
    <div className="inv-stats-row">
      <article className="inv-stat-card">
        <div className="inv-stat-icon inv-stat-blue">
          <FileText size={16} />
        </div>
        <div>
          <span>Total invoices</span>
          <strong>{summary.total}</strong>
          <small>Across active projects</small>
        </div>
      </article>
      <article className="inv-stat-card">
        <div className="inv-stat-icon inv-stat-amber">
          <Send size={16} />
        </div>
        <div>
          <span>Pending review</span>
          <strong>{summary.pending}</strong>
          <small>CEO actions required</small>
        </div>
      </article>
      <article className="inv-stat-card">
        <div className="inv-stat-icon inv-stat-red">
          <MessageSquare size={16} />
        </div>
        <div>
          <span>Revision requests</span>
          <strong>{summary.revisions}</strong>
          <small>Need Finance updates</small>
        </div>
      </article>
      <article className="inv-stat-card">
        <div className="inv-stat-icon inv-stat-green">
          <Check size={16} />
        </div>
        <div>
          <span>Approved</span>
          <strong>{summary.approved}</strong>
          <small>Ready for processing</small>
        </div>
      </article>
    </div>
  );
}

// ─── Invoice list table ───────────────────────────────────────────────────────

function InvoiceList({
  invoices,
  projectFor,
  quotationFor,
  canSubmit,
  onOpen,
  onResubmit,
  onGeneratePdf,
}: {
  invoices: Invoice[];
  projectFor: (invoice: Invoice) => Project | undefined;
  quotationFor: (invoice: Invoice) => Quotation | undefined;
  canSubmit: boolean;
  onOpen: (invoice: Invoice) => void;
  onResubmit: (invoice: Invoice) => void;
  onGeneratePdf: (invoice: Invoice) => void;
}) {
  return (
    <div className="panel inv-list-panel">
      {/* Header */}
      <div className="inv-list-head">
        <span>Invoice</span>
        <span>Client / Project</span>
        <span>Quotation</span>
        <span>Date</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      {invoices.map((invoice) => {
        const project = projectFor(invoice);
        return (
          <div className="inv-list-row" key={invoice.id}>
            {/* ID */}
            <button
              className="inv-id-btn"
              onClick={() => onOpen(invoice)}
            >
              <span className="inv-id-icon">
                <FileText size={13} />
              </span>
              <span>
                <strong>{invoice.id}</strong>
                <small>{invoice.projectId}</small>
              </span>
            </button>

            {/* Client / Project */}
            <span className="inv-client-cell">
              <strong>{project?.client ?? "—"}</strong>
              <small>{invoice.project}</small>
            </span>

            {/* Quotation ref */}
            <span className="inv-ref-cell">{invoice.quotationId}</span>

            {/* Date */}
            <span className="inv-date-cell">
              {invoice.submitted ?? (
                <em className="inv-not-set">Not submitted</em>
              )}
            </span>

            {/* Amount */}
            <span className="inv-amount-cell">{usd(invoice.amount)}</span>

            {/* Status */}
            <span
              className={`quotation-status ${statusKey(invoice.status)}`}
            >
              {displayStatus(invoice.status)}
            </span>

            {/* Actions */}
            <span className="inv-row-actions">
              <button
                className="inv-action-btn inv-action-ghost"
                onClick={() => onOpen(invoice)}
              >
                View <ArrowUpRight size={12} />
              </button>
              <button
                className="inv-action-btn inv-action-pdf"
                onClick={() => onGeneratePdf(invoice)}
                title="Generate PDF"
              >
                <Download size={12} /> PDF
              </button>
              {canSubmit &&
                displayStatus(invoice.status) === "Revision Requested" && (
                  <button
                    className="inv-action-btn inv-action-ghost"
                    onClick={() => onResubmit(invoice)}
                  >
                    Resubmit
                  </button>
                )}
            </span>
          </div>
        );
      })}

      {!invoices.length && (
        <div className="empty-state">
          <FileText size={30} />
          <h3>No invoices found</h3>
          <p>Choose another status or search term.</p>
        </div>
      )}
    </div>
  );
}

// ─── Invoice details view ─────────────────────────────────────────────────────

function InvoiceDetails({
  invoice,
  project,
  quotation,
  canReview,
  onBack,
  onDecision,
  onGeneratePdf,
}: {
  invoice: Invoice;
  project: Project;
  quotation?: Quotation;
  canReview: boolean;
  onBack: () => void;
  onDecision: (action: Decision) => void;
  onGeneratePdf: () => void;
}) {
  const pending = displayStatus(invoice.status) === "Pending";

  return (
    <section className="quotation-details-page">
      <button className="text-button back-link" onClick={onBack}>
        <ArrowLeft size={14} /> Back to invoices
      </button>

      {/* Heading */}
      <div className="quotation-detail-heading">
        <div>
          <span className="eyebrow">INVOICE DETAIL · {invoice.id}</span>
          <h1>{project.name}</h1>
          <p>
            {project.client} · {project.owner}
          </p>
        </div>
        <div className="quotation-detail-actions">
          <span className={`quotation-status ${statusKey(invoice.status)}`}>
            {displayStatus(invoice.status)}
          </span>
          <button
            className="button button-secondary"
            onClick={() => window.print()}
          >
            <Printer size={14} /> Print
          </button>
          <button className="button button-secondary" onClick={onGeneratePdf}>
            <Eye size={14} /> Preview PDF
          </button>
          <button className="button button-primary" onClick={onGeneratePdf}>
            <Download size={14} /> Generate PDF
          </button>
        </div>
      </div>

      {/* Content grid */}
      <div className="quotation-detail-grid">
        {/* Left: summary card */}
        <div className="panel quotation-paper-wrap invoice-paper">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">INVOICE SUMMARY</span>
              <h2>{invoice.id}</h2>
              <p>Submitted {invoice.submitted ?? "—"}</p>
            </div>
            <FileText size={18} />
          </div>

          <div className="quotation-details">
            <span>
              Invoice ID<strong>{invoice.id}</strong>
            </span>
            <span>
              Quotation ID<strong>{invoice.quotationId}</strong>
            </span>
            <span>
              Project ID<strong>{invoice.projectId}</strong>
            </span>
            <span>
              Client<strong>{project.client}</strong>
            </span>
            <span>
              Amount<strong>{usd(invoice.amount)}</strong>
            </span>
            <span>
              Payment<strong>{invoice.paymentStatus}</strong>
            </span>
            <span>
              Generation<strong>{invoice.generationStatus}</strong>
            </span>
            <span>
              Submission date<strong>{invoice.submitted ?? "—"}</strong>
            </span>
          </div>

          {/* Linked quotation */}
          <div className="panel invoice-linked-record">
            <span className="eyebrow">LINKED QUOTATION</span>
            <h3>{quotation?.id ?? invoice.quotationId}</h3>
            <p>
              {quotation?.vendor ?? "Quotation record"} · {project.name}
            </p>
          </div>

          {/* Generate PDF call-to-action */}
          <div className="inv-pdf-cta">
            <div>
              <strong>Invoice PDF</strong>
              <small>
                Generate a formatted invoice document for official use.
              </small>
            </div>
            <div className="inv-pdf-cta-btns">
              <button
                className="inv-cta-btn"
                onClick={onGeneratePdf}
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>
              <button
                className="inv-cta-btn inv-cta-btn-primary"
                onClick={onGeneratePdf}
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: workflow panel */}
        <aside className="quotation-side-panel">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">WORKFLOW</span>
                <h2>Approval status</h2>
              </div>
              <Send size={16} />
            </div>
            <div className="approval-route">
              <span className="route-done">Finance prepared</span>
              <span className={pending ? "route-active" : ""}>
                CEO review
              </span>
            </div>
            {canReview && pending && (
              <div className="review-actions">
                <button
                  className="button button-secondary"
                  onClick={() => onDecision("Revision Requested")}
                >
                  Request revision
                </button>
                <button
                  className="button button-primary"
                  onClick={() => onDecision("Approved")}
                >
                  Approve
                </button>
                <button
                  className="button button-danger"
                  onClick={() => onDecision("Rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

// ─── Submit dialog ────────────────────────────────────────────────────────────

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
  const available = projects.find(
    (project) =>
      !invoices.some((invoice) => invoice.projectId === project.id),
  );
  const [projectId, setProjectId] = useState(available?.id ?? "");
  const project = projects.find((item) => item.id === projectId);
  const quotation = quotationSeed.find(
    (item) => item.projectId === projectId,
  );
  return (
    <div className="dialog-backdrop">
      <div className="dialog invoice-submit-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">FINANCE / INVOICES</span>
            <h2>Submit invoice</h2>
            <p>Link the invoice to an existing quotation and project.</p>
          </div>
          <button className="icon-button" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <label className="invoice-submit-field">
          Project
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((item) => (
              <option
                key={item.id}
                value={item.id}
                disabled={invoices.some(
                  (invoice) => invoice.projectId === item.id,
                )}
              >
                {item.id} · {item.client}
              </option>
            ))}
          </select>
        </label>
        <div className="detail-grid">
          <span>
            Quotation
            <strong>{quotation?.id ?? "No quotation available"}</strong>
          </span>
          <span>
            Amount
            <strong>{project ? usd(project.budget) : "—"}</strong>
          </span>
        </div>
        <div className="dialog-actions">
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="button button-primary"
            disabled={!project || !quotation}
            onClick={() => {
              if (!project || !quotation) return;
              onSubmit({
                id: `INV-2026-${String(25 + invoices.length).padStart(3, "0")}`,
                projectId: project.id,
                quotationId: quotation.id,
                project: project.name,
                amount: project.budget,
                submitted: new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                status: "Pending approval",
                generationStatus: "Generated",
                paymentStatus: "Not issued",
              });
            }}
          >
            <Plus size={14} /> Submit invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Decision dialog ──────────────────────────────────────────────────────────

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
    <div className="dialog-backdrop">
      <div className="dialog confirmation-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">INVOICE REVIEW</span>
            <h2>
              {revision ? "Request invoice revision" : "Confirm decision"}
            </h2>
            <p>
              This will{" "}
              {revision ? "request a revision for" : action.toLowerCase()}{" "}
              <strong>{invoice.id}</strong>.
            </p>
          </div>
          <button className="icon-button" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        {revision && (
          <label className="invoice-comment-field">
            <span>
              <MessageSquare size={14} /> Explain the required changes
            </span>
            <textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Add clear guidance for the Finance Department..."
              rows={4}
              autoFocus
            />
          </label>
        )}
        <div className="dialog-actions">
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`button ${
              action === "Rejected" ? "button-danger" : "button-primary"
            }`}
            disabled={revision && !comment.trim()}
            onClick={onConfirm}
          >
            {revision ? "Request revision" : action}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payments sub-page (kept for Payments sidebar route via initialSection) ───

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
  const [filter, setFilter] = useState<
    "All" | "Paid" | "Partially Paid" | "Unpaid"
  >("All");
  const [query, setQuery] = useState("");
  const [recording, setRecording] = useState<Invoice | null>(null);
  const approvedInvoices = invoices.filter(
    (invoice) => invoice.status === "Approved",
  );
  const projectFor = (invoice: Invoice) =>
    projects.find((project) => project.id === invoice.projectId);
  const paymentFor = (invoice: Invoice) =>
    payments.find((payment) => payment.invoiceId === invoice.id);
  const statusFor = (invoice: Invoice) => {
    const paid = paymentFor(invoice)?.amountPaid ?? 0;
    return paid >= invoice.amount
      ? "Paid"
      : paid > 0
      ? "Partially Paid"
      : "Unpaid";
  };
  const rows = approvedInvoices.filter((invoice) => {
    const status = statusFor(invoice);
    const matchesFilter = filter === "All" || filter === status;
    const project = projectFor(invoice);
    const matchesQuery = `${invoice.id} ${invoice.projectId} ${
      invoice.quotationId
    } ${project?.client ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });
  const totals = {
    total: approvedInvoices.length,
    paid: approvedInvoices.filter((i) => statusFor(i) === "Paid").length,
    partial: approvedInvoices.filter(
      (i) => statusFor(i) === "Partially Paid",
    ).length,
    unpaid: approvedInvoices.filter((i) => statusFor(i) === "Unpaid").length,
  };
  const financials = approvedInvoices.reduce(
    (s, invoice) => {
      const amountPaid = paymentFor(invoice)?.amountPaid ?? 0;
      s.total += invoice.amount;
      s.paid += Math.min(amountPaid, invoice.amount);
      return s;
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
      id:
        existing?.id ??
        `PAY-2026-${String(payments.length + 18).padStart(3, "0")}`,
      invoiceId: invoice.id,
      projectId: invoice.projectId,
      quotationId: invoice.quotationId,
      project: invoice.project,
      amount: invoice.amount,
      amountPaid,
      status:
        amountPaid >= invoice.amount
          ? "Paid"
          : amountPaid > 0
          ? "Partially Paid"
          : "Unpaid",
      generationStatus: "—",
      paymentStatus:
        amountPaid >= invoice.amount
          ? "Paid"
          : amountPaid > 0
          ? "Partially Paid"
          : "Unpaid",
    };
    setPayments((current) =>
      existing
        ? current.map((p) => (p.id === existing.id ? next : p))
        : [next, ...current],
    );
    setRecording(null);
  }

  return (
    <div className="payment-management">
      <PageHeader
        eyebrow="FINANCE / PAYMENTS"
        title="Payment progress"
        copy="Track collections for approved invoices linked to their projects and quotations."
      />
      <div className="payment-finance-stats">
        <article className="payment-finance-card payment-finance-card-total">
          <span className="payment-finance-icon">
            <CircleDollarSign size={18} />
          </span>
          <div>
            <small>Total amount</small>
            <strong>{money(financials.total)}</strong>
            <em>{totals.total} approved invoices</em>
          </div>
        </article>
        <article className="payment-finance-card payment-finance-card-paid">
          <span className="payment-finance-icon">
            <WalletCards size={18} />
          </span>
          <div>
            <small>Amount paid</small>
            <strong>{money(financials.paid)}</strong>
            <em>{collectionRate}% collected</em>
          </div>
        </article>
        <article className="payment-finance-card payment-finance-card-remaining">
          <span className="payment-finance-icon">
            <TrendingUp size={18} />
          </span>
          <div>
            <small>Remaining amount</small>
            <strong>{money(remaining)}</strong>
            <em>Outstanding balance</em>
          </div>
        </article>
        <article className="payment-finance-card payment-finance-card-status">
          <span className="payment-finance-icon">
            <FileText size={18} />
          </span>
          <div>
            <small>Payment status</small>
            <strong>
              {totals.paid} / {totals.total}
            </strong>
            <em>{totals.unpaid} awaiting payment</em>
          </div>
        </article>
      </div>
      <div className="payment-dashboard-grid">
        <section className="panel payment-chart-card">
          <div className="payment-panel-heading">
            <div>
              <span className="eyebrow">COLLECTION OVERVIEW</span>
              <h2>Payment collection</h2>
              <p>Paid versus outstanding across approved invoices.</p>
            </div>
            <strong>{collectionRate}%</strong>
          </div>
          <div className="payment-chart-content">
            <div
              className="payment-donut"
              style={{
                background: `conic-gradient(#248d68 ${collectionRate}%, #e8edf5 ${collectionRate}% 100%)`,
              }}
            >
              <div>
                <strong>{collectionRate}%</strong>
                <span>collected</span>
              </div>
            </div>
            <div className="payment-chart-legend">
              <div>
                <span className="payment-legend-dot paid" />
                <span>Amount paid</span>
                <strong>{money(financials.paid)}</strong>
              </div>
              <div>
                <span className="payment-legend-dot remaining" />
                <span>Remaining</span>
                <strong>{money(remaining)}</strong>
              </div>
              <div className="payment-chart-total">
                <span>Total receivable</span>
                <strong>{money(financials.total)}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="payment-invoice-progress">
        <div className="payment-panel-heading">
          <div>
            <span className="eyebrow">RECEIVABLES</span>
            <h2>Invoice payment progress</h2>
            <p>
              Monitor how much has been collected for each approved invoice.
            </p>
          </div>
        </div>
        <div className="payment-progress-list">
          {approvedInvoices.map((invoice) => {
            const amountPaid = Math.min(
              paymentFor(invoice)?.amountPaid ?? 0,
              invoice.amount,
            );
            const progress = invoice.amount
              ? Math.round((amountPaid / invoice.amount) * 100)
              : 0;
            return (
              <div className="payment-progress-item" key={invoice.id}>
                <div>
                  <strong>{invoice.id}</strong>
                  <span>{projectFor(invoice)?.client ?? "—"}</span>
                </div>
                <div className="payment-progress-track">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <strong>{progress}%</strong>
              </div>
            );
          })}
          {!approvedInvoices.length && (
            <p className="payment-empty-chart">
              No approved invoices are available for payment tracking.
            </p>
          )}
        </div>
      </div>
      <div className="quotation-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice, project, quotation, or client..."
          />
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option>All</option>
          <option>Paid</option>
          <option>Partially Paid</option>
          <option>Unpaid</option>
        </select>
      </div>
      <div className="panel quotation-list-panel payment-list-panel">
        <div className="quotation-list-head payment-list-head">
          <span>Invoice</span>
          <span>Project</span>
          <span>Quotation</span>
          <span>Client</span>
          <span>Total amount</span>
          <span>Amount paid</span>
          <span>Remaining balance</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {rows.map((invoice) => {
          const payment = paymentFor(invoice);
          const project = projectFor(invoice);
          const amountPaid = payment?.amountPaid ?? 0;
          const rem = Math.max(0, invoice.amount - amountPaid);
          const status = statusFor(invoice);
          return (
            <div
              className="quotation-list-row payment-list-row"
              key={invoice.id}
            >
              <span>
                <strong className="payment-id">{invoice.id}</strong>
                <small>{invoice.project}</small>
              </span>
              <span className="payment-link">{invoice.projectId}</span>
              <span className="payment-link">{invoice.quotationId}</span>
              <span>
                <strong>{project?.client ?? "—"}</strong>
              </span>
              <strong>{money(invoice.amount)}</strong>
              <strong>{money(amountPaid)}</strong>
              <strong className={rem ? "payment-balance" : ""}>
                {money(rem)}
              </strong>
              <span
                className={`quotation-status payment-${statusKey(status)}`}
              >
                {status}
              </span>
              <span className="quotation-row-actions">
                {canManage && (
                  <button
                    className="text-button"
                    onClick={() => setRecording(invoice)}
                  >
                    Record payment
                  </button>
                )}
              </span>
            </div>
          );
        })}
        {!rows.length && (
          <div className="empty-state">
            <FileText size={30} />
            <h3>No approved invoices found</h3>
            <p>Payment records are shown after an invoice is approved.</p>
          </div>
        )}
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
  const valid =
    Number.isFinite(parsed) && parsed >= 0 && parsed <= invoice.amount;
  return (
    <div className="dialog-backdrop">
      <div className="dialog payment-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">PAYMENT RECORD</span>
            <h2>{invoice.id}</h2>
            <p>
              {invoice.project} · Total {money(invoice.amount)}
            </p>
          </div>
          <button className="icon-button" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <label className="invoice-submit-field">
          Amount paid (USD)
          <input
            type="number"
            min="0"
            max={invoice.amount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <p className="payment-dialog-note">
          Remaining balance:{" "}
          <strong>
            {valid ? money(invoice.amount - parsed) : "Enter a valid amount"}
          </strong>
        </p>
        <div className="dialog-actions">
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="button button-primary"
            disabled={!valid}
            onClick={() => onSave(parsed)}
          >
            Save payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main InvoicePage export ──────────────────────────────────────────────────

export function InvoicePage({
  projects,
  canReview = false,
  canSubmit = false,
  initialSection = "invoices",
  onSubmitted,
  onRevisionRequested,
}: {
  projects: Project[];
  canReview?: boolean;
  canSubmit?: boolean;
  initialSection?: "invoices" | "payments";
  onSubmitted?: (invoice: Invoice, project: Project) => void;
  onRevisionRequested?: (
    invoice: Invoice,
    project: Project,
    comment: string,
  ) => void;
}) {
  const [section, setSection] = useState<"invoices" | "payments">(
    initialSection,
  );
  const [invoices, setInvoices] = useState<Invoice[]>(invoiceSeed);
  const [filter, setFilter] = useState<InvoiceFilter>("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "details">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null);
  const [decision, setDecision] = useState<{
    invoice: Invoice;
    action: Decision;
  } | null>(null);
  const [revisionComment, setRevisionComment] = useState("");

  const projectFor = (invoice: Invoice) =>
    projects.find((p) => p.id === invoice.projectId);
  const quotationFor = (invoice: Invoice): Quotation | undefined =>
    quotationSeed.find((q) => q.id === invoice.quotationId);

  const selected = invoices.find((inv) => inv.id === selectedId);
  const selectedProject = selected ? projectFor(selected) : undefined;

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesFilter =
          filter === "All" || displayStatus(invoice.status) === filter;
        const matchesQuery = `${invoice.id} ${invoice.quotationId} ${
          invoice.projectId
        } ${invoice.project} ${projectFor(invoice)?.client ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [filter, invoices, query],
  );

  const summary = {
    total: invoices.length,
    pending: invoices.filter(
      (inv) => displayStatus(inv.status) === "Pending",
    ).length,
    revisions: invoices.filter(
      (inv) => displayStatus(inv.status) === "Revision Requested",
    ).length,
    approved: invoices.filter(
      (inv) => displayStatus(inv.status) === "Approved",
    ).length,
    rejected: invoices.filter(
      (inv) => displayStatus(inv.status) === "Rejected",
    ).length,
  };

  function openDetails(invoice: Invoice) {
    setSelectedId(invoice.id);
    setView("details");
  }

  function applyDecision(invoice: Invoice, action: Decision, comment = "") {
    const status =
      action === "Revision Requested" ? "Revision requested" : action;
    setInvoices((current) =>
      current.map((item) =>
        item.id === invoice.id ? { ...item, status } : item,
      ),
    );
    if (action === "Revision Requested") {
      const project = projectFor(invoice);
      if (project) onRevisionRequested?.(invoice, project, comment);
    }
    setDecision(null);
    setRevisionComment("");
    setView("list");
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <section className="page-section quotation-management invoice-management">
      {/* Only show the Invoices/Payments tab when used from the Payments sidebar route */}
      {initialSection === "payments" && (
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
      )}

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
                copy="Review, submit and generate invoices linked to their CMCS projects."
                action={canSubmit ? "Submit invoice" : undefined}
                onAction={canSubmit ? () => setShowSubmit(true) : undefined}
              />
              <InvoiceStats summary={summary} />

              {/* Toolbar */}
              <div className="inv-toolbar">
                <label className="inline-search">
                  <Search size={15} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search invoice, quotation, project, or client…"
                  />
                </label>
                <div className="inv-toolbar-filters">
                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value as InvoiceFilter)
                    }
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Revision Requested">
                      Revision Requested
                    </option>
                  </select>
                </div>
              </div>

              <InvoiceList
                invoices={filteredInvoices}
                projectFor={projectFor}
                quotationFor={quotationFor}
                canSubmit={canSubmit}
                onOpen={openDetails}
                onGeneratePdf={(invoice) => setPdfInvoice(invoice)}
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
              onDecision={(action) => {
                setRevisionComment("");
                setDecision({ invoice: selected, action });
              }}
              onGeneratePdf={() => setPdfInvoice(selected)}
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
                applyDecision(
                  decision.invoice,
                  decision.action,
                  revisionComment,
                )
              }
            />
          )}
        </>
      )}

      {/* PDF preview modal — rendered outside the section flow */}
      {pdfInvoice && (() => {
        const proj = projectFor(pdfInvoice);
        if (!proj) return null;
        return (
          <InvoicePdfModal
            invoice={pdfInvoice}
            project={proj}
            quotation={quotationFor(pdfInvoice)}
            onClose={() => setPdfInvoice(null)}
          />
        );
      })()}
    </section>
  );
}
