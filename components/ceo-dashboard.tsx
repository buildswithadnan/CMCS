"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileBarChart,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeft,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  actions,
  activities,
  ceoKpis,
  ceoPeriods,
  projectPerformance,
  projectStatus,
  projects,
  revenueTrend,
  upcomingProjects,
  workload,
  type CeoPeriod,
} from "../lib/dummy-data/ceo";

type User = { firstName: string; name: string; role: string };
type Icon = typeof LayoutDashboard;

const navigation: Array<{
  label: string;
  icon: Icon;
  children?: string[];
  count?: number;
}> = [
  { label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Operations",
    icon: ClipboardList,
    children: [
      "All Projects",
      "Upcoming Projects",
      "Active Projects",
      "Completed Projects",
    ],
  },
  {
    label: "Assignments",
    icon: Users,
    children: ["Assignment Overview", "Pending Responses", "Employee Workload"],
  },
  {
    label: "Resources",
    icon: Truck,
    children: [
      "Employees",
      "OB Vans",
      "Equipment",
      "Resource Bookings",
      "Rentals",
    ],
  },
  {
    label: "Finance",
    icon: WalletCards,
    children: [
      "Finance Overview",
      "Invoices",
      "Payments",
      "Expenses",
      "Outstanding",
    ],
  },
  {
    label: "Reports",
    icon: FileBarChart,
    children: [
      "Project Reports",
      "Financial Reports",
      "Employee / Resource Reports",
      "Operational Analytics",
    ],
  },
  { label: "Notifications", icon: Bell, count: 4 },
  { label: "Audit Logs", icon: ShieldCheck },
  { label: "Archive", icon: PanelLeft },
];

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

