"use client";

import { Project, Quotation } from "../../lib/types";
import { QuotationManagement } from "./QuotationManagement";

export function FinancePage({
  projects,
  onNotify,
  onQuotationSubmitted,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
  onQuotationSubmitted?: (quotation: Quotation, project: Project) => void;
}) {
  return (
    <QuotationManagement
      projects={projects}
      onNotify={onNotify}
      onQuotationSubmitted={onQuotationSubmitted}
    />
  );
}
