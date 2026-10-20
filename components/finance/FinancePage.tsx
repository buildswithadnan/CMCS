"use client";

import { useState } from "react";
import { Invoice, Project, Quotation, Role } from "../../lib/types";
import { InvoicePage } from "./InvoicePage";
import { QuotationManagement } from "./QuotationManagement";
import { ExpensesPage } from "./ExpensesPage";

export function FinancePage({
  projects,
  onNotify,
  onQuotationSubmitted,
  onInvoiceSubmitted,
  onInvoiceRevisionRequested,
  initialProjectId,
  initialView = "invoices",
  canReviewInvoices = false,
  canSubmit = false,
  reviewOnlyQuotations = false,
  role,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
  onQuotationSubmitted?: (quotation: Quotation, project: Project) => void;
  onInvoiceSubmitted?: (invoice: Invoice, project: Project) => void;
  onInvoiceRevisionRequested?: (invoice: Invoice, project: Project, comment: string) => void;
  initialProjectId?: string | null;
  initialView?: "invoices" | "quotations" | "expenses";
  canReviewInvoices?: boolean;
  canSubmit?: boolean;
  reviewOnlyQuotations?: boolean;
  role?: Role;
}) {
  const [view, setView] = useState<"invoices" | "quotations" | "expenses">(initialView);
  const showExpenses = role === "ceo";

  return (
    <section className="page-section finance-workspace">
      <div className="finance-section-tabs" role="tablist" aria-label="Finance views">
        <button
          className={view === "quotations" ? "selected" : ""}
          onClick={() => setView("quotations")}
          role="tab"
          aria-selected={view === "quotations"}
        >
          Quotations
        </button>
        <button
          className={view === "invoices" ? "selected" : ""}
          onClick={() => setView("invoices")}
          role="tab"
          aria-selected={view === "invoices"}
        >
          Invoices
        </button>
        {showExpenses && (
          <button
            className={view === "expenses" ? "selected" : ""}
            onClick={() => setView("expenses")}
            role="tab"
            aria-selected={view === "expenses"}
          >
            Expenses
          </button>
        )}
      </div>
      {view === "expenses" && showExpenses ? (
        <ExpensesPage projects={projects} role="ceo" onNotify={onNotify} />
      ) : view === "quotations" ? (
        <QuotationManagement
          projects={projects}
          onNotify={onNotify}
          onQuotationSubmitted={onQuotationSubmitted}
          initialProjectId={initialProjectId}
          reviewChangesLabel={initialView === "quotations"}
          reviewOnly={reviewOnlyQuotations}
        />
      ) : (
        <InvoicePage
          projects={projects}
          canReview={canReviewInvoices}
          canSubmit={canSubmit}
          onSubmitted={onInvoiceSubmitted}
          onRevisionRequested={onInvoiceRevisionRequested}
        />
      )}
    </section>
  );
}
