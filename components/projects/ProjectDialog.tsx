"use client";

import React, { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Project } from "../../lib/types";

export function ProjectDialog({
  project,
  onClose,
  onSave,
}: {
  project?: Project;
  onClose: () => void;
  onSave: (p: Project) => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [start, setStart] = useState(project?.start ?? "2026-10-15");
  const [end, setEnd] = useState(project?.end ?? "");
  const [error, setError] = useState("");

  function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !client.trim() || !start || !end || end < start) {
      setError("Enter a project, client, and a valid date range.");
      return;
    }
    onSave(
      project
        ? { ...project, name, client, start, end }
        : {
            id: `PRJ-2026-${String(Date.now()).slice(-4)}`,
            name,
            client,
            owner: "Unassigned",
            start,
            end,
            progress: 0,
            status: "Upcoming",
            department: "Operations",
            budget: 0,
          },
    );
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">
              {project ? "EDIT PROJECT" : "NEW PROJECT"}
            </span>
            <h2>{project ? "Update project details" : "Create a project"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form className="dialog-form" onSubmit={save}>
          <label>
            Project name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Client / partner
            <input value={client} onChange={(e) => setClient(e.target.value)} />
          </label>
          <div className="dialog-date-grid">
            <label>
              Start date
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              Save project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
