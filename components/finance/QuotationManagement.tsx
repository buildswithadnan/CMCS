"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileText,
  Plus,
  Printer,
  Search,
  Send,
  Trash2,
  X,
  FilePlus,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Project,
  Quotation,
  QuotationHistory,
  QuotationItem,
} from "../../lib/types";
import { quotationSeed } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";

// ─── types ────────────────────────────────────────────────────────────────────

type View = "list" | "details" | "form";
type Filter =
  | "All"
  | "Draft"
  | "Pending approval"
  | "Approved"
  | "Rejected"
  | "Revision requested"
  | "Review Changes";

// ─── helpers ─────────────────────────────────────────────────────────────────

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const usd = (value: number) =>
  "$" +
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function itemTemplate(index = 1): QuotationItem {
  return {
    id: `q-item-${Date.now()}-${index}-${Math.random()}`,
    itemNo: String(index),
    category: "Production",
    subcategory: "Equipment",
    description: "",
    quantity: 1,
    days: 1,
    unitPrice: 0,
    taxRate: 0,
  };
}

function enrich(quotation: Quotation): Quotation {
  const items = quotation.items?.length
    ? quotation.items.map((item, index) => ({
        ...item,
        itemNo: item.itemNo ?? String(index + 1),
        category: item.category ?? "Production",
        subcategory: item.subcategory ?? "Equipment",
        days: item.days ?? 1,
      }))
    : [itemTemplate()];
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.days * item.unitPrice,
    0,
  );
  const discount = quotation.discount ?? 0;
  const discountAmount =
    quotation.discountType === "percentage"
      ? subtotal * (discount / 100)
      : discount;
  const mediaRights = quotation.mediaRights ?? 0;
  const total = Math.max(0, subtotal - discountAmount + mediaRights);
  return {
    ...quotation,
    quotationDate: quotation.quotationDate ?? quotation.submitted,
    validity: quotation.validity ?? "One Month",
    customerDetails: quotation.customerDetails ?? "N/A",
    contactPerson: quotation.contactPerson ?? "N/A",
    paymentTerm: quotation.paymentTerm ?? "50% advance, 50% on delivery",
    deliveryTime: quotation.deliveryTime ?? "As scheduled",
    warranty: quotation.warranty ?? "N/A",
    items,
    subtotal,
    discount: discountAmount,
    mediaRights,
    total,
    history: quotation.history ?? [
      {
        status: quotation.status,
        date: quotation.submitted,
        actor: quotation.submittedBy,
      },
    ],
  };
}

function makeQuotation(project: Project, index: number): Quotation {
  return enrich({
    id: `QTN-2026-${String(20 + index).padStart(3, "0")}`,
    projectId: project.id,
    project: project.name,
    vendor: "Chinar TV",
    amount: project.budget,
    submittedBy: "Farid Ahmad",
    submitted: "12 Oct 2026",
    status: "Draft",
    customerDetails: project.client,
    contactPerson: "N/A",
    items: [itemTemplate()],
    submittedTo: ["ceo", "hoo"],
  });
}

// ─── Status pill ─────────────────────────────────────────────────────────────

function StatusPill({
  status,
  reviewChangesLabel = false,
}: {
  status: string;
  reviewChangesLabel?: boolean;
}) {
  const label =
    reviewChangesLabel && status === "Revision requested"
      ? "Review Changes"
      : status;
  return (
    <span
      className={
        "quotation-status " + status.toLowerCase().replaceAll(" ", "-")
      }
    >
      {label}
    </span>
  );
}

// ─── Stats row ───────────────────────────────────────────────────────────────

