"use client";

import React, { useState } from "react";
import { FileText } from "lucide-react";
import { Project } from "../../lib/types";
import { quotationSeed } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { QuotationCard } from "./QuotationCard";

export function QuotationsPage({
  projects,
  quotationApprovals,
  onDecision,
}: {
  projects: Project[];
  quotationApprovals: Record<string, { status: string; comment: string }>;
  onDecision: (id: string, status: string, comment: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredQuotations = quotationSeed.filter((quotation) => {
    const status = quotationApprovals[quotation.id]?.status ?? quotation.status;
    return statusFilter === "All" || status === statusFilter;
  });

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="FINANCE / QUOTATIONS"
        title="Quotation management"
        copy="Review supplier quotations linked to their CMCS project IDs."
      />
      <div className="filter-bar">
        <label className="custom-filter">
          Filter quotations
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All quotations</option>
            <option value="Pending approval">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
      </div>
      <div className="quotation-list">
        {filteredQuotations.map((quotation) => (
          <QuotationCard
            key={quotation.id}
            quotation={quotation}
            project={projects.find((item) => item.id === quotation.projectId)}
            decision={quotationApprovals[quotation.id]}
            onDecision={onDecision}
          />
        ))}
        {!filteredQuotations.length && (
          <div className="empty-state">
            <FileText size={28} />
            <h3>No quotations found</h3>
            <p>Choose another approval status to view quotations.</p>
          </div>
        )}
      </div>
    </section>
  );
}
