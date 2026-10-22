"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  GanttChartSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
  UserRound,
  HardDrive,
  ListTodo,
  CalendarClock,
  ClipboardCheck,
  UserCheck,
  BellRing,
  UserCircle,
  Package,
  Settings2,
  X,
} from "lucide-react";
import {
  Approval,
  Invoice,
  Notification,
  Project,
  Quotation,
  Role,
  User,
} from "../lib/types";
import {
  defaultNotifications,
  notificationStorageKey,
  projectsSeed,
  quotationSeed,
  readNotifications,
  users,
} from "../lib/dummy-data/mock-data";
import { PageHeader } from "./common/PageHeader";
import { ProjectTable } from "./projects/ProjectTable";
import { ProjectDialog } from "./projects/ProjectDialog";
import { ProjectDetailModal } from "./projects/ProjectDetailModal";
import { ProjectCalendar } from "./calendar/ProjectCalendar";
import { DashboardHome } from "./dashboard/DashboardHome";
import { CeoDashboardHome } from "./dashboard/CeoDashboardHome";
import { CeoApprovals } from "./ceo/CeoApprovals";
import { FinancePage } from "./finance/FinancePage";
import { InvoicePage } from "./finance/InvoicePage";
import { QuotationManagement } from "./finance/QuotationManagement";
import { PaymentsPage } from "./finance/PaymentsPage";
import { ExpensesPage } from "./finance/ExpensesPage";
import { SalariesPage } from "./finance/SalariesPage";
import { EquipmentRentalPage } from "./finance/EquipmentRentalPage";
import { EmployeesPage } from "./employees/EmployeesPage";
import { ModulePage } from "./modules/ModulePage";
import { TechnicalEmployeePage } from "./technical/TechnicalEmployeePage";
import { AdministrationEmployeePage } from "./employees/AdministrationEmployeePage";
import { OperationsTasksPage } from "./operations/OperationsTasksPage";
import { FinanceDashboard } from "./finance/FinanceDashboard";
import { ProductionPage } from "./production/ProductionPage";
import { AdministrationPage } from "./administration/AdministrationPage";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Assignments", icon: Users },
  { label: "Employees", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Expenses", icon: ReceiptText },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
];

const operationsNav = nav
  .filter((item) => item.label !== "Expenses")
  .map((item) =>
    item.label === "Assignments" ? { ...item, label: "Tasks", icon: ListTodo } : item,
  );

const ceoNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Project Approvals", icon: CheckCircle2 },
  { label: "Notifications", icon: Bell },
  { label: "Employees", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
];

const technicalNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Projects", icon: ClipboardList },
  { label: "My Tasks", icon: ListTodo },
  { label: "My Schedule", icon: CalendarClock },
  { label: "Equipment & Resources", icon: HardDrive },
  { label: "Attendance", icon: UserCheck },
  { label: "Leave Requests", icon: ClipboardCheck },
  { label: "Notifications", icon: BellRing },
  { label: "My Profile", icon: UserCircle },
];

const financeNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Quotations", icon: FileText },
  { label: "Invoices", icon: ReceiptText },
  { label: "Payments", icon: Wallet },
  { label: "Expenses", icon: ClipboardCheck },
  { label: "Salaries", icon: DollarSign },
  { label: "Equipment Rental", icon: Package },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
];

const administratorNav = [
  { label: "Dashboard",              icon: LayoutDashboard },
  { label: "User Management",        icon: Users },
  { label: "Roles & Permissions",    icon: ShieldCheck },
  { label: "Department Management",  icon: ClipboardList },
  { label: "Notifications",          icon: Bell },
  { label: "Audit Logs",             icon: BarChart3 },
  { label: "Documents & Templates",  icon: FileText },
  { label: "System Settings",        icon: ClipboardCheck },
  { label: "Backup & System Health", icon: HardDrive },
];

const administrationEmployeeNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Administrative Tasks", icon: ClipboardList },
  { label: "Employees", icon: Users },
  { label: "Documents & Records", icon: FileText },
  { label: "Assets & Inventory", icon: Package },
  { label: "Office Maintenance", icon: Settings2 },
  { label: "Meetings & Schedule", icon: CalendarDays },
  { label: "Requests", icon: ClipboardCheck },
  { label: "Notifications", icon: BellRing },
  { label: "My Profile", icon: UserCircle },
];

const productionNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Tasks", icon: ListTodo },
  { label: "Projects", icon: ClipboardList },
  { label: "Attendance", icon: UserCheck },
];

