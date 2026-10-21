import React from "react";
import { Plus } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  copy,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <section className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {action && (
        <button className="button button-primary" onClick={onAction}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </section>
  );
}
