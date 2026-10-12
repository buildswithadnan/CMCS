"use client";

import React, { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Project, User } from "../../lib/types";
import { users } from "../../lib/dummy-data/mock-data";

export function ProjectDialog({
  project,
  onClose,
  onSave,
  currentUser,
  existingProjectIds = [],
  isHoo = false,
}: {
  project?: Project;
  onClose: () => void;
  onSave: (p: Project) => void;
  currentUser: User;
  existingProjectIds?: string[];
  isHoo?: boolean;
}) {
  const departmentKey = (user: User) =>
    user.employeeId.split("-")[1]?.toLowerCase() ?? "";
  const projectLeadOptions = Array.from(
    new Map(
      [currentUser, ...Object.values(users)].map((user) => [
        user.employeeId,
        user,
      ]),
    ).values(),
  ).filter((user) => !["ceo", "finance"].includes(departmentKey(user)));
  const assignmentOptions = Array.from(
    new Map(Object.values(users).map((user) => [user.employeeId, user])).values(),
  ).filter((user) =>
    !["ceo", "hoo", "finance", "admin"].includes(departmentKey(user)),
  );
  const [name, setName] = useState(project?.name ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [projectId, setProjectId] = useState(
    project?.id ?? `PRJ-2026-${String(Date.now()).slice(-4)}`,
  );
  const [customId, setCustomId] = useState(isHoo && Boolean(project));
  const [lead, setLead] = useState(
    project?.owner ?? (isHoo ? currentUser.name : "Unassigned"),
  );
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>(
    project?.assignedEmployees ?? [],
  );
  const [start, setStart] = useState(project?.start ?? "2026-10-15");
  const [end, setEnd] = useState(project?.end ?? "");
  const [error, setError] = useState("");

  function save(e: FormEvent) {
    e.preventDefault();
    const normalizedId = projectId.trim().toUpperCase();
    if (
      !name.trim() ||
      !client.trim() ||
      !normalizedId ||
      (isHoo && !lead) ||
      !start ||
      !end ||
      end < start
    ) {
      setError("Complete all required fields and enter a valid date range.");
      return;
    }
    if (
      existingProjectIds.some(
        (id) =>
          id.toLowerCase() === normalizedId.toLowerCase() &&
          id.toLowerCase() !== project?.id.toLowerCase(),
      )
    ) {
      setError("That project ID is already in use.");
      return;
    }
    onSave(
      project
        ? {
            ...project,
            id: normalizedId,
            name: name.trim(),
            client: client.trim(),
            owner: isHoo ? lead : project?.owner ?? "Unassigned",
            assignedEmployees: isHoo ? assignedEmployees : project?.assignedEmployees,
            start,
            end,
          }
        : {
            id: normalizedId,
            name: name.trim(),
            client: client.trim(),
            owner: isHoo ? lead : "Unassigned",
            ...(isHoo ? { assignedEmployees } : {}),
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
      <div className={"dialog " + (isHoo ? "project-dialog" : "")}>
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
          {isHoo && (
            <div className="dialog-field-row">
              <label>
                Project ID
                <input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={!customId}
                  aria-describedby="project-id-help"
                />
                <span id="project-id-help" className="dialog-field-help">
                  {customId
                    ? "Use a unique ID for this project."
                    : "Auto-generated ID"}
                </span>
              </label>
              <label className="dialog-checkbox-label">
                <input
                  type="checkbox"
                  checked={customId}
                  onChange={(e) => {
                    setCustomId(e.target.checked);
                    if (!e.target.checked && !project) {
                      setProjectId(`PRJ-2026-${String(Date.now()).slice(-4)}`);
                    }
                  }}
                />
                Enter custom ID
              </label>
            </div>
          )}
          <label>
            Project Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. National Election Coverage"
            />
          </label>
          <label>
            Client Name
            <input
              required
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. UNDP"
            />
          </label>
          {isHoo && (
            <>
              <label>
                Project Lead
                <select value={lead} onChange={(e) => setLead(e.target.value)}>
                  {projectLeadOptions.map((user) => (
                    <option key={user.employeeId} value={user.name}>
                      {user.name} · {user.department}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="assignment-fieldset">
                <legend>Assign Employees</legend>
                <p>Select the production and technical team for this project.</p>
                <div className="assignment-options">
                  {assignmentOptions.map((user) => (
                    <label key={user.employeeId} className="assignment-option">
                      <input
                        type="checkbox"
                        checked={assignedEmployees.includes(user.name)}
                        onChange={(e) =>
                          setAssignedEmployees((current) =>
                            e.target.checked
                              ? [...current, user.name]
                              : current.filter((name) => name !== user.name),
                          )
                        }
                      />
                      <span>
                        <strong>{user.name}</strong>
                        <small>{user.department}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
          <div className="dialog-date-grid">
            <label>
              Start date
              <input
                required
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              End date
              <input
                required
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