export function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const role =
    (Object.keys(users) as Role[]).find(
      (key) => users[key].email === user.email,
    ) ?? "employee";

  const isCeo = role === "ceo";
  const isHoo = role === "hoo";
  const isFinance = role === "finance";
  const isTechnical = role === "technical";
  const isProduction = role === "production";
  const isAdministrator = role === "admin";
  const isAdministrationEmployee = role === "administrationEmployee";
  const [active, setActive] = useState("Dashboard");
  const [projects, setProjects] = useState<Project[]>(projectsSeed);
  const [customFilter, setCustomFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"new" | Project | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [financeProjectId, setFinanceProjectId] = useState<string | null>(null);
  const [financeInitialView, setFinanceInitialView] = useState<"invoices" | "quotations" | "expenses" | "payments">("invoices");
  const [approvals, setApprovals] = useState<
    Record<string, { status: Approval; comment: string }>
  >({});
  const [notifications, setNotifications] =
    useState<Notification[]>(defaultNotifications);
  const [quotationApprovals, setQuotationApprovals] = useState<
    Record<string, { status: string; comment: string }>
  >({});
  const [toast, setToast] = useState("");
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setNotifications([...defaultNotifications, ...readNotifications()]);
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (customFilter === "All" ||
            p.status === customFilter ||
            p.department === customFilter) &&
          `${p.name} ${p.client} ${p.owner}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [projects, customFilter, search],
  );

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  function addNotification(notification: Omit<Notification, "id" | "time">) {
    const next: Notification = {
      ...notification,
      id: `NTF-${Date.now()}`,
      time: "Just now",
    };
    const updated = [...readNotifications(), next];
    window.localStorage.setItem(notificationStorageKey, JSON.stringify(updated));
    setNotifications([...defaultNotifications, ...updated]);
  }

  function saveProject(project: Project) {
    if (role === "ceo" || isFinance) {
      notify(
        isFinance
          ? "Finance accounts cannot create projects."
          : "CEO accounts have read-only project permissions.",
      );
      return;
    }
    const existing = projects.some((item) => item.id === project.id);
    setProjects((current) =>
      existing
        ? current.map((item) => (item.id === project.id ? project : item))
        : [project, ...current],
    );
    if (!existing && role === "hoo") {
      setApprovals((current) => ({
        ...current,
        [project.id]: { status: "Pending approval", comment: "" },
      }));
      addNotification({
        title: "New project requires approval",
        detail: `Head of Operations submitted ${project.name}.`,
        kind: "Project approval",
        recipient: "ceo",
      });
    }
    setDialog(null);
    notify("Project saved successfully");
  }

  function updateApproval(project: Project, status: Approval, comment: string) {
    setApprovals((current) => ({
      ...current,
      [project.id]: { status, comment },
    }));
    if (status === "Approved" || status === "Rejected") {
      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? { ...item, status: status === "Approved" ? "Upcoming" : "Rejected" }
            : item,
        ),
      );
      addNotification({
        title: `Project ${status.toLowerCase()}`,
        detail: `${project.name} was ${status.toLowerCase()} by the CEO.`,
        kind: "Project update",
        recipient: "hoo",
      });
    }
    setSelected(null);
    notify(`Project ${status.toLowerCase()}.`);
  }

  function updateQuotation(id: string, status: string, comment: string) {
    setQuotationApprovals((current) => ({
      ...current,
      [id]: { status, comment },
    }));
    notify(`Quotation ${status.toLowerCase()}.`);
  }

  function notifyQuotationSubmission(quotation: Quotation, project: Project) {
    addNotification({
      title: "Quotation requires approval",
      detail: `${quotation.id} for ${project.name} was submitted by Finance.`,
      kind: "Quotation",
      recipient: "ceo",
    });
    addNotification({
      title: "Quotation ready for review",
      detail: `${quotation.id} for ${project.name} is ready for HOO review.`,
      kind: "Quotation",
      recipient: "hoo",
    });
  }

  function notifyInvoiceSubmission(invoice: Invoice, project: Project) {
    addNotification({
      title: "Invoice requires approval",
      detail: `${invoice.id} for ${project.name} was submitted by Finance.`,
      kind: "Invoice",
      recipient: "ceo",
    });
    notify(`${invoice.id} submitted for CEO review.`);
  }

  function notifyInvoiceRevision(
    invoice: Invoice,
    project: Project,
    comment: string,
  ) {
    addNotification({
      title: "Invoice revision requested",
      detail: `${invoice.id} for ${project.name} needs changes: ${comment}`,
      kind: "Invoice",
      recipient: "finance",
    });
    notify(`${invoice.id} revision request sent to Finance.`);
  }

  const visibleNotifications = notifications.filter(
    (notification) =>
      notification.recipient === "all" || notification.recipient === role,
  );

  const visibleNav = isTechnical
    ? technicalNav
    : isAdministrationEmployee
      ? administrationEmployeeNav
    : isAdministrator
      ? administratorNav
    : isCeo
    ? ceoNav
    : isHoo
      ? operationsNav
    : isFinance
      ? financeNav
    : isProduction
      ? productionNav
    : nav.filter((item) => item.label !== "Expenses");

  return (
    <div className={"app-shell is-visible " + (isHoo ? "heo-shell" : "")}>
      <aside
        id="main-navigation"
        className={
          "sidebar " +
          (isHoo ? "heo-sidebar " : "") +
          (mobile ? "mobile-open" : "")
        }
      >
        <div className="brand">
          <div className="brand-mark">
            <img src="/assets/chinar-logo.png" alt="CMCS" />
          </div>
          <div>
            <strong>CMCS</strong>
            <span>Management workspace</span>
          </div>
          <button
            className="sidebar-close icon-button"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className={isHoo ? "heo-role-badge" : "role-chip"}>
          <ShieldCheck size={14} />{" "}
          {isHoo ? "HEO CONTROL CENTRE" : user.role}
        </div>
        <nav className="primary-nav">
          {visibleNav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={"nav-item " + (active === label ? "active" : "")}
              onClick={() => {
                setActive(label);
                setMobile(false);
              }}
            >
              <Icon size={17} />
              {label}
              {(label === "Projects" || label === "Project Approvals") && (
                <span className="nav-count">
                  {label === "Projects"
                    ? projects.length
                    : Object.values(approvals).filter(
                        (item) => item.status === "Pending approval",
                      ).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button className="icon-button" onClick={onLogout} aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
            aria-expanded={mobile}
            aria-controls="main-navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>CMCS workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="topbar-actions">
            <div className="avatar">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-content">
          {active === "Dashboard" &&
            (isTechnical ? (
              <TechnicalEmployeePage
                active={active}
                user={user}
                projects={projects}
                onNotify={notify}
              />
            ) : isAdministrationEmployee ? (
              <AdministrationEmployeePage active={active} user={user} onNotify={notify} />
            ) : isCeo || isHoo ? (
              <CeoDashboardHome
                projects={projects}
                notifications={visibleNotifications}
                onNavigate={setActive}
                onSelect={setSelected}
              />
            ) : isFinance ? (
              <FinanceDashboard
                projects={projects}
                onNotify={notify}
                onNavigate={(section, view) => {
                  // Map view-based navigation to the new individual sidebar sections
                  if (view === "quotations") {
                    setActive("Quotations");
                  } else if (view === "invoices") {
                    setActive("Invoices");
                  } else if (view === "payments") {
                    setActive("Payments");
                  } else if (view === "expenses") {
                    setActive("Expenses");
                  } else {
                    setActive(section);
                  }
                }}
              />
            ) : isProduction ? (
              <ProductionPage
                active="Dashboard"
                user={user}
                projects={projects}
                onNotify={notify}
              />
            ) : isAdministrator ? (
              <AdministrationPage
                active="Dashboard"
                user={user}
                onNotify={notify}
              />
            ) : (
              <DashboardHome
                projects={projects}
                onNavigate={setActive}
                onSelect={setSelected}
                createLabel={
                  isHoo ? undefined : isFinance ? undefined : "New project"
                }
                showExecutiveInsights={!isHoo}
              />
            ))}
          {active === "Project Approvals" && (
            <CeoApprovals
              projects={projects}
              approvals={approvals}
              onSubmit={updateApproval}
              onSelect={setSelected}
            />
          )}
          {/* ── Finance role: individual section routes ── */}
          {active === "Quotations" && (
            <QuotationManagement
              projects={projects}
              onNotify={notify}
              onQuotationSubmitted={notifyQuotationSubmission}
              initialProjectId={financeProjectId}
              reviewChangesLabel={false}
              reviewOnly={false}
            />
          )}
          {active === "Invoices" && (
            <InvoicePage
              projects={projects}
              canReview={false}
              canSubmit={isFinance}
              initialSection="invoices"
              onSubmitted={notifyInvoiceSubmission}
              onRevisionRequested={notifyInvoiceRevision}
            />
          )}
          {active === "Payments" && (
            <PaymentsPage
              projects={projects}
              canManage={isFinance}
            />
          )}
          {/* ── CEO/other roles: combined Finance tab ── */}
          {active === "Finance" && (
            <FinancePage
              projects={projects}
              onNotify={notify}
              onQuotationSubmitted={notifyQuotationSubmission}
              onInvoiceSubmitted={notifyInvoiceSubmission}
              onInvoiceRevisionRequested={notifyInvoiceRevision}
              initialProjectId={financeProjectId}
              initialView={isCeo ? "quotations" : financeInitialView === "quotations" ? "quotations" : financeInitialView === "expenses" ? "expenses" : "invoices"}
              canReviewInvoices={isCeo}
              canSubmit={isFinance}
              reviewOnlyQuotations={isCeo}
              role={role}
            />
          )}
          {active === "Expenses" && (
            <ExpensesPage projects={projects} role={role} onNotify={notify} />
          )}
          {active === "Salaries" && (
            <SalariesPage projects={projects} onNotify={notify} />
          )}
          {active === "Equipment Rental" && (
            <EquipmentRentalPage projects={projects} onNotify={notify} />
          )}
          {isTechnical && active !== "Dashboard" && (
            <TechnicalEmployeePage
              active={active}
              user={user}
              projects={projects}
              onNotify={notify}
            />
          )}
          {isProduction && active !== "Dashboard" && (
            <ProductionPage
              active={active}
              user={user}
              projects={projects}
              onNotify={notify}
            />
          )}
          {/* ── Administrator: full admin department ── */}
          {isAdministrator && (
            <AdministrationPage
              active={active}
              user={user}
              onNotify={notify}
            />
          )}
          {isAdministrationEmployee && active !== "Dashboard" && active !== "Employees" && (
            <AdministrationEmployeePage active={active} user={user} onNotify={notify} />
          )}
          {isAdministrationEmployee && active === "Employees" && (
            <EmployeesPage projects={projects} isAdministrator />
          )}
          {active === "Notifications" && !isTechnical && !isAdministrationEmployee && (
            <section className="page-section">
              <PageHeader
                eyebrow="EXECUTIVE / NOTIFICATIONS"
                title="Notifications"
                copy="Approval requests and operational updates for the CEO."
              />
              <div className="panel ceo-notification-list">
                {visibleNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() =>
                      setActive(
                        notification.kind === "Quotation"
                          ? (isFinance ? "Quotations" : "Finance")
                          : notification.kind === "Invoice"
                            ? (isFinance ? "Invoices" : "Finance")
                          : notification.kind === "Project approval"
                            ? "Project Approvals"
                            : "Projects",
                      )
                    }
                  >
                    <span className="notification-icon">
                      <Bell size={13} />
                    </span>
                    <span>
                      <strong>{notification.title}</strong>
                      <small>{notification.detail}</small>
                      <time>{notification.time}</time>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </section>
          )}
          {active === "Projects" && (
            <section className="page-section">
              <PageHeader
                eyebrow=""
                title="Projects"
                copy=""
                action={
                  isCeo || isFinance
                    ? undefined
                    : isHoo
                      ? "Create project"
                      : "New project"
                }
                onAction={() => setDialog("new")}
              />
              <div className="filter-bar">
                <label className="custom-filter">
                  Filter projects
                  <select
                    value={customFilter}
                    onChange={(e) => setCustomFilter(e.target.value)}
                  >
                    <option value="All">All projects</option>
                    <option value="In Progress">In progress</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
                <label className="inline-search">
                  <Search size={15} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects..."
                  />
                </label>
              </div>
              <div className="panel">
                {filtered.length ? (
                  <ProjectTable projects={filtered} onSelect={setSelected} />
                ) : (
                  <div className="empty-state">
                    <Search size={30} />
                    <h3>No matching projects</h3>
                    <p>Try another keyword or clear the current filters.</p>
                  </div>
                )}
              </div>
            </section>
          )}
          {active === "Project Calendar" && (
            <section className="page-section">
              <ProjectCalendar
                projects={projects.filter((project) =>
                  ["Upcoming", "In Progress", "Completed"].includes(
                    project.status,
                  ),
                )}
                onSelect={setSelected}
              />
            </section>
          )}
          {active === "Tasks" && isHoo && (
            <OperationsTasksPage projects={projects} onNotify={notify} />
          )}
          {(active === "Employees" && !isAdministrationEmployee) && (
            <EmployeesPage projects={projects} isAdministrator={isAdministrator} />
          )}
          {[
            "Assignments",
            "Documents",
            "Reports",
            "Settings",
          ].includes(active) && (
            <ModulePage active={active} user={user} onNotify={notify} />
          )}
        </div>
      </main>
      {(dialog === "new" || dialog) && !isCeo && !isFinance && !isTechnical && (
        <ProjectDialog
          project={dialog === "new" ? undefined : dialog}
          onClose={() => setDialog(null)}
          onSave={saveProject}
          currentUser={user}
          existingProjectIds={projects.map((project) => project.id)}
          isHoo={isHoo}
        />
      )}
      {selected && (
        <ProjectDetailModal
          selected={selected}
          isCeo={isCeo}
          approval={approvals[selected.id]}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setSelected(null);
            setDialog(selected);
          }}
          isFinance={isFinance}
          quotation={
            isFinance
              ? quotationSeed.find((quotation) => quotation.projectId === selected.id)
              : undefined
          }
          onQuotationAction={
            isFinance
              ? () => {
                  setSelected(null);
                  setFinanceProjectId(selected.id);
                  setActive("Quotations");
                }
              : undefined
          }
          onApprovalSubmit={updateApproval}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
