"use client";

import React from "react";
import { ArrowUpRight, Download, Search } from "lucide-react";
import { User } from "../../lib/types";
import { PageHeader } from "../common/PageHeader";

export function ModulePage({
  active,
  user,
  onNotify,
}: {
  active: string;
  user: User;
  onNotify: (s: string) => void;
}) {
  const rows =
    active === "Finance"
      ? [
          [
            "INV-2026-024",
            "UNDP Community Awareness",
            "$42,000",
            "Pending approval",
          ],
          ["INV-2026-021", "National Election Coverage", "$58,000", "Approved"],
          ["INV-2026-019", "Youth Media Training", "$19,500", "Paid"],
        ]
      : [
          ["Project delivery", "Operations", "86%", "On track"],
          ["Team utilisation", "People", "78%", "Healthy"],
          ["Budget variance", "Finance", "+4.2%", "Review"],
        ];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow={`${user.department.toUpperCase()} / WORKSPACE`}
        title={active}
        copy={`Manage ${active.toLowerCase()} with clear, actionable workflows.`}
        action="Create request"
        onAction={() => onNotify("Form opened — ready for input")}
      />
      <div className="module-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input placeholder={`Search ${active.toLowerCase()}...`} />
        </label>
        <button className="button button-secondary">
          <Download size={14} /> Export
        </button>
      </div>
      <div className="panel">
        <div className="list-heading">
          <span>Item</span>
          <span>Department</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {rows.map((row) => (
          <div className="list-row" key={row[0]}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span className="status-pill approved">{row[2]}</span>
            <button
              className="text-button"
              onClick={() => onNotify(`${row[0]} opened`)}
            >
              Open <ArrowUpRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
