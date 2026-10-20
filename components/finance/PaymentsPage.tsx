"use client";

import { useState } from "react";
import {
  CircleDollarSign,
  FileText,
  Search,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { Invoice, Payment, Project } from "../../lib/types";
import { invoiceSeed, money, paymentSeed } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";

// ─── helpers ──────────────────────────────────────────────────────────────────

const statusKey = (s: string) => s.toLowerCase().replaceAll(" ", "-");

// ─── Record-payment dialog ────────────────────────────────────────────────────

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
          <button className="icon-button" onClick={onCancel} aria-label="Close">
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
            {valid
              ? money(invoice.amount - parsed)
              : "Enter a valid amount"}
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

// ─── Main PaymentsPage ────────────────────────────────────────────────────────

export function PaymentsPage({
  projects,
  canManage = false,
}: {
  projects: Project[];
  canManage?: boolean;
}) {
  // Use invoiceSeed as the source of truth — same data InvoicePage uses
  const [invoices] = useState<Invoice[]>(invoiceSeed);
  const [payments, setPayments] = useState<Payment[]>(paymentSeed);
  const [filter, setFilter] = useState<
    "All" | "Paid" | "Partially Paid" | "Unpaid"
  >("All");
  const [query, setQuery] = useState("");
  const [recording, setRecording] = useState<Invoice | null>(null);

  // Only approved invoices are eligible for payment tracking
  const approvedInvoices = invoices.filter(
    (inv) => inv.status === "Approved",
  );

  const projectFor = (inv: Invoice) =>
    projects.find((p) => p.id === inv.projectId);

  const paymentFor = (inv: Invoice) =>
    payments.find((p) => p.invoiceId === inv.id);

  const statusFor = (inv: Invoice) => {
    const paid = paymentFor(inv)?.amountPaid ?? 0;
    return paid >= inv.amount
      ? "Paid"
      : paid > 0
      ? "Partially Paid"
      : "Unpaid";
  };

  // Filtered rows for the table
  const rows = approvedInvoices.filter((inv) => {
    const status = statusFor(inv);
    const matchesFilter = filter === "All" || filter === status;
    const proj = projectFor(inv);
    const matchesQuery = `${inv.id} ${inv.projectId} ${inv.quotationId} ${
      proj?.client ?? ""
    } ${proj?.name ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  // Summary totals
  const totals = {
    total: approvedInvoices.length,
    paid: approvedInvoices.filter((i) => statusFor(i) === "Paid").length,
    partial: approvedInvoices.filter(
      (i) => statusFor(i) === "Partially Paid",
    ).length,
    unpaid: approvedInvoices.filter((i) => statusFor(i) === "Unpaid")
      .length,
  };

  const financials = approvedInvoices.reduce(
    (s, inv) => {
      const amountPaid = paymentFor(inv)?.amountPaid ?? 0;
      s.total += inv.amount;
      s.paid += Math.min(amountPaid, inv.amount);
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
        title="Payment tracking"
        copy="Track collections for approved invoices linked to their projects and quotations."
      />

      {/* ── Summary cards ── */}
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

      {/* ── Collection donut chart ── */}
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

      {/* ── Progress bars per invoice ── */}
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
          {approvedInvoices.map((inv) => {
            const amountPaid = Math.min(
              paymentFor(inv)?.amountPaid ?? 0,
              inv.amount,
            );
            const progress = inv.amount
              ? Math.round((amountPaid / inv.amount) * 100)
              : 0;
            return (
              <div className="payment-progress-item" key={inv.id}>
                <div>
                  <strong>{inv.id}</strong>
                  <span>{projectFor(inv)?.client ?? "—"}</span>
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

      {/* ── Search + filter toolbar ── */}
      <div className="quotation-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice, project, quotation, or client…"
          />
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="All">All statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {/* ── Payment table ── */}
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

        {rows.map((inv) => {
          const payment = paymentFor(inv);
          const proj = projectFor(inv);
          const amountPaid = payment?.amountPaid ?? 0;
          const rem = Math.max(0, inv.amount - amountPaid);
          const status = statusFor(inv);
          return (
            <div
              className="quotation-list-row payment-list-row"
              key={inv.id}
            >
              <span>
                <strong className="payment-id">{inv.id}</strong>
                <small>{inv.project}</small>
              </span>
              <span className="payment-link">{inv.projectId}</span>
              <span className="payment-link">{inv.quotationId}</span>
              <span>
                <strong>{proj?.client ?? "—"}</strong>
              </span>
              <strong>{money(inv.amount)}</strong>
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
                    onClick={() => setRecording(inv)}
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

      {/* ── Record-payment dialog ── */}
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
