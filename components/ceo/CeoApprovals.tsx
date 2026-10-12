"use client";

import React from "react";
import { ArrowUpRight, Bell } from "lucide-react";
import { Approval, Project } from "../../lib/types";
import { formatDate, money } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { CeoApproval } from "./CeoApproval";

export function CeoApprovals({
  projects,
  approvals,
  onSubmit,
  onSelect,
}: {
  projects: Project[];
  approvals: Record<string, { status: Approval; comment: string }>;
  onSubmit: (project: Project, status: Approval, comment: string) => void;
  onSelect: (project: Project) => void;
}) {
  const pending = projects.filter(
    (project) => approvals[project.id]?.status === "Pending approval",
  );

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="EXECUTIVE / APPROVALS"
        title="Project approvals"
        copy="Review projects submitted by the Head of Operations before work begins."
      />
      <div className="approval-notice">
        <Bell size={17} />
        <div>
          <strong>
            {pending.length} project submissions require your decision
          </strong>
          <span>
            All project information and assignments are locked for CEO accounts.
          </span>
        </div>
      </div>
      <div className="approval-card-list">
        {pending.map((project) => (
          <article className="panel approval-card" key={project.id}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">
                  NEW SUBMISSION · HEAD OF OPERATIONS
                </span>
                <h2>{project.name}</h2>
                <p>
                  {project.client} · {project.id}
                </p>
              </div>
              <span className="status-pill pending-approval">
                Pending approval
              </span>
            </div>
            <div className="approval-detail-grid">
              <span>
                Project Lead<strong>{project.owner}</strong>
              </span>
              <span>
                Department<strong>{project.department}</strong>
              </span>
              <span>
                Schedule
                <strong>
                  {formatDate(project.start)} → {formatDate(project.end)}
                </strong>
              </span>
              <span>
                Budget<strong>{money(project.budget)}</strong>
              </span>
            </div>
            <CeoApproval
              project={project}
              approval={approvals[project.id]}
              onSubmit={onSubmit}
            />
            <button
              className="text-button approval-detail-link"
              onClick={() => onSelect(project)}
            >
              View full project details <ArrowUpRight size={14} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