function QuotationStats({ quotations }: { quotations: Quotation[] }) {
  const total = quotations.reduce(
    (sum, q) => sum + (q.total ?? 0),
    0,
  );
  const pending = quotations.filter((q) => q.status === "Pending approval").length;
  const revisions = quotations.filter((q) => q.status === "Revision requested").length;
  const approved = quotations.filter((q) => q.status === "Approved").length;

  return (
    <div className="qtn-stats-row">
      <article className="qtn-stat-card">
        <div className="qtn-stat-icon qtn-stat-icon-blue">
          <FileText size={16} />
        </div>
        <div>
          <span>Total quotations</span>
          <strong>{quotations.length}</strong>
          <small>Across active projects</small>
        </div>
      </article>
      <article className="qtn-stat-card">
        <div className="qtn-stat-icon qtn-stat-icon-amber">
          <Clock size={16} />
        </div>
        <div>
          <span>Pending review</span>
          <strong>{pending}</strong>
          <small>CEO &amp; HOO actions required</small>
        </div>
      </article>
      <article className="qtn-stat-card">
        <div className="qtn-stat-icon qtn-stat-icon-red">
          <AlertCircle size={16} />
        </div>
        <div>
          <span>Revision requests</span>
          <strong>{revisions}</strong>
          <small>Need finance updates</small>
        </div>
      </article>
      <article className="qtn-stat-card">
        <div className="qtn-stat-icon qtn-stat-icon-purple">
          <TrendingUp size={16} />
        </div>
        <div>
          <span>Quoted value</span>
          <strong>{usd(total)}</strong>
          <small>{approved} approved</small>
        </div>
      </article>
    </div>
  );
}

// ─── List table ───────────────────────────────────────────────────────────────

