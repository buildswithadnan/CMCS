import React from "react";
import { Activity } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Activity;
  tone?: string;
}) {
  return (
    <article className={"stat-card " + tone}>
      <div>
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <strong>{value}</strong>
      <small>{sub ?? "Current workspace data"}</small>
    </article>
  );
}
