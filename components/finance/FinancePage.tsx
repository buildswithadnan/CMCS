"use client";

import { Project, Quotation } from "../../lib/types";
import { QuotationManagement } from "./QuotationManagement";

export function FinancePage({
  projects,
  onNotify,
  onQuotationSubmitted,
  initialProjectId,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
  onQuotationSubmitted?: (quotation: Quotation, project: Project) => void;
  initialProjectId?: string | null;
}) {
  return (
    <QuotationManagement
      projects={projects}
      onNotify={onNotify}
      onQuotationSubmitted={onQuotationSubmitted}
      initialProjectId={initialProjectId}
    />
  );
}
