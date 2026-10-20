import React from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Project, Status } from "../../lib/types";
import { revenue, statusColors } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";
import { ProjectGraphs } from "./ProjectGraphs";
import { ProjectTable } from "../projects/ProjectTable";

export function DashboardHome({
  projects,
  onNavigate,
  onSelect,
  createLabel,
  showExecutiveInsights = true,
}: {
  projects: Project[];
  onNavigate: (s: string) => void;
  onSelect: (p: Project) => void;
  createLabel?: string;
  showExecutiveInsights?: boolean;
}) {
  const metrics = {
    total: projects.length,
    active: projects.filter((p) => p.status === "In Progress").length,
    upcoming: projects.filter((p) => p.status === "Upcoming").length,
    completed: projects.filter((p) => p.status === "Completed").length,
  };
  const pie = [
    { name: "In Progress", value: metrics.active },
    { name: "Upcoming", value: metrics.upcoming },
    { name: "Completed", value: metrics.completed },
  ];

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="WORKSPACE / OVERVIEW"
        title="Good morning"
        copy="Here is the latest pulse across your CMCS workspace."
        action={createLabel}
        onAction={() => onNavigate("Projects")}
      />
      <section className="stat-grid">
        <StatCard
          label="Total projects"
          value={String(metrics.total)}
          sub="All active & completed"
          icon={ClipboardList}
        />
        <StatCard
          label="In progress"
          value={String(metrics.active)}
          sub="Currently running"
          icon={Activity}
          tone="indigo"
        />
        <StatCard
          label="Upcoming"
          value={String(metrics.upcoming)}
          sub="Scheduled to start"
          icon={Clock3}
          tone="purple"
        />
        <StatCard
          label="Completed"
          value={String(metrics.completed)}
          sub="Successfully delivered"
          icon={CheckCircle2}
          tone="green"
        />
      </section>      {showExecutiveInsights && <ProjectGraphs projects={projects} />}
      {showExecutiveInsights && <section className="dashboard-grid">
        <article className="panel chart-panel wide">
          <div className="panel-heading">
            <div>
              <h2>Revenue vs expenses</h2>
              <p>Monthly performance in thousands (USD).</p>
            </div>
            <Download size={16} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenue}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#edf1f6"
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.12}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Project status</h2>
              <p>Current portfolio split.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={pie}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={78}
              >
                {pie.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={statusColors[entry.name as Status]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mini-legend">
            {pie.map((item) => (
              <span key={item.name}>
                <i style={{ background: statusColors[item.name as Status] }} />
                {item.name} <b>{item.value}</b>
              </span>
            ))}
          </div>
        </article>
      </section>}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Project portfolio</h2>
            <p>Click any project for details.</p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("Projects")}
          >
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <ProjectTable projects={projects.slice(0, 4)} onSelect={onSelect} />
      </section>
    </section>
  );
}
