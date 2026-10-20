"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  RefreshCw,
  Truck,
  TrendingUp,
  Users,
  WalletCards,
  Activity,
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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Notification, Project } from "../../lib/types";
import {
  ceoKpis,
  ceoPeriods,
  projectPerformance,
  projectStatus,
  revenueTrend,
  type CeoPeriod,
} from "../../lib/dummy-data/ceo";
import { attendanceToday, money } from "../../lib/dummy-data/mock-data";
import { ProjectTable } from "../projects/ProjectTable";

// ─── helpers ─────────────────────────────────────────────────────────────────

const usd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });

// ─── KPI card ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  alert = false,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  alert?: boolean;
}) {
  return (
    <article
      className="ceo2-kpi"
      style={{ "--kpi-accent": accent } as React.CSSProperties}
    >
      {alert && <span className="ceo2-kpi-alert-dot" />}
      <div className="ceo2-kpi-top">
        <span className="ceo2-kpi-label">{label}</span>
        <span
          className="ceo2-kpi-icon"
          style={{ background: accent + "18", color: accent }}
        >
          <Icon size={15} />
        </span>
      </div>
      <strong className="ceo2-kpi-value">{value}</strong>
      <small className={`ceo2-kpi-sub ${alert ? "ceo2-kpi-sub-warn" : ""}`}>
        {sub}
      </small>
    </article>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHead({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="ceo2-section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action} <ArrowUpRight size={13} />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CeoDashboardHome({
  projects,
  notifications,
  onNavigate,
  onSelect,
}: {
  projects: Project[];
  notifications: Notification[];
  onNavigate: (page: string) => void;
  onSelect: (project: Project) => void;
}) {
  const [period, setPeriod] = useState<CeoPeriod>("Today");
  const [chartMode, setChartMode] = useState<"Revenue" | "Projects">(
    "Revenue",
  );
  const [refreshed, setRefreshed] = useState(false);

  const metrics = ceoKpis[period];
  const present = attendanceToday.filter((p) => p.status === "Present").length;
  const absent = attendanceToday.filter((p) => p.status === "Absent").length;
  const late = attendanceToday.filter((p) => p.status === "Late").length;

  const activeProjects = projects.filter((p) => p.status === "In Progress").length;
  const upcomingProjects = projects.filter((p) => p.status === "Upcoming").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;

  const pendingApprovals = notifications.filter(
    (n) => n.kind === "Project approval" || n.kind === "Quotation" || n.kind === "Invoice",
  ).length;

  return (
    <section className="page-section ceo-content ceo2">
      {/* ── Top header ── */}
      <div className="ceo2-header">
        <div className="ceo2-header-left">
          <span className="eyebrow">EXECUTIVE CONTROL CENTRE</span>
          <h1>Good morning, Ahmad</h1>
          <p>
            Real-time strategic overview of CMCS media operations, budgets,
            and personnel.
          </p>
        </div>
        <div className="ceo2-header-right">
          <div className="ceo2-date-chip">
            <CalendarDays size={13} />
            <span>12 October 2026</span>
          </div>
          <button
            className="button button-secondary"
            onClick={() => {
              setRefreshed(true);
              setTimeout(() => setRefreshed(false), 800);
            }}
          >
            <RefreshCw
              size={13}
              className={refreshed ? "spin-once" : ""}
            />{" "}
            Refresh
          </button>
        </div>
      </div>

      {/* ── Action banner ── */}
      {pendingApprovals > 0 && (
        <div className="ceo2-action-banner">
          <span className="ceo2-banner-icon">
            <Bell size={15} />
          </span>
          <div>
            <strong>
              {pendingApprovals} item
              {pendingApprovals !== 1 ? "s" : ""} need your approval
            </strong>
            <span>
              Project submissions, quotations, or invoices are waiting for
              CEO authorization.
            </span>
          </div>
          <div className="ceo2-banner-actions">
            <button
              className="button button-primary"
              onClick={() => onNavigate("Project Approvals")}
            >
              Review submissions
            </button>
            <button
              className="button button-secondary"
              onClick={() => onNavigate("Finance")}
            >
              Review quotations
            </button>
          </div>
        </div>
      )}

      {/* ── Period selector ── */}
      <div className="ceo2-period-bar">
        <span>Performance period</span>
        <div className="ceo2-period-pills">
          {ceoPeriods.map((p) => (
            <button
              key={p}
              className={period === p ? "active" : ""}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="ceo2-kpi-grid">
        <KpiCard
          label="Total projects"
          value={projects.length.toString()}
          sub={`${activeProjects} active · ${upcomingProjects} upcoming`}
          icon={ClipboardList}
          accent="#2563eb"
        />
        <KpiCard
          label="Active projects"
          value={activeProjects.toString()}
          sub="Currently in production"
          icon={Activity}
          accent="#7c3aed"
        />
        <KpiCard
          label="Completed"
          value={completedProjects.toString()}
          sub="+18.7% vs last period"
          icon={CheckCircle2}
          accent="#16a34a"
        />
        <KpiCard
          label="On hold"
          value={metrics.onHold.toString()}
          sub="Monitor status"
          icon={Clock3}
          accent="#f59e0b"
          alert={metrics.onHold > 0}
        />
        <KpiCard
          label="Total revenue"
          value={usd(metrics.revenue)}
          sub="+12.5% vs last period"
          icon={CircleDollarSign}
          accent="#0891b2"
        />
        <KpiCard
          label="Outstanding"
          value={usd(metrics.outstanding)}
          sub="12 accounts pending"
          icon={WalletCards}
          accent="#dc2626"
          alert={true}
        />
        <KpiCard
          label="Pending invoices"
          value={metrics.invoices.toString()}
          sub="Awaiting CEO review"
          icon={FileText}
          accent="#d97706"
          alert={metrics.invoices > 0}
        />
        <KpiCard
          label="Staff on site"
          value={present.toString()}
          sub={`${absent} absent · ${late} late`}
          icon={Users}
          accent="#6657d8"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="ceo2-charts-row">
        {/* Main chart */}
        <article className="panel ceo2-chart-main">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">FINANCIAL PERFORMANCE</span>
              <h2>Revenue &amp; delivery overview</h2>
              <p>Financial and production trajectory (USD thousands).</p>
            </div>
            <div className="ceo2-chart-tabs">
              <button
                className={chartMode === "Revenue" ? "active" : ""}
                onClick={() => setChartMode("Revenue")}
              >
                Revenue
              </button>
              <button
                className={chartMode === "Projects" ? "active" : ""}
                onClick={() => setChartMode("Projects")}
              >
                Projects
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            {chartMode === "Revenue" ? (
              <AreaChart
                data={revenueTrend}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="ceoRevGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#2563eb"
                      stopOpacity={0.18}
                    />
                    <stop
                      offset="95%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#eef1f5"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8e9aad" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#8e9aad" }}
                  tickFormatter={(v) => `$${v}k`}
                />
                <Tooltip
                  formatter={(v, n) => [
                    `$${Number(v ?? 0)}k`,
                    String(n).replace(/^./, (c) => c.toUpperCase()),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#ceoRevGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={projectPerformance}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#eef1f5" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#8e9aad" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#8e9aad" }}
                />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="onHold"
                  name="On hold"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </article>

        {/* Donut chart */}
        <article className="panel ceo2-chart-donut">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PORTFOLIO</span>
              <h2>Project status</h2>
              <p>Current distribution across all projects.</p>
            </div>
          </div>
          <div className="ceo2-donut-wrap">
            <ResponsiveContainer width="100%" height={175}>
              <PieChart>
                <Pie
                  data={projectStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {projectStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="ceo2-donut-center">
              <strong>{projects.length}</strong>
              <span>total</span>
            </div>
          </div>
          <div className="ceo2-donut-legend">
            {projectStatus.slice(0, 4).map((entry) => (
              <div key={entry.name}>
                <i style={{ background: entry.color }} />
                <span>{entry.name}</span>
                <b>{entry.value}</b>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* ── Project portfolio table ── */}
      <article className="panel ceo2-portfolio">
        <SectionHead
          eyebrow="PROJECT PORTFOLIO"
          title="Live projects"
          action="View all"
          onAction={() => onNavigate("Projects")}
        />
        <p className="ceo2-portfolio-note">
          Projects are read-only for the CEO. Click any row to view full
          details and approvals.
        </p>
        <ProjectTable
          projects={projects}
          onSelect={onSelect}
          showStartDate={true}
        />
      </article>

      {/* ── Bottom grid: attendance + resources ── */}
      <div className="ceo2-bottom-grid">
        {/* Attendance */}
        <article className="panel ceo2-attendance">
          <SectionHead
            eyebrow="PEOPLE & ATTENDANCE"
            title="Today's attendance"
            action="Open"
            onAction={() => onNavigate("Employees")}
          />
          <div className="ceo2-attendance-summary">
            <div className="ceo2-att-chip ceo2-att-present">
              <strong>{present}</strong>
              <span>Present</span>
            </div>
            <div className="ceo2-att-chip ceo2-att-absent">
              <strong>{absent}</strong>
              <span>Absent</span>
            </div>
            <div className="ceo2-att-chip ceo2-att-late">
              <strong>{late}</strong>
              <span>Late</span>
            </div>
          </div>
          <div className="ceo2-attendance-list">
            {attendanceToday.map((person) => (
              <div className="ceo2-att-row" key={person.name}>
                <span
                  className={
                    "ceo2-att-dot ceo2-att-dot-" +
                    person.status.toLowerCase()
                  }
                />
                <div className="ceo2-att-info">
                  <strong>{person.name}</strong>
                  <small>{person.department}</small>
                </div>
                <span
                  className={
                    "status-pill " + person.status.toLowerCase()
                  }
                >
                  {person.status}
                </span>
                <time>{person.time}</time>
              </div>
            ))}
          </div>
        </article>

        {/* Resource utilization */}
        <article className="panel ceo2-resources">
          <SectionHead
            eyebrow="FLEET & EQUIPMENT"
            title="Resource utilization"
          />
          <div className="ceo2-resource-rings">
            <div className="ceo2-ring-item">
              <div
                className="ceo2-ring"
                style={
                  {
                    "--pct": "72",
                    "--color": "#2563eb",
                  } as React.CSSProperties
                }
              >
                <strong>72%</strong>
              </div>
              <div>
                <span>OB Van utilization</span>
                <small>2 active · 2 deployed · 1 maintenance</small>
              </div>
            </div>
            <div className="ceo2-ring-item">
              <div
                className="ceo2-ring"
                style={
                  {
                    "--pct": "64",
                    "--color": "#6657d8",
                  } as React.CSSProperties
                }
              >
                <strong>64%</strong>
              </div>
              <div>
                <span>Equipment utilization</span>
                <small>43 available · 18 reserved · 6 maintenance</small>
              </div>
            </div>
          </div>
          <div className="ceo2-van-list">
            <div className="ceo2-van-row">
              <span className="ceo2-van-icon">
                <Truck size={13} />
              </span>
              <div>
                <strong>OB Van 01</strong>
                <small>Deployed · UNDP Project</small>
              </div>
              <span className="status-pill in-progress">Active</span>
            </div>
            <div className="ceo2-van-row">
              <span className="ceo2-van-icon">
                <Truck size={13} />
              </span>
              <div>
                <strong>OB Van 04</strong>
                <small>Deployed · Sports Coverage</small>
              </div>
              <span className="status-pill in-progress">Active</span>
            </div>
            <div className="ceo2-van-row">
              <span
                className="ceo2-van-icon"
                style={{ background: "#fff3e0", color: "#d97706" }}
              >
                <Truck size={13} />
              </span>
              <div>
                <strong>OB Van 02</strong>
                <small>Under maintenance</small>
              </div>
              <span className="status-pill rejected">Maintenance</span>
            </div>
          </div>
        </article>

        {/* Notifications panel */}
        <article className="panel ceo2-notifications">
          <SectionHead
            eyebrow="ALERTS & NOTIFICATIONS"
            title="Pending items"
            action="View all"
            onAction={() => onNavigate("Notifications")}
          />
          {notifications.length === 0 ? (
            <div className="ceo2-notif-empty">
              <CheckCircle2 size={22} />
              <span>All caught up</span>
            </div>
          ) : (
            <div className="ceo2-notif-list">
              {notifications.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  className="ceo2-notif-row"
                  onClick={() =>
                    onNavigate(
                      n.kind === "Project approval"
                        ? "Project Approvals"
                        : n.kind === "Quotation" || n.kind === "Invoice"
                        ? "Finance"
                        : "Projects",
                    )
                  }
                >
                  <span
                    className="ceo2-notif-dot"
                    style={{
                      background:
                        n.kind === "Project approval"
                          ? "#2563eb"
                          : n.kind === "Quotation"
                          ? "#6657d8"
                          : "#f59e0b",
                    }}
                  />
                  <div className="ceo2-notif-body">
                    <strong>{n.title}</strong>
                    <small>{n.detail}</small>
                  </div>
                  <time>{n.time}</time>
                  <ArrowUpRight size={13} className="ceo2-notif-arrow" />
                </button>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
