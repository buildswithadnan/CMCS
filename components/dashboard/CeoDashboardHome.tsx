"use client";

import React, { useState } from "react";
import {
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
  WalletCards,
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
import { PageHeader } from "../common/PageHeader";
import { ProjectTable } from "../projects/ProjectTable";

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
  const [financeView, setFinanceView] = useState<"Revenue" | "Projects">(
    "Revenue",
  );
  const [refreshed, setRefreshed] = useState(false);

  const metrics = ceoKpis[period];
  const present = attendanceToday.filter((p) => p.status === "Present").length;
  const absent = attendanceToday.length - present;

  const kpis = [
    [
      "Total Projects",
      projects.length.toString(),
      "+12.5%",
      ClipboardList,
      "default",
    ],
    [
      "Active Projects",
      projects.filter((p) => p.status === "In Progress").length.toString(),
      "+8.4%",
      Clock3,
      "info",
    ],
    [
      "Upcoming Projects",
      projects.filter((p) => p.status === "Upcoming").length.toString(),
      "+16.2%",
      CalendarDays,
      "success",
    ],
    [
      "Completed",
      projects.filter((p) => p.status === "Completed").length.toString(),
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
    <section className="page-section ceo-content">
      {/* Executive Header */}
      <div className="ceo-dashboard-head">
        <div>
          <PageHeader
            eyebrow="EXECUTIVE CONTROL CENTRE"
            title="Good morning, Ahmad"
            copy="Real-time strategic overview of CMCS media operations, budgets, and personnel."
          />
        </div>
        <div className="ceo-head-actions">
          <button
            className="button button-secondary"
            onClick={() => {
              setRefreshed(true);
              setTimeout(() => setRefreshed(false), 800);
            }}
          >
            <RefreshCw size={14} className={refreshed ? "spin-once" : ""} />{" "}
            Refresh
          </button>
          <div className="ceo-head-date">
            <CalendarDays size={16} /> 12 October 2026
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip for Approvals */}
      <div className="approval-notice" style={{ marginBottom: "1.25rem" }}>
        <Bell size={18} />
        <div>
          <strong>Executive Direct Actions:</strong>
          <span> Review submissions requiring CEO authorization.</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button
            className="button button-primary"
            style={{ fontSize: "12px", padding: "6px 12px" }}
            onClick={() => onNavigate("Project Approvals")}
          >
            Review Project Submissions
          </button>
          <button
            className="button button-secondary"
            style={{ fontSize: "12px", padding: "6px 12px" }}
            onClick={() => onNavigate("Finance")}
          >
            Review Quotations
          </button>
        </div>
      </div>

      {/* Period Selection Bar */}
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

      {/* Executive KPI Grid */}
      <section className="ceo-kpis">
        {kpis.map(([label, value, change, KpiIcon, tone]) => (
          <article className={"ceo-kpi " + tone} key={label}>
            <div>
              <span>{label}</span>
              <KpiIcon size={18} />
            </div>
            <strong>{value}</strong>
            <small className={tone === "warning" ? "attention" : ""}>
              {change} <span>vs previous period</span>
            </small>
          </article>
        ))}
      </section>

      {/* Main Analytics Charts */}
      <section className="ceo-chart-grid">
        <article className="ceo-panel chart-large">
          <div className="panel-heading">
            <div>
              <h2>Revenue & Delivery Overview</h2>
              <p>Financial and production trajectory (USD thousands).</p>
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
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f41bb" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#1f41bb" stopOpacity={0} />
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
                  tickFormatter={(val) => `$${val}k`}
                />
                <Tooltip
                  formatter={(val, name) => [
                    `$${Number(val ?? 0)}k`,
                    String(name).replace(/^./, (c) => c.toUpperCase()),
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

        {/* Project Status Donut */}
        <article className="ceo-panel chart-status">
          <div className="panel-heading">
            <div>
              <h2>Project Status</h2>
              <p>Portfolio distribution</p>
            </div>
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
              <strong>{projects.length}</strong>
              <span>Total projects</span>
            </div>
          </div>
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

      {/* Live Project Portfolio (with Start Date column) */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Project Portfolio</h2>
            <p>
              Projects are read-only for the CEO. Click to view full details and approvals.
            </p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("Projects")}
          >
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <ProjectTable projects={projects} onSelect={onSelect} showStartDate={true} />
      </section>

      {/* Attendance & Fleet Utilization Grid */}
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Attendance Today</h2>
              <p>
                {present} present · {absent} absent · 12 October 2026
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Employees")}
            >
              Open attendance <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="attendance-summary">
            <div>
              <strong>{present}</strong>
              <span>Present</span>
            </div>
            <div>
              <strong>{absent}</strong>
              <span>Absent</span>
            </div>
          </div>
          <div className="ceo-attendance-list">
            {attendanceToday.map((person) => (
              <div className="ceo-attendance-row" key={person.name}>
                <span
                  className={"attendance-dot " + person.status.toLowerCase()}
                />
                <strong>{person.name}</strong>
                <small>{person.department}</small>
                <span className={"status-pill " + person.status.toLowerCase()}>
                  {person.status}
                </span>
                <time>{person.time}</time>
              </div>
            ))}
          </div>
        </article>

        {/* Fleet & Resource Rings */}
        <article className="ceo-panel">
          <div className="panel-heading">
            <div>
              <h2>Resource & Fleet Utilization</h2>
              <p>Outside Broadcast (OB) Vans and technical gear</p>
            </div>
          </div>
          <div className="resource-rings">
            <div>
              <div className="ring van">
                <strong>72%</strong>
              </div>
              <span>OB Van utilization</span>
              <small>2 active · 2 deployed · 1 maintenance</small>
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
    </section>
  );
}
