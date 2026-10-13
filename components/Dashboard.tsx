"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
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
import { QuotationsPage } from "./finance/QuotationsPage";
import { FinancePage } from "./finance/FinancePage";
import { ExpensesPage } from "./finance/ExpensesPage";
import { EmployeesPage } from "./employees/EmployeesPage";
import { ModulePage } from "./modules/ModulePage";
import { TechnicalEmployeePage } from "./technical/TechnicalEmployeePage";
import { AdministrationEmployeePage } from "./employees/AdministrationEmployeePage";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Assignments", icon: Users },
  { label: "People & attendance", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Expenses", icon: ReceiptText },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
];

const ceoNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Project Approvals", icon: CheckCircle2 },
  { label: "Quotations", icon: FileText },
  { label: "Notifications", icon: Bell },
  { label: "Employees", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Expenses", icon: ReceiptText },
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

const administratorNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: ClipboardList },
  { label: "Project Calendar", icon: GanttChartSquare },
  { label: "Employees", icon: Users },
  { label: "Finance", icon: Wallet },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: ClipboardCheck },
];

const administrationEmployeeNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Administrative Tasks", icon: ClipboardList },
  { label: "Documents & Records", icon: FileText },
  { label: "Assets & Inventory", icon: Package },
  { label: "Office Maintenance", icon: Settings2 },
  { label: "Meetings & Schedule", icon: CalendarDays },
  { label: "Requests", icon: ClipboardCheck },
  { label: "Notifications", icon: BellRing },
  { label: "My Profile", icon: UserCircle },
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
  const isAdministrator = role === "admin";
  const isAdministrationEmployee = role === "administrationEmployee";
  const [active, setActive] = useState("Dashboard");
  const [projects, setProjects] = useState<Project[]>(projectsSeed);
  const [customFilter, setCustomFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"new" | Project | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [financeProjectId, setFinanceProjectId] = useState<string | null>(null);
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
    : isFinance || isHoo
      ? nav
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
              {(label === "Projects" ||
                label === "Project Approvals" ||
                label === "Quotations") && (
                <span className="nav-count">
                  {label === "Projects"
                    ? projects.length
                    : label === "Quotations"
                      ? quotationSeed.filter(
                          (item) => item.status === "Pending approval",
                        ).length
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
            ) : isCeo ? (
              <CeoDashboardHome
                projects={projects}
                notifications={visibleNotifications}
                onNavigate={setActive}
                onSelect={setSelected}
              />
            ) : isFinance ? (
              <FinancePage
                projects={projects}
                onNotify={notify}
                onQuotationSubmitted={notifyQuotationSubmission}
                initialProjectId={financeProjectId}
              />
            ) : (
              <DashboardHome
                projects={projects}
                onNavigate={setActive}
                onSelect={setSelected}
                createLabel={
                  isHoo ? "Create project" : isFinance ? undefined : "New project"
                }
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
          {active === "Quotations" && (
            <QuotationsPage
              projects={projects}
              quotationApprovals={quotationApprovals}
              onDecision={updateQuotation}
            />
          )}
          {active === "Finance" && (
            <FinancePage
              projects={projects}
              onNotify={notify}
              onQuotationSubmitted={notifyQuotationSubmission}
              initialProjectId={financeProjectId}
            />
          )}
          {active === "Expenses" && (
            <ExpensesPage projects={projects} role={role} onNotify={notify} />
          )}
          {isTechnical && active !== "Dashboard" && (
            <TechnicalEmployeePage
              active={active}
              user={user}
              projects={projects}
              onNotify={notify}
            />
          )}
          {isAdministrationEmployee && active !== "Dashboard" && (
            <AdministrationEmployeePage active={active} user={user} onNotify={notify} />
          )}
          {active === "Notifications" && (
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
                          ? "Quotations"
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
                eyebrow={isHoo ? "OPERATIONS CONTROL CENTRE / PROJECTS" : "OPERATIONS / PROJECTS"}
                title="Projects"
                copy={
                  isHoo
                    ? "Create and coordinate project submissions across production teams."
                    : "Track approved work from start to completion."
                }
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
          {(active === "Employees" || active === "People & attendance") && (
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
                  setActive("Finance");
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
