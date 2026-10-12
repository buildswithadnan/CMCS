"use client";

import React, { useState } from "react";
import { ArrowUpRight, Search, Wallet, X } from "lucide-react";
import { Project } from "../../lib/types";
import { invoiceSeed, money, paymentSeed } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";

export function FinancePage({
  projects,
  onNotify,
}: {
  projects: Project[];
  onNotify: (s: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState(invoiceSeed);
  const [payments, setPayments] = useState(paymentSeed);
  const [selected, setSelected] = useState<string | null>(null);

  const records = [
    ...invoices.map((invoice) => ({ ...invoice, type: "Invoice" as const })),
    ...payments.map((payment) => ({ ...payment, type: "Payment" as const })),
  ].filter((record) => {
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;
    const matchesType = typeFilter === "All" || record.type === typeFilter;
    const matchesSearch = `${record.id} ${record.projectId} ${record.project}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const selectedRecord = records.find((record) => record.id === selected);

  function generateInvoice(invoiceId: string) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, generationStatus: "Generated" }
          : invoice,
      ),
    );
    onNotify(`${invoiceId} marked as generated.`);
  }

  function markPaid(invoiceId: string) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, paymentStatus: "Paid" }
          : invoice,
      ),
    );
    setPayments((current) =>
      current.map((payment) =>
        payment.id === invoiceId
          ? { ...payment, status: "Paid", paymentStatus: "Paid" }
          : payment,
      ),
    );
    onNotify(`${invoiceId} marked as paid.`);
  }

  function updatePaymentStatus(paymentId: string) {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId
          ? { ...payment, status: "Paid", paymentStatus: "Paid" }
          : payment,
      ),
    );
    onNotify(`${paymentId} marked as paid.`);
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="FINANCE / WORKSPACE"
        title="Finance"
        copy="Track project invoices, payments and linked financial records."
        action="Create request"
        onAction={() => onNotify("Finance request form opened")}
      />
      <div className="filter-bar">
        <label className="custom-filter">
          Record type
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All</option>
            <option>Invoice</option>
            <option>Payment</option>
          </select>
        </label>
        <label className="custom-filter">
          Approval status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Pending approval</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Unpaid</option>
            <option>Paid</option>
          </select>
        </label>
        <label className="inline-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project ID or record..."
          />
        </label>
      </div>
      <div className="panel">
        <div className="list-heading">
          <span>Record</span>
          <span>Project</span>
          <span>Quotation</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {records.map((record) => (
          <div className="list-row" key={`${record.type}-${record.id}`}>
            <strong>
              {record.id}
              <small>{record.type}</small>
            </strong>
            <span>
              {record.projectId}
              <small>{record.project}</small>
            </span>
            <span>
              {record.quotationId}
              <small>{record.paymentStatus}</small>
            </span>
            <span className={"status-pill " + record.status.toLowerCase().replaceAll(" ", "-")}>
              {record.status}
            </span>
            <button className="text-button" onClick={() => setSelected(record.id)}>
              Review <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
        {!records.length && (
          <div className="empty-state">
            <Wallet size={28} />
            <h3>No financial records found</h3>
            <p>Adjust the status, type or search filters.</p>
          </div>
        )}
      </div>
      {selectedRecord && (
        <div className="panel finance-detail-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{selectedRecord.type} · {selectedRecord.id}</span>
              <h2>{selectedRecord.project}</h2>
              <p>Linked Project ID: {selectedRecord.projectId}</p>
            </div>
            <button className="icon-button" onClick={() => setSelected(null)} aria-label="Close details">
              <X size={16} />
            </button>
          </div>
          <div className="quotation-details">
            <span>Project client<strong>{projects.find((p) => p.id === selectedRecord.projectId)?.client ?? "—"}</strong></span>
            <span>Amount<strong>{money(selectedRecord.amount)}</strong></span>
            <span>Quotation ID<strong>{selectedRecord.quotationId}</strong></span>
            <span>Approval status<strong>{selectedRecord.status}</strong></span>
            <span>Payment status<strong>{selectedRecord.paymentStatus}</strong></span>
            {selectedRecord.type === "Invoice" && (
              <span>Invoice generation<strong>{selectedRecord.generationStatus}</strong></span>
            )}
          </div>
          {selectedRecord.type === "Invoice" &&
            selectedRecord.generationStatus === "Not generated" && (
            <div className="dialog-actions">
              <button className="button button-primary" onClick={() => generateInvoice(selectedRecord.id)}>
                Generate invoice
              </button>
            </div>
          )}
          {selectedRecord.type === "Invoice" && selectedRecord.paymentStatus === "Unpaid" && (
            <div className="dialog-actions">
              <button className="button button-primary" onClick={() => markPaid(selectedRecord.id)}>
                Mark as paid
              </button>
            </div>
          )}
          {selectedRecord.type === "Payment" && selectedRecord.paymentStatus === "Unpaid" && (
            <div className="dialog-actions">
              <button className="button button-primary" onClick={() => updatePaymentStatus(selectedRecord.id)}>
                Mark as paid
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
