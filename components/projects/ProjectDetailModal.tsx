"use client";

import React from "react";
import { X } from "lucide-react";
import { Approval, Project, Quotation } from "../../lib/types";
import { formatDate, money, parseDate } from "../../lib/dummy-data/mock-data";
import { CeoApproval } from "../ceo/CeoApproval";

export function ProjectDetailModal({
  selected,
  isCeo,
  isFinance,
  quotation,
  approval,
  onClose,
  onEdit,
  onQuotationAction,
  onApprovalSubmit,
}: {
  selected: Project;
  isCeo: boolean;
  isFinance?: boolean;
  quotation?: Quotation;
  approval?: { status: Approval; comment: string };
  onClose: () => void;
  onEdit: () => void;
  onQuotationAction?: () => void;
  onApprovalSubmit: (project: Project, status: Approval, comment: string) => void;
}) {
  const pStart = parseDate(selected.start);
  const pEnd = parseDate(selected.end);
  const duration = Math.max(
    1,
    Math.round((pEnd.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog project-detail">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">PROJECT DETAIL</span>
            <h2>{selected.name}</h2>
            <p>
              {selected.client} · {selected.id}
            </p>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="detail-grid">
          <span>
            Project Lead<strong>{selected.owner}</strong>
          </span>
          <span>
            Status
            <strong
              className={
                "status-pill " +
                selected.status.toLowerCase().replace(" ", "-")
              }
            >
              {selected.status}
            </strong>
          </span>
          <span>
            Department<strong>{selected.department}</strong>
          </span>
          {selected.assignedEmployees?.length ? (
            <span>
              Assigned Employees
              <strong>{selected.assignedEmployees.join(", ")}</strong>
            </span>
          ) : null}
          <span>
            Production Budget<strong>{money(selected.budget)}</strong>
          </span>
          <span>
            Schedule
            <strong>
              {formatDate(selected.start)} → {formatDate(selected.end)}
              <small style={{ fontWeight: 500, color: "#64748b", marginLeft: "5px" }}>
                ({duration} days)
              </small>
            </strong>
          </span>
          <span>
            Progress
            <strong>
              {selected.progress}% complete
              <div
                style={{
                  marginTop: "6px",
                  width: "100%",
                  height: "6px",
                  background: "#e2e8f0",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${selected.progress}%`,
                    height: "100%",
                    background: selected.progress >= 100 ? "#16a34a" : "#2563eb",
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </strong>
          </span>
        </div>
        {isCeo && approval?.status === "Pending approval" ? (
          <CeoApproval
            project={selected}
            approval={approval}
            onSubmit={onApprovalSubmit}
          />
        ) : (
          <div className="dialog-actions">
            <button
              className="button button-secondary"
              onClick={onClose}
            >
              Close
            </button>
            {isFinance ? (
              <button
                className="button button-primary"
                onClick={onQuotationAction}
              >
                {quotation ? "Open quotation" : "Create quotation"}
              </button>
            ) : !isCeo ? (
              <button
                className="button button-primary"
                onClick={onEdit}
              >
                Edit project
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
