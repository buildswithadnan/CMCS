import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Project } from "../../lib/types";
import { formatDate, statusColors } from "../../lib/dummy-data/mock-data";

export function ProjectTable({
  projects,
  onSelect,
  showStartDate = true,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
  showStartDate?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Project Lead</th>
            <th>Status</th>
            {showStartDate && <th>Start date</th>}
            <th>End date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>
                <button className="project-link" onClick={() => onSelect(p)}>
                  <span
                    className="project-dot"
                    style={{ background: statusColors[p.status] }}
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.id} · {p.client}
                    </small>
                  </span>
                </button>
              </td>
              <td>{p.owner}</td>
              <td>
                <span
                  className={
                    "status-pill " + p.status.toLowerCase().replace(" ", "-")
                  }
                >
                  {p.status}
                </span>
              </td>
              {showStartDate && <td>{formatDate(p.start)}</td>}
              <td>{formatDate(p.end)}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => onSelect(p)}
                  aria-label="Open project"
                >
                  <ArrowUpRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
