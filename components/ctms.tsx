"use client";

/**
 * CMCS Core Management Module (Aggregator & Re-export Hub)
 * Modularized for high readability, maintainability, and clean architecture.
 */

export * from "../lib/types";
export * from "../lib/dummy-data/mock-data";

export { Login } from "./auth/Login";
export { StatCard } from "./common/StatCard";
export { PageHeader } from "./common/PageHeader";
export { ProjectTable } from "./projects/ProjectTable";
export { ProjectDialog } from "./projects/ProjectDialog";
export { ProjectDetailModal } from "./projects/ProjectDetailModal";
export { ProjectCalendar } from "./calendar/ProjectCalendar";
export { ProjectGraphs } from "./dashboard/ProjectGraphs";
export { DashboardHome } from "./dashboard/DashboardHome";
export { CeoDashboardHome } from "./dashboard/CeoDashboardHome";
export { CeoApproval } from "./ceo/CeoApproval";
export { CeoApprovals } from "./ceo/CeoApprovals";
export { QuotationCard } from "./finance/QuotationCard";
export { QuotationsPage } from "./finance/QuotationsPage";
export { FinancePage } from "./finance/FinancePage";
export { EmployeesPage } from "./employees/EmployeesPage";
export { ModulePage } from "./modules/ModulePage";
export { Dashboard } from "./Dashboard";