export function CeoDashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [period, setPeriod] = useState<CeoPeriod>("Today");
  const [active, setActive] = useState("Dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [financeView, setFinanceView] = useState<"Revenue" | "Projects">(
    "Revenue",
  );
  const [notificationTab, setNotificationTab] = useState("All");
  const [refreshed, setRefreshed] = useState(false);
  const metrics = ceoKpis[period];
  const initials = user.firstName.slice(0, 2).toUpperCase();
  const greeting =
    new Date().getHours() < 12
      ? "Good Morning"
      : new Date().getHours() < 18
        ? "Good Afternoon"
        : "Good Evening";
  const filteredNotifications = useMemo(
    () =>
      notificationTab === "All"
        ? actions
        : actions.filter((item) => item.icon === notificationTab.toLowerCase()),
    [notificationTab],
  );

  const kpis = [
    [
      "Total Projects",
      metrics.projects.toString(),
      "+12.5%",
      ClipboardList,
      "default",
    ],
    ["Active Projects", metrics.active.toString(), "+8.4%", Clock3, "info"],
    [
      "Upcoming Projects",
      metrics.upcoming.toString(),
      "+16.2%",
      CalendarDays,
      "success",
    ],
    [
      "Completed",
      metrics.completed.toString(),
      "+18.7%",
      CheckCircle2,
      "success",
    ],
    [
      "On Hold",
      metrics.onHold.toString(),
      "Monitor status",
      Clock3,
      "warning",
    ],
    [
      "Total Revenue",
      money(metrics.revenue),
      "+12.5%",
      CircleDollarSign,
      "primary",
    ],
    [
      "Outstanding",
      money(metrics.outstanding),
      "12 accounts",
      WalletCards,
      "warning",
    ],
    [
      "Pending Invoices",
      metrics.invoices.toString(),
      "Awaiting review",
      FileText,
      "warning",
    ],
  ] as const;

  return (
    <div className="app-shell is-visible ceo-shell">
      <aside
        id="ceo-navigation"
        className={"sidebar ceo-sidebar " + (navOpen ? "mobile-open" : "")}
      >
        <div className="brand">
          <div className="brand-mark">
            <img src="/assets/chinar-logo.png" alt="CMCS" />
          </div>
          <div>
            <strong>CMCS</strong>
            <span>Executive workspace</span>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="ceo-role-badge">
          <ShieldCheck size={14} /> CEO CONTROL CENTRE
        </div>
        <nav className="ceo-nav" aria-label="CEO navigation">
          {navigation.map(({ label, icon: NavIcon, children, count }) => (
            <div className="ceo-nav-group" key={label}>
              <button
                className={"nav-item " + (active === label ? "active" : "")}
                onClick={() => {
                  setActive(label);
                  setNavOpen(false);
                }}
              >
                <NavIcon className="nav-icon" size={17} />
                {label}
                {count && <span className="nav-count">{count}</span>}
                {children && (
                  <ChevronDown className="ceo-nav-chevron" size={14} />
                )}
              </button>
              {children && active === label && (
                <div className="ceo-subnav">
                  {children.map((child) => (
                    <button
                      key={child}
                      onClick={() => {
                        setActive(child);
                        setNavOpen(false);
                      }}
                    >
                      {child}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="help-card">
            <span className="help-icon">
              <HelpCircle size={14} />
            </span>
            <div>
              <strong>Need a hand?</strong>
              <span>Visit the help centre</span>
            </div>
          </div>
          <div className="user-mini">
            <div className="avatar avatar-indigo">{initials}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button
              className="icon-button"
              onClick={onLogout}
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {navOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-content">
        <header className="topbar ceo-topbar">
          <button
            className="menu-button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            aria-controls="ceo-navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>Executive workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="topbar-actions">
            <label className="ceo-search">
              <Search size={16} />
              <input
                placeholder="Search projects, people..."
                aria-label="Search"
              />
            </label>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-count">4</span>
            </button>
            <div className="topbar-divider" />
            <div className="ceo-profile-wrap">
              <button
                className="ceo-profile-button"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="avatar avatar-indigo">{initials}</div>
                <span>
                  <strong>{user.name}</strong>
                  <small>CEO</small>
                </span>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="ceo-profile-menu">
                  <button>
                    <Users size={14} />
                    My Profile
                  </button>
                  <button>
                    <Settings size={14} />
                    Account Settings
                  </button>
                  <button>
                    <HelpCircle size={14} />
                    Help
                  </button>
                  <button onClick={onLogout}>
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content ceo-content">
          <section className="ceo-dashboard-head">
            <div>
              <p className="eyebrow">
                Tuesday, 07 October 2026 · Last updated 2 mins ago
              </p>
              <h1>
                {greeting}, {user.firstName}
              </h1>
              <p className="heading-copy">
                Here&apos;s your executive overview of CMCS operations.
              </p>
            </div>
            <div className="ceo-head-actions">
              <button
                className="button button-secondary"
                onClick={() => setRefreshed(true)}
              >
                <RefreshCw size={14} className={refreshed ? "spin-once" : ""} />{" "}
                Refresh
              </button>
              <div className="ceo-head-date">
                <CalendarDays size={16} /> 07 October 2026
              </div>
            </div>
          </section>
          <div className="ceo-period-bar">
            <span>Performance period</span>
            <div>
              {ceoPeriods.map((item) => (
                <button
                  key={item}
                  className={period === item ? "selected" : ""}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <section className="ceo-kpis">
            {kpis.map(([label, value, change, KpiIcon, tone]) => (
              <article className={"ceo-kpi " + tone} key={label}>
                <div>
                  <span>{label}</span>
                  <KpiIcon size={18} />
                </div>
                <strong>{value}</strong>
                <small
                  className={
                    tone === "warning" ? "attention" : ""
                  }
                >
                  {change} <span>vs previous period</span>
                </small>
              </article>
            ))}
          </section>
          <section className="ceo-chart-grid">
            <article className="ceo-panel chart-large">
              <div className="panel-heading">
                <div>
                  <h2>Revenue Overview</h2>
                  <p>Revenue and expenses in thousands (USD).</p>
                </div>
                <div className="chart-tabs">
                  <button
                    className={financeView === "Revenue" ? "selected" : ""}
                    onClick={() => setFinanceView("Revenue")}
                  >
                    Revenue
                  </button>
                  <button
                    className={financeView === "Projects" ? "selected" : ""}
                    onClick={() => setFinanceView("Projects")}
                  >
                    Projects
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                {financeView === "Revenue" ? (
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient
                        id="revenueFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#1f41bb"
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1f41bb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#eef1f5" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#8e9aad" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#8e9aad" }}
                      tickFormatter={(value) => `$${value}k`}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `$${Number(value ?? 0)}k`,
                        String(name).replace(/^./, (character) =>
                          character.toUpperCase(),
                        ),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1f41bb"
                      strokeWidth={3}
                      fill="url(#revenueFill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={projectPerformance}>
                    <CartesianGrid vertical={false} stroke="#eef1f5" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#8e9aad" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#8e9aad" }}
                    />
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    <Bar
                      dataKey="completed"
                      name="Completed projects"
                      fill="#1f41bb"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="onHold"
                      name="On hold projects"
                      fill="#d97706"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </article>
            <article className="ceo-panel chart-status">
              <div className="panel-heading">
                <div>
                  <h2>Project Status</h2>
                  <p>Portfolio distribution</p>
                </div>
                <button className="more-button">
                  <MoreHorizontal size={17} />
                </button>
              </div>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height={185}>
                  <PieChart>
                    <Pie
                      data={projectStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {projectStatus.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-total">
                  <strong>{metrics.projects}</strong>
                  <span>Total projects</span>
                </div>
              </div>{" "}
              <div className="status-legend">
                {projectStatus.slice(0, 4).map((entry) => (
                  <div key={entry.name}>
                    <i style={{ background: entry.color }} />
                    <span>{entry.name}</span>
                    <b>{entry.value}</b>
                  </div>
                ))}
              </div>
            </article>
          </section>
          <section className="ceo-middle-grid">
            <article className="ceo-panel operations-panel">
              <div className="panel-heading">
                <div>
                  <h2>Operational Overview</h2>
                  <p>Current delivery health across CMCS.</p>
                </div>
                <span className="health-badge">
                  <CheckCircle2 size={14} /> Good
                </span>
              </div>
              <div className="ops-health">
                <strong>Operational Health</strong>
                <div>
                  <b>Good</b>
                  <span>91% on-time completion</span>
                </div>
                <i>
                  <b style={{ width: "91%" }} />
                </i>
              </div>
              <div className="ops-stats">
                {[
                  ["Active Projects", metrics.active],
                  ["Upcoming", metrics.upcoming],
                  ["On Hold", metrics.onHold],
                  ["On Hold", 3],
                  ["Completed This Month", 21],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="ceo-panel">
              <div className="panel-heading">
                <div>
                  <h2>Project Health</h2>
                  <p>Risk distribution</p>
                </div>
              </div>
              <div className="health-bars">
                <div>
                  <span>Healthy</span>
                  <b>78%</b>
                  <i>
                    <em style={{ width: "78%" }} />
                  </i>
                </div>
                <div>
                  <span>At Risk</span>
                  <b>16%</b>
                  <i>
                    <em className="warning" style={{ width: "16%" }} />
                  </i>
                </div>
                <div>
                  <span>Critical</span>
                  <b>6%</b>
                  <i>
                    <em className="danger" style={{ width: "6%" }} />
                  </i>
                </div>
              </div>
              <div className="health-reasons">
                <span>Top risk reasons</span>
                <b>Delay</b>
                <b>Resource shortage</b>
                <b>Equipment issue</b>
              </div>
            </article>
          </section>
          <section className="ceo-main-grid">
            <article className="ceo-panel ceo-projects-panel">
              <div className="panel-heading">
                <div>
                  <h2>Active Projects</h2>
                  <p>Live project delivery and ownership.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("All Projects")}
                >
                  View all <span>→</span>
                </button>
              </div>
              <div className="table-wrap">
                <table className="ceo-table">
                  <thead>
                    <tr>
                      {[
                        "Project",
                        "Client",
                        "Lead",
                        "Team",
                        "Dates",
                        "Progress",
                        "Status",
                        "",
                      ].map((heading) => (
                        <th key={heading}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.name}>
                        <td>
                          <strong>{project.name}</strong>
                        </td>
                        <td>{project.client}</td>
                        <td>{project.lead}</td>
                        <td>{project.team} members</td>
                        <td>
                          {project.start} – {project.end}
                        </td>
                        <td>
                          <div className="table-progress">
                            <span>{project.progress}%</span>
                            <i>
                              <b style={{ width: `${project.progress}%` }} />
                            </i>
                          </div>
                        </td>
                        <td>
                          <span
                            className={
                              "ceo-status " +
                              project.status.toLowerCase().replace(" ", "-")
                            }
                          >
                            {project.status}
                          </span>
                        </td>
                        <td>
                          <button
                            aria-label={"More options for " + project.name}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="ceo-panel action-panel">
              <div className="panel-heading">
                <div>
                  <h2>Action Required</h2>
                  <p>Priority items for your attention.</p>
                </div>
                <AlertTriangle size={17} color="#d97706" />
              </div>
              <div className="action-list">
                {actions.map((item) => (
                  <div className="action-row" key={item.title}>
                    <span className={"severity " + item.severity.toLowerCase()}>
                      {item.severity}
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                      <small>{item.time}</small>
                    </div>
                    <button>View</button>
                  </div>
                ))}
              </div>
            </article>
          </section>
          <section className="ceo-bottom-grid">
            <article className="ceo-panel">
              <div className="panel-heading">
                <div>
                  <h2>Employee Workload</h2>
                  <p>42 total employees · 24 currently working</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("Employee Workload")}
                >
                  View team <span>→</span>
                </button>
              </div>
              <div className="workload-summary">
                <span>
                  Available <b>18</b>
                </span>
                <span>
                  On field duty <b>11</b>
                </span>
                <span>
                  On leave <b>5</b>
                </span>
              </div>
              <div className="workload-list">
                {workload.map((person) => (
                  <div key={person.name}>
                    <div className="workload-person">
                      <span className="avatar avatar-blue">
                        {person.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span>
                        <strong>{person.name}</strong>
                        <small>{person.role}</small>
                      </span>
                    </div>
                    <div className="workload-bar">
                      <i>
                        <b
                          className={person.value > 85 ? "overloaded" : ""}
                          style={{ width: `${person.value}%` }}
                        />
                      </i>
                      <span>{person.value}%</span>
                    </div>
                    <em
                      className={person.status.toLowerCase().replace(" ", "-")}
                    >
                      {person.status}
                    </em>
                  </div>
                ))}
              </div>
            </article>
            <article className="ceo-panel">
              <div className="panel-heading">
                <div>
                  <h2>Resource Utilization</h2>
                  <p>Fleet and equipment availability.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("Resources")}
                >
                  Manage <span>→</span>
                </button>
              </div>
              <div className="resource-rings">
                <div>
                  <div className="ring van">
                    <strong>72%</strong>
                  </div>
                  <span>OB Van utilization</span>
                  <small>2 available · 2 deployed · 1 maintenance</small>
                </div>
                <div>
                  <div className="ring equipment">
                    <strong>64%</strong>
                  </div>
                  <span>Equipment utilization</span>
                  <small>43 available · 18 reserved · 6 maintenance</small>
                </div>
              </div>
              <div className="van-list">
                <div>
                  <Truck size={15} />
                  <strong>OB Van 01</strong>
                  <span>Deployed · UNDP Project</span>
                </div>
                <div>
                  <Truck size={15} />
                  <strong>OB Van 04</strong>
                  <span>Deployed · Sports Coverage</span>
                </div>
              </div>
            </article>
          </section>
          <section className="ceo-bottom-grid">
            <article className="ceo-panel">
              <div className="panel-heading">
                <div>
                  <h2>Upcoming Projects</h2>
                  <p>Next scheduled productions.</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActive("Calendar")}
                >
                  Open calendar <span>→</span>
                </button>
              </div>
              <div className="upcoming-list">
                {upcomingProjects.map((project) => (
                  <div key={project.name}>
                    <time>
                      <b>{project.month}</b>
                      <strong>{project.day}</strong>
                    </time>
                    <div>
                      <strong>{project.name}</strong>
                      <span>
                        {project.location} · {project.lead} · {project.team}{" "}
                        employees
                      </span>
                    </div>
                    <ChevronDown size={15} />
                  </div>
                ))}
              </div>
            </article>
            <article className="ceo-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest company updates.</p>
                </div>
                <button className="text-button">
                  View all <span>→</span>
                </button>
              </div>
              <div className="activity-timeline">
                {activities.map(([time, text, type]) => (
                  <div key={time + text}>
                    <span className={"timeline-icon " + type}>
                      {type === "check" ? (
                        <CheckCircle2 size={14} />
                      ) : type === "truck" ? (
                        <Truck size={14} />
                      ) : type === "file" ? (
                        <FileText size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                    </span>
                    <time>{time}</time>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
          <section className="ceo-notification-strip">
            <div>
              <Bell size={17} />
              <strong>Notifications</strong>
            </div>
            <div className="notification-tabs">
              {["All", "Projects", "Finance", "Resources", "Employees"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={notificationTab === tab ? "selected" : ""}
                    onClick={() => setNotificationTab(tab)}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
            <div className="notification-items">
              {filteredNotifications.slice(0, 3).map((item) => (
                <span key={item.title}>
                  <i />
                  {item.title}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
