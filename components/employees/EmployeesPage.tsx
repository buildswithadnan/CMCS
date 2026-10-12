"use client";

import React, { useState } from "react";
import { Activity, CalendarDays, CheckCircle2, Users } from "lucide-react";
import { Project } from "../../lib/types";
import { employeeAttendance, formatDate } from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";

export function EmployeesPage({ projects }: { projects: Project[] }) {
  const [from, setFrom] = useState("2026-10-07");
  const [to, setTo] = useState("2026-10-11");
  const [employee, setEmployee] = useState("All");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");

  const employees = employeeAttendance.filter(
    (item) =>
      (employee === "All" || item.employee === employee) &&
      (department === "All" || item.department === department),
  );

  const records = employees.flatMap((item) =>
    item.records
      .filter(
        (record) =>
          record.date >= from &&
          record.date <= to &&
          (status === "All" || record.status === status),
      )
      .map((record) => ({
        ...record,
        employee: item.employee,
        department: item.department,
      })),
  );

  const completedProjects = employeeAttendance.reduce(
    (total, item) => total + item.completedProjects,
    0,
  );

  const completionRate = projects.length
    ? Math.round(
        projects.reduce((total, item) => total + item.progress, 0) /
          projects.length,
      )
    : 0;

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="PEOPLE / EMPLOYEES"
        title="Employees"
        copy="Review employee attendance history and project completion performance."
      />
      <section className="stat-grid">
        <StatCard
          label="Employees tracked"
          value={String(employeeAttendance.length)}
          icon={Users}
        />
        <StatCard
          label="Completed projects"
          value={String(completedProjects)}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Overall project completion"
          value={`${completionRate}%`}
          icon={Activity}
          tone="indigo"
        />
        <StatCard
          label="Attendance records"
          value={String(records.length)}
          icon={CalendarDays}
          tone="purple"
        />
      </section>
      <div className="panel employee-filters">
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          Employee
          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          >
            <option>All</option>
            {employeeAttendance.map((item) => (
              <option key={item.employee}>{item.employee}</option>
            ))}
          </select>
        </label>
        <label>
          Department
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>All</option>
            {Array.from(
              new Set(employeeAttendance.map((item) => item.department)),
            ).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Attendance status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>
        </label>
      </div>
      <div className="panel employee-history">
        <div className="panel-heading">
          <div>
            <h2>Complete attendance history</h2>
            <p>{records.length} records match the selected filters.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Attendance</th>
                <th>Time</th>
                <th>Completed projects</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.employee}-${record.date}`}>
                  <td>{formatDate(record.date)}</td>
                  <td>
                    <strong>{record.employee}</strong>
                  </td>
                  <td>{record.department}</td>
                  <td>
                    <span
                      className={"status-pill " + record.status.toLowerCase()}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td>{record.time}</td>
                  <td>
                    {employeeAttendance.find(
                      (item) => item.employee === record.employee,
                    )?.completedProjects ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!records.length && (
            <div className="empty-state">
              <CalendarDays size={28} />
              <h3>No attendance records found</h3>
              <p>Adjust the date range or employee filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