function QuotationList({
  quotations,
  visibleProjects,
  onOpen,
  onEdit,
  onCreate,
  reviewChangesLabel,
  reviewOnly,
}: {
  quotations: Quotation[];
  visibleProjects: Project[];
  onOpen: (q: Quotation) => void;
  onEdit: (q: Quotation) => void;
  onCreate: (p: Project) => void;
  reviewChangesLabel: boolean;
  reviewOnly: boolean;
}) {
  return (
    <div className="panel qtn-list-panel">
      {/* Table header */}
      <div className="qtn-list-head">
        <span>Quotation</span>
        <span>Customer / project</span>
        <span>Date</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      {visibleProjects.map((project) => {
        const quotation = quotations.find(
          (item) => item.projectId === project.id,
        );
        return (
          <div className="qtn-list-row" key={project.id}>
            {/* ID cell */}
            <button
              className="qtn-id-btn"
              onClick={() => quotation && onOpen(quotation)}
              disabled={!quotation}
            >
              <span className="qtn-id-icon">
                <FileText size={14} />
              </span>
              <span>
                <strong>{quotation?.id ?? "No quotation"}</strong>
                <small>{project.id}</small>
              </span>
            </button>

            {/* Customer / project */}
            <span className="qtn-client-cell">
              <strong>{project.client}</strong>
              <small>{project.name}</small>
            </span>

            {/* Date */}
            <span className="qtn-date-cell">
              {quotation?.quotationDate ?? (
                <em className="qtn-not-created">Not created</em>
              )}
            </span>

            {/* Amount */}
            <span className="qtn-amount-cell">
              {quotation ? usd(quotation.total ?? 0) : "—"}
            </span>

            {/* Status */}
            {quotation ? (
              <StatusPill
                status={quotation.status}
                reviewChangesLabel={reviewChangesLabel}
              />
            ) : (
              <StatusPill status="Not created" />
            )}

            {/* Actions */}
            <span className="qtn-row-actions">
              {quotation ? (
                <>
                  <button
                    className="qtn-action-btn qtn-action-btn-ghost"
                    onClick={() => onOpen(quotation)}
                  >
                    Open <ArrowUpRight size={12} />
                  </button>
                  {!reviewOnly && quotation.status !== "Approved" && (
                    <button
                      className="qtn-action-btn qtn-action-btn-icon"
                      onClick={() => onEdit(quotation)}
                      aria-label={`Edit ${quotation.id}`}
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}
                </>
              ) : !reviewOnly ? (
                <button
                  className="qtn-action-btn qtn-action-btn-create"
                  onClick={() => onCreate(project)}
                >
                  <Plus size={12} /> Create
                </button>
              ) : (
                <span className="qtn-na">—</span>
              )}
            </span>
          </div>
        );
      })}

      {!visibleProjects.length && (
        <div className="empty-state">
          <FileText size={30} />
          <h3>No quotations found</h3>
          <p>Try a different filter or search term.</p>
        </div>
      )}
    </div>
  );
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────

function ConfirmationDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const label =
    action === "approve"
      ? "approve"
      : action === "reject"
      ? "reject"
      : "request a revision for";
  return (
    <div className="dialog-backdrop">
      <div className="dialog confirmation-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">CONFIRM ACTION</span>
            <h2>Are you sure?</h2>
          </div>
          <button className="icon-button" onClick={onCancel}>
            <X size={17} />
          </button>
        </div>
        <p>This will {label} this quotation and update its approval history.</p>
        <div className="dialog-actions">
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Quotation details view ───────────────────────────────────────────────────

function QuotationDetails({
  quotation,
  project,
  onBack,
  onEdit,
  onPrint,
  onDecide,
  reviewChangesLabel,
  reviewOnly,
}: {
  quotation: Quotation;
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onDecide: (
    status: "Approved" | "Rejected" | "Revision requested",
    comment: string,
  ) => void;
  reviewChangesLabel: boolean;
  reviewOnly: boolean;
}) {
  const [comment, setComment] = useState("");
  const [confirm, setConfirm] = useState<
    "approve" | "reject" | "revision" | null
  >(null);
  const canReview = quotation.status === "Pending approval";

  return (
    <section className="quotation-details-page">
      {/* Back link */}
      <button className="text-button back-link" onClick={onBack}>
        <ArrowLeft size={14} /> Back to quotations
      </button>

      {/* Heading */}
      <div className="quotation-detail-heading">
        <div>
          <span className="eyebrow">
            QUOTATION DETAIL · {quotation.id}
          </span>
          <h1>{quotation.project}</h1>
          <p>
            {project.client} · {project.owner}
          </p>
        </div>
        <div className="quotation-detail-actions">
          <StatusPill
            status={quotation.status}
            reviewChangesLabel={reviewChangesLabel}
          />
          <button className="button button-secondary" onClick={onPrint}>
            <Printer size={14} /> Print / PDF
          </button>
          {!reviewOnly && quotation.status !== "Approved" && (
            <button className="button button-primary" onClick={onEdit}>
              Edit quotation
            </button>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="quotation-detail-grid">
        <div className="quotation-paper-wrap">
          <QuotationPreview quotation={quotation} project={project} />
        </div>

        <aside className="quotation-side-panel">
          {/* Workflow panel */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">WORKFLOW</span>
                <h2>Approval status</h2>
              </div>
              <Send size={16} />
            </div>
            <div className="approval-route">
              <span className="route-done">
                <Check size={12} /> Finance prepared
              </span>
              <span className={canReview ? "route-active" : ""}>
                CEO review
              </span>
              <span className={canReview ? "route-active" : ""}>
                HOO review
              </span>
            </div>
            {canReview && (
              <>
                <label className="review-comment">
                  Review comment
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add approval or revision notes..."
                  />
                </label>
                <div className="review-actions">
                  <button
                    className="button button-secondary"
                    onClick={() => setConfirm("revision")}
                  >
                    Request revision
                  </button>
                  <button
                    className="button button-primary"
                    onClick={() => setConfirm("approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="button button-danger"
                    onClick={() => setConfirm("reject")}
                  >
                    Reject
                  </button>
                </div>
              </>
            )}
            {quotation.revisionRequest && (
              <div className="revision-request">
                <strong>Revision requested</strong>
                <p>{quotation.revisionRequest}</p>
              </div>
            )}
          </div>

          {/* Audit trail */}
          <div className="panel quotation-history-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">AUDIT TRAIL</span>
                <h2>Quotation history</h2>
              </div>
            </div>
            {(quotation.history ?? [])
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  className="quotation-history-entry"
                  key={`${entry.date}-${index}`}
                >
                  <i />
                  <span>
                    <strong>{entry.status}</strong>
                    <small>
                      {entry.date} · {entry.actor}
                    </small>
                    {entry.note && <em>{entry.note}</em>}
                  </span>
                </div>
              ))}
          </div>
        </aside>
      </div>

      {confirm && (
        <ConfirmationDialog
          action={confirm}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            onDecide(
              confirm === "approve"
                ? "Approved"
                : confirm === "reject"
                ? "Rejected"
                : "Revision requested",
              comment,
            );
            setConfirm(null);
          }}
        />
      )}
    </section>
  );
}

// ─── Quotation form ───────────────────────────────────────────────────────────

function QuotationForm({
  quotation,
  project,
  onBack,
  onUpdate,
  onSave,
  onSubmit,
}: {
  quotation: Quotation;
  project: Project;
  onBack: () => void;
  onUpdate: (q: Quotation) => void;
  onSave: (q: Quotation) => void;
  onSubmit: (q: Quotation) => void;
}) {
  const [customNumber, setCustomNumber] = useState(false);
  const [error, setError] = useState("");
  const items = quotation.items ?? [];
  const update = (changes: Partial<Quotation>) =>
    onUpdate({ ...quotation, ...changes });
  const updateItem = (id: string, changes: Partial<QuotationItem>) =>
    update({
      items: items.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !quotation.projectId ||
      !quotation.quotationDate ||
      !quotation.validity ||
      !quotation.customerDetails?.trim()
    ) {
      setError(
        "Complete quotation number, date, validity, and customer details.",
      );
      return;
    }
    setError("");
    onSubmit(enrich(quotation));
  }

  return (
    <section className="quotation-form-page">
      <button className="text-button back-link" onClick={onBack}>
        <ArrowLeft size={14} /> Back to quotations
      </button>
      <form onSubmit={submit}>
        <div className="quotation-form-heading">
          <div>
            <span className="eyebrow">FINANCE / QUOTATION BUILDER</span>
            <h1>{quotation.id}</h1>
            <p>Build a Chinar TV quotation for {project.name}.</p>
          </div>
          <div className="quotation-form-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => onSave(enrich(quotation))}
            >
              Save draft
            </button>
            <button type="submit" className="button button-primary">
              <Send size={14} /> Submit for approval
            </button>
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="quotation-form-grid">
          <section className="panel quotation-form-card">
            <div className="form-section-title">
              <FileText size={16} />
              <h2>Quotation information</h2>
            </div>
            <div className="quotation-fields">
              <label>
                Quotation Number
                <input
                  value={quotation.id}
                  disabled={!customNumber}
                  onChange={(e) =>
                    update({ id: e.target.value.toUpperCase() })
                  }
                />
                <small>
                  <input
                    type="checkbox"
                    checked={customNumber}
                    onChange={(e) => setCustomNumber(e.target.checked)}
                  />{" "}
                  Customize quotation number
                </small>
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={quotation.quotationDate ?? ""}
                  onChange={(e) => update({ quotationDate: e.target.value })}
                />
              </label>
              <label>
                Validity
                <input
                  value={quotation.validity ?? ""}
                  onChange={(e) => update({ validity: e.target.value })}
                  placeholder="One Month"
                />
              </label>
              <label>
                Project Name
                <input
                  value={quotation.project}
                  onChange={(e) => update({ project: e.target.value })}
                />
              </label>
              <label className="field-span-2">
                Customer Details
                <textarea
                  value={quotation.customerDetails ?? ""}
                  onChange={(e) =>
                    update({ customerDetails: e.target.value })
                  }
                />
              </label>
              <label>
                Contact Person
                <input
                  value={quotation.contactPerson ?? ""}
                  onChange={(e) =>
                    update({ contactPerson: e.target.value })
                  }
                />
              </label>
              <label>
                Prepared By
                <input
                  value={quotation.submittedBy}
                  onChange={(e) =>
                    update({ submittedBy: e.target.value })
                  }
                />
              </label>
              <label>
                Payment Term
                <input
                  value={quotation.paymentTerm ?? ""}
                  onChange={(e) => update({ paymentTerm: e.target.value })}
                />
              </label>
              <label>
                Delivery Time
                <input
                  value={quotation.deliveryTime ?? ""}
                  onChange={(e) =>
                    update({ deliveryTime: e.target.value })
                  }
                />
              </label>
              <label>
                Warranty
                <input
                  value={quotation.warranty ?? ""}
                  onChange={(e) => update({ warranty: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section className="panel quotation-form-card">
            <div className="form-section-title">
              <FileText size={16} />
              <h2>Financial summary</h2>
            </div>
            <div className="quotation-summary-form">
              <span>
                Subtotal
                <strong>{usd(quotation.subtotal ?? 0)}</strong>
              </span>
              <label>
                Discount
                <input
                  type="number"
                  min="0"
                  value={quotation.discount ?? 0}
                  onChange={(e) =>
                    update({ discount: Number(e.target.value) || 0 })
                  }
                />
              </label>
              <select
                value={quotation.discountType ?? "fixed"}
                onChange={(e) =>
                  update({
                    discountType: e.target.value as "fixed" | "percentage",
                  })
                }
              >
                <option value="fixed">USD fixed</option>
                <option value="percentage">Percentage</option>
              </select>
              <label>
                Media Rights
                <input
                  type="number"
                  min="0"
                  value={quotation.mediaRights ?? 0}
                  onChange={(e) =>
                    update({ mediaRights: Number(e.target.value) || 0 })
                  }
                />
              </label>
              <div className="grand-total-field">
                Grand Total
                <strong>{usd(quotation.total ?? 0)}</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="panel quotation-items-card">
          <div className="form-section-title">
            <FileText size={16} />
            <div>
              <h2>Quotation items</h2>
              <p>Rates are in USD and calculated per day.</p>
            </div>
            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                update({ items: [...items, itemTemplate(items.length + 1)] })
              }
            >
              <Plus size={14} /> Add item
            </button>
          </div>
          <div className="quotation-items-scroll">
            <table className="quotation-items-table">
              <thead>
                <tr>
                  <th>Item No.</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Days</th>
                  <th>Unit Price (USD)</th>
                  <th>Total Price (USD)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        value={item.itemNo ?? String(index + 1)}
                        onChange={(e) =>
                          updateItem(item.id, { itemNo: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        value={item.category ?? ""}
                        onChange={(e) =>
                          updateItem(item.id, { category: e.target.value })
                        }
                        placeholder="Production"
                      />
                    </td>
                    <td>
                      <input
                        value={item.subcategory ?? ""}
                        onChange={(e) =>
                          updateItem(item.id, {
                            subcategory: e.target.value,
                          })
                        }
                        placeholder="Equipment"
                      />
                    </td>
                    <td>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Item description"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, {
                            quantity: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.days}
                        onChange={(e) =>
                          updateItem(item.id, {
                            days: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, {
                            unitPrice: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td>
                      <strong>
                        {usd(item.quantity * item.days * item.unitPrice)}
                      </strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="icon-button delete-item"
                        onClick={() =>
                          update({
                            items: items.filter((e) => e.id !== item.id),
                          })
                        }
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="quotation-form-footer">
          <p>Note: The above rates correspond to the cost for one day.</p>
          <div className="quotation-form-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onBack}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => onSave(enrich(quotation))}
            >
              Save draft
            </button>
            <button type="submit" className="button button-primary">
              <Send size={14} /> Submit for approval
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

// ─── PDF preview ──────────────────────────────────────────────────────────────

function QuotationPreview({
  quotation,
  project,
}: {
  quotation: Quotation;
  project: Project;
}) {
  const items = quotation.items ?? [];
  return (
    <article className="quotation-paper">
      <header className="quotation-paper-header">
        <div className="quotation-logo">
          <img src="/assets/chinar-logo.png" alt="Chinar TV" />
        </div>
        <div className="quotation-number-box">
          <h2>Quotation</h2>
          <p>
            No: <strong>{quotation.id}</strong>
          </p>
          <p>
            Date: <strong>{quotation.quotationDate}</strong>
          </p>
          <p>
            Validity: <strong>{quotation.validity}</strong>
          </p>
        </div>
      </header>
      <div className="quotation-paper-customer">
        <div>
          <b>Customer Details:</b>
          <span>{quotation.customerDetails}</span>
        </div>
        <div>
          <b>Contact Person:</b>
          <span>{quotation.contactPerson}</span>
        </div>
        <div>
          <b>Project:</b>
          <span>{quotation.project || project.name}</span>
        </div>
      </div>
      <div className="quotation-paper-terms">
        <div>
          <b>Payment Term:</b>
          <span>{quotation.paymentTerm}</span>
        </div>
        <div>
          <b>Delivery Time:</b>
          <span>{quotation.deliveryTime}</span>
        </div>
        <div>
          <b>Warranty:</b>
          <span>{quotation.warranty}</span>
        </div>
        <div>
          <b>Prepared by:</b>
          <span>{quotation.submittedBy}</span>
        </div>
      </div>
      <table className="quotation-paper-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category / Subcategory</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Days</th>
            <th>Unit Price (in USD)</th>
            <th>Total Price (in USD)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td>{item.itemNo ?? index + 1}</td>
              <td>
                {item.category}
                <br />
                {item.subcategory}
              </td>
              <td>{item.description || "—"}</td>
              <td>{item.quantity}</td>
              <td>{item.days}</td>
              <td>{usd(item.unitPrice)}</td>
              <td>{usd(item.quantity * item.days * item.unitPrice)}</td>
            </tr>
          ))}
          <tr className="quotation-paper-summary">
            <td colSpan={5} rowSpan={4}>
              Note:{" "}
              {quotation.notes ||
                "The above rates correspond to the cost for one day."}
            </td>
            <td>SubTotal</td>
            <td>{usd(quotation.subtotal ?? 0)}</td>
          </tr>
          <tr className="quotation-paper-summary">
            <td>Discount</td>
            <td>{usd(quotation.discount ?? 0)}</td>
          </tr>
          <tr className="quotation-paper-summary">
            <td>Media Rights</td>
            <td>{usd(quotation.mediaRights ?? 0)}</td>
          </tr>
          <tr className="quotation-paper-summary grand">
            <td>Grand Total</td>
            <td>{usd(quotation.total ?? 0)}</td>
          </tr>
        </tbody>
      </table>
      <footer>
        Add: House# 6, 3rd Street, Kolola Pushta, District 4, Kabul,
        Afghanistan.
        <br />
        Tel: +93 799 491112 &nbsp; Email: info@chinar.tv, www.chinar.tv
      </footer>
    </article>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QuotationManagement({
  projects,
  onNotify,
  onQuotationSubmitted,
  initialProjectId,
  reviewChangesLabel = false,
  reviewOnly = false,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
  onQuotationSubmitted?: (quotation: Quotation, project: Project) => void;
  initialProjectId?: string | null;
  reviewChangesLabel?: boolean;
  reviewOnly?: boolean;
}) {
  const [quotations, setQuotations] = useState<Quotation[]>(() =>
    projects.flatMap((project) => {
      const seed = quotationSeed.find(
        (q) => q.projectId === project.id,
      );
      return seed ? [enrich({ ...seed })] : [];
    }),
  );
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const selected = quotations.find((q) => q.id === selectedId);
  const selectedProject = projects.find(
    (p) => p.id === selected?.projectId,
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const quotation = quotations.find(
          (item) => item.projectId === project.id,
        );
        const matchesFilter =
          filter === "All" ||
          (quotation
            ? quotation.status ===
              (filter === "Review Changes" ? "Revision requested" : filter)
            : filter === "Draft");
        const matchesQuery = `${quotation?.id ?? ""} ${project.name} ${project.client} ${project.id}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [projects, quotations, filter, query],
  );

  function flash(message: string) {
    setNotice(message);
    onNotify(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function openDetails(quotation: Quotation) {
    setSelectedId(quotation.id);
    setView("details");
  }

  useEffect(() => {
    if (!initialProjectId) return;
    const quotation = quotations.find(
      (item) => item.projectId === initialProjectId,
    );
    const project = projects.find((item) => item.id === initialProjectId);
    if (quotation) openDetails(quotation);
    else if (project && !reviewOnly) openForm(undefined, project);
  }, [initialProjectId]);

  function openForm(quotation?: Quotation, projectForNew?: Project) {
    if (quotation) {
      setSelectedId(quotation.id);
    } else {
      const project =
        projectForNew ??
        projects.find(
          (item) => !quotations.some((q) => q.projectId === item.id),
        );
      if (!project) return;
      const draft = makeQuotation(project, quotations.length + 1);
      setQuotations((current) => [draft, ...current]);
      setSelectedId(draft.id);
    }
    setView("form");
  }

  function updateQuotation(updated: Quotation) {
    setQuotations((current) =>
      current.map((q) => (q.id === updated.id ? enrich(updated) : q)),
    );
  }

  function saveDraft(updated: Quotation) {
    updateQuotation({
      ...updated,
      status: "Draft",
      history: [
        ...(updated.history ?? []),
        {
          status: "Draft",
          date: today(),
          actor: "Farid Ahmad",
          note: "Draft saved",
        },
      ],
    });
    flash(`${updated.id} draft saved.`);
    setView("list");
  }

  function submit(updated: Quotation) {
    if (
      updated.items?.some(
        (item) =>
          !item.description.trim() ||
          item.quantity <= 0 ||
          item.days <= 0 ||
          item.unitPrice < 0,
      )
    ) {
      flash("Complete every quotation item before submitting.");
      return;
    }
    updateQuotation({
      ...updated,
      status: "Pending approval",
      submitted: today(),
      submittedTo: ["ceo", "hoo"],
      history: [
        ...(updated.history ?? []),
        {
          status: "Pending approval",
          date: today(),
          actor: "Farid Ahmad",
          note: "Routed to CEO and Head of Operations",
        },
      ],
    });
    const project = projects.find((item) => item.id === updated.projectId);
    if (project) onQuotationSubmitted?.(updated, project);
    flash(`${updated.id} submitted to CEO and Head of Operations.`);
    setView("list");
  }

  function decide(
    status: "Approved" | "Rejected" | "Revision requested",
    comment: string,
  ) {
    if (!selected) return;
    updateQuotation({
      ...selected,
      status,
      revisionRequest:
        status === "Revision requested" ? comment : undefined,
      history: [
        ...(selected.history ?? []),
        { status, date: today(), actor: "Review team", note: comment },
      ],
    });
    flash(`${selected.id} marked ${status.toLowerCase()}.`);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="page-section quotation-management">
      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <>
          <PageHeader
            eyebrow="FINANCE / QUOTATIONS"
            title="Quotation management"
            copy="Prepare, preview, and route Chinar TV quotations through approval."
            action={reviewOnly ? undefined : "Create quotation"}
            onAction={reviewOnly ? undefined : () => openForm()}
          />

          <QuotationStats quotations={quotations} />

          {/* Toolbar */}
          <div className="qtn-toolbar">
            <label className="inline-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quotation ID, project, or client…"
              />
            </label>
            <div className="qtn-toolbar-filters">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
              >
                <option value="All">All statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending approval">Pending approval</option>
                <option value={reviewChangesLabel ? "Review Changes" : "Revision requested"}>
                  {reviewChangesLabel ? "Review Changes" : "Revision requested"}
                </option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <QuotationList
            quotations={quotations}
            visibleProjects={filteredProjects}
            onOpen={openDetails}
            onEdit={(q) => openForm(q)}
            onCreate={(p) => openForm(undefined, p)}
            reviewChangesLabel={reviewChangesLabel}
            reviewOnly={reviewOnly}
          />
        </>
      )}

      {/* ── DETAILS VIEW ── */}
      {view === "details" && selected && selectedProject && (
        <QuotationDetails
          quotation={selected}
          project={selectedProject}
          onBack={() => setView("list")}
          onEdit={() => openForm(selected)}
          onPrint={() => window.print()}
          onDecide={decide}
          reviewChangesLabel={reviewChangesLabel}
          reviewOnly={reviewOnly}
        />
      )}

      {/* ── FORM VIEW ── */}
      {view === "form" && selected && selectedProject && (
        <QuotationForm
          quotation={selected}
          project={selectedProject}
          onBack={() => setView("list")}
          onUpdate={updateQuotation}
          onSave={saveDraft}
          onSubmit={submit}
        />
      )}

      {notice && <div className="toast">{notice}</div>}
    </section>
  );
}
