"use client";

import React, { useState } from "react";
import { Approval, Project } from "../../lib/types";

export function CeoApproval({
  project,
  approval,
  onSubmit,
}: {
  project: Project;
  approval?: { status: Approval; comment: string };
  onSubmit: (project: Project, status: Approval, comment: string) => void;
}) {
  const [comment, setComment] = useState(approval?.comment ?? "");

  return (
    <div className="approval-panel">
      <div className="approval-panel-head">
        <strong>CEO review</strong>
        <span className="status-pill approved">
          {approval?.status ?? "Pending approval"}
        </span>
      </div>
      <label>
        Comment
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add an approval or rejection comment..."
        />
      </label>
      <div className="dialog-actions">
        <button
          className="button button-secondary"
          onClick={() => onSubmit(project, "Rejected", comment)}
        >
          Reject
        </button>
        <button
          className="button button-primary"
          onClick={() => onSubmit(project, "Approved", comment)}
        >
          Approve
        </button>
      </div>
    </div>
  );
}
