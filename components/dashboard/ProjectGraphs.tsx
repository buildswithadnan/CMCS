import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Project } from "../../lib/types";

export function ProjectGraphs({ projects }: { projects: Project[] }) {
  const status = ["In Progress", "Upcoming", "Completed"].map((name) => ({
    name,
    projects: projects.filter((project) => project.status === name).length,
  }));
  const monthly = [
    { month: "May", projects: 8 },
    { month: "Jun", projects: 11 },
    { month: "Jul", projects: 9 },
    { month: "Aug", projects: 14 },
    { month: "Sep", projects: 12 },
    { month: "Oct", projects: projects.length },
  ];
  const completed = [
    { month: "May", completed: 5 },
    { month: "Jun", completed: 7 },
    { month: "Jul", completed: 6 },
    { month: "Aug", completed: 10 },
    { month: "Sep", completed: 8 },
    {
      month: "Oct",
      completed: projects.filter((project) => project.status === "Completed")
        .length,
    },
  ];
  const departments = Array.from(
    new Set(projects.map((project) => project.department)),
  ).map((department) => ({
    department,
    projects: projects.filter((project) => project.department === department)
      .length,
  }));

  return (
    <section className="project-graphs">
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Project status</h2>
            <p>Projects by current status.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={status}>
            <CartesianGrid vertical={false} stroke="#edf1f6" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="projects" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Monthly projects</h2>
            <p>Projects created each month.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={monthly}>
            <CartesianGrid vertical={false} stroke="#edf1f6" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="projects" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Completed projects</h2>
            <p>Completed projects by month.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={completed}>
            <CartesianGrid vertical={false} stroke="#edf1f6" />
            <XAxis dataKey="month" tick={{ fontSize: 9 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel simple-graph">
        <div className="panel-heading">
          <div>
            <h2>Department projects</h2>
            <p>Projects assigned by department.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={departments} layout="vertical">
            <CartesianGrid horizontal={false} stroke="#edf1f6" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
            <YAxis
              dataKey="department"
              type="category"
              width={75}
              tick={{ fontSize: 9 }}
            />
            <Tooltip />
            <Bar dataKey="projects" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}
