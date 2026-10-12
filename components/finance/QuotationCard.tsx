"use client";

import React, { useState } from "react";
import { Project, Quotation } from "../../lib/types";
import { formatDate, money } from "../../lib/dummy-data/mock-data";

export function QuotationCard({
  quotation,
  project,
  decision,
  onDecision,
}: {
  quotation: Quotation;
  project?: Project;
  decision?: { status: string; comment: string };
  onDecision: (id: string, status: string, comment: string) => void;
}) {
  const [comment, setComment] = useState(decision?.comment ?? "");
  const status = decision?.status ?? quotation.status;

  return (
    <article className="panel quotation-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">
            {quotation.id} · {quotation.projectId}
          </span>
          <h2>{quotation.project}</h2>
          <p>
            Submitted by {quotation.submittedBy} on {quotation.submitted}
          </p>
        </div>
        <span
          className={"status-pill " + status.toLowerCase().replace(" ", "-")}
        >
          {status}
        </span>
      </div>
      <div className="quotation-details">
        <span>
          Supplier<strong>{quotation.vendor}</strong>
        </span>
        <span>
          Quoted amount<strong>{money(quotation.amount)}</strong>
        </span>
        <span>
          Project ID<strong>{quotation.projectId}</strong>
        </span>
        <span>
          Client<strong>{project?.client ?? quotation.project}</strong>
        </span>
        <span>
          Project Lead<strong>{project?.owner ?? "Project lead unavailable"}</strong>
        </span>
        <span>
          Schedule
          <strong>
            {project
              ? `${formatDate(project.start)} → ${formatDate(project.end)}`
              : "Project details unavailable"}
          </strong>
        </span>
      </div>
      {status === "Pending approval" && (
        <div className="quotation-actions">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
          />
          <button
            className="button button-secondary"
            onClick={() => onDecision(quotation.id, "Rejected", comment)}
          >
            Reject
          </button>
          <button
            className="button button-primary"
            onClick={() => onDecision(quotation.id, "Approved", comment)}
          >
            Approve
          </button>
        </div>
      )}
    </article>
  );
}
