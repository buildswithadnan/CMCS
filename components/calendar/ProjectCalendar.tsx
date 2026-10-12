"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { Project } from "../../lib/types";
import {
  dateKey,
  formatDate,
  money,
  parseDate,
  statusColors,
} from "../../lib/dummy-data/mock-data";

// ─────────────────────────────────────────
// Project Detail Modal sub-component
// ─────────────────────────────────────────
function ProjectDetailModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const pStart = parseDate(project.start);
  const pEnd   = parseDate(project.end);
  const dur = Math.max(1, Math.round((pEnd.getTime() - pStart.getTime()) / 86400000) + 1);
  const accentColor = statusColors[project.status] || "#2563eb";

  const FieldCard = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:"3px",
                  background:"#f8fafc", border:"1px solid #e2e8f0",
                  borderRadius:"10px", padding:"12px 14px" }}>
      <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase",
                     letterSpacing:"0.06em", color:"#94a3b8" }}>{label}</span>
      <span style={{ fontSize:"13px", fontWeight:600, color:"#1e293b",
                     wordBreak:"break-word" }}>{value}</span>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:9999,
               background:"rgba(15,23,42,0.5)",
               backdropFilter:"blur(4px)",
               display:"flex", alignItems:"center",
               justifyContent:"center", padding:"16px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background:"#fff", borderRadius:"16px", width:"100%",
                 maxWidth:"460px",
                 boxShadow:"0 24px 56px rgba(15,23,42,0.22),0 4px 16px rgba(15,23,42,0.1)",
                 overflow:"hidden" }}
      >
        {/* Header */}
        <div style={{ borderTop:`4px solid ${accentColor}`,
                      background:"#f8fafc", borderBottom:"1px solid #e2e8f0",
                      padding:"18px 20px 14px",
                      display:"flex", alignItems:"flex-start",
                      justifyContent:"space-between", gap:"12px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px", minWidth:0 }}>
            <span
              className={"status-pill " + project.status.toLowerCase().replace(" ", "-")}
              style={{ fontSize:"11px", alignSelf:"flex-start" }}
            >
              {project.status}
            </span>
            <h2 style={{ margin:0, fontSize:"16px", fontWeight:700,
                         color:"#0f172a", lineHeight:1.3, wordBreak:"break-word" }}>
              {project.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ flexShrink:0, display:"flex", alignItems:"center",
                     justifyContent:"center", width:"32px", height:"32px",
                     borderRadius:"8px", border:"1px solid #e2e8f0",
                     background:"#fff", cursor:"pointer", color:"#64748b" }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body grid */}
        <div style={{ padding:"18px 20px",
                      display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <FieldCard label="Project ID" value={project.id} />
          <FieldCard label="Client" value={project.client} />
          <FieldCard label="Project Lead" value={project.owner} />
          <FieldCard label="Department" value={project.department} />
          <FieldCard label="Budget" value={money(project.budget)} />
          <FieldCard label="Progress" value={`${project.progress}% complete`} />
          <div style={{ gridColumn:"1 / -1", display:"flex", flexDirection:"column",
                        gap:"3px", background:"#f8fafc", border:"1px solid #e2e8f0",
                        borderRadius:"10px", padding:"12px 14px" }}>
            <span style={{ fontSize:"10px", fontWeight:700, textTransform:"uppercase",
                           letterSpacing:"0.06em", color:"#94a3b8" }}>Timeline</span>
            <span style={{ fontSize:"13px", fontWeight:600, color:"#1e293b",
                           display:"flex", alignItems:"center", gap:"8px",
                           flexWrap:"wrap" }}>
              {formatDate(project.start)}&nbsp;→&nbsp;{formatDate(project.end)}
              <span style={{ fontSize:"11px", fontWeight:500, color:"#64748b",
                             background:"#e2e8f0", borderRadius:"20px",
                             padding:"1px 8px" }}>{dur} days</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"12px 20px 16px", borderTop:"1px solid #f1f5f9",
                      display:"flex", justifyContent:"flex-end" }}>
          <button className="button button-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export function ProjectCalendar({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
}) {
  // Date range filter state (start date & end date with day, month, year)
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-11-08");

  // Secondary filter state (Status only - Department removed per requirements)
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal: selected project for detail popup
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Preset date ranges for quick access
  const presets = [
    { label: "All Projects", start: "2026-10-01", end: "2026-11-15" },
    { label: "October 2026", start: "2026-10-01", end: "2026-10-31" },
    { label: "Oct – Nov 2026", start: "2026-10-01", end: "2026-11-15" },
    { label: "Q4 2026", start: "2026-10-01", end: "2026-12-31" },
    { label: "Next 30 Days", start: "2026-10-12", end: "2026-11-12" },
  ];

  // Dynamic project filtering: projects overlapping [startDate, endDate] and matching criteria
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Date range overlap check: project starts on or before range end AND ends on or after range start
      const inDateRange = p.start <= endDate && p.end >= startDate;
      const matchesStatus =
        statusFilter === "All" || p.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        `${p.name} ${p.client} ${p.owner} ${p.id}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return inDateRange && matchesStatus && matchesSearch;
    });
  }, [projects, startDate, endDate, statusFilter, searchQuery]);

  // Generate continuous timeline days between startDate and endDate
  const timelineDays = useMemo(() => {
    const days: Date[] = [];
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Guard: ensure start <= end
    if (start > end) return days;

    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

  // Group days by Month and Year for the top timeline header
  const monthGroups = useMemo(() => {
    if (!timelineDays.length) return [];

    const groups: Array<{
      key: string;
      label: string;
      count: number;
    }> = [];

    timelineDays.forEach((day) => {
      const label = day.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.label === label) {
        lastGroup.count += 1;
      } else {
        groups.push({
          key: `${day.getFullYear()}-${day.getMonth()}`,
          label,
          count: 1,
        });
      }
    });

    return groups;
  }, [timelineDays]);

  // Summary analytics in range
  const summary = useMemo(() => {
    const total = filteredProjects.length;
    const inProgress = filteredProjects.filter(
      (p) => p.status === "In Progress",
    ).length;
    const upcoming = filteredProjects.filter(
      (p) => p.status === "Upcoming",
    ).length;
    const totalBudget = filteredProjects.reduce(
      (acc, p) => acc + (p.budget || 0),
      0,
    );
    return { total, inProgress, upcoming, totalBudget };
  }, [filteredProjects]);

  // Cell width in pixels for Gantt day columns
  const cellWidth = 36;
  const todayKey = "2026-10-12";

  // Shift date range forward or backward
  function shiftDateRange(daysAmount: number) {
    const s = parseDate(startDate);
    const e = parseDate(endDate);
    s.setDate(s.getDate() + daysAmount);
    e.setDate(e.getDate() + daysAmount);
    setStartDate(dateKey(s));
    setEndDate(dateKey(e));
  }

  // Reset filters
  function resetFilters() {
    setStartDate("2026-10-01");
    setEndDate("2026-11-08");
    setStatusFilter("All");
    setSearchQuery("");
  }


  return (
    <>
    <section className="page-section">
      {/* Date Range & Criteria Filter Panel */}
      <div className="gantt-filter-card">
        <div className="gantt-filter-top">
          {/* Start Date & End Date Pickers */}
          <div className="gantt-date-inputs">
            <div className="gantt-input-group">
              <label>Timeline Start (Day / Month / Year)</label>
              <div className="gantt-date-field">
                <CalendarDays size={14} color="#2563eb" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next) setStartDate(next);
                  }}
                  aria-label="Start date"
                />
              </div>
            </div>

            <span className="gantt-date-divider">→</span>

            <div className="gantt-input-group">
              <label>Timeline End (Day / Month / Year)</label>
              <div className="gantt-date-field">
                <CalendarDays size={14} color="#2563eb" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next) setEndDate(next);
                  }}
                  aria-label="End date"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="gantt-presets">
            {presets.map((preset) => (
              <button
                key={preset.label}
                className={
                  "gantt-preset-btn " +
                  (startDate === preset.start && endDate === preset.end
                    ? "active"
                    : "")
                }
                onClick={() => {
                  setStartDate(preset.start);
                  setEndDate(preset.end);
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              className="gantt-preset-btn"
              onClick={resetFilters}
              title="Reset filters"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* Secondary Filter Controls */}
        <div className="gantt-filter-bottom">
          <div className="gantt-secondary-filters">
            <label className="gantt-select-filter">
              <Filter size={13} />
              Status:
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
          </div>

          <label className="inline-search">
            <Search size={14} />
            <input
              placeholder="Search project, client, or project lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="gantt-summary-banner">
        <div className="gantt-summary-card blue">
          <div className="gantt-summary-icon">
            <CalendarDays size={18} />
          </div>
          <div className="gantt-summary-info">
            <span>Scheduled Projects</span>
            <strong>{summary.total} projects</strong>
          </div>
        </div>

        <div className="gantt-summary-card indigo">
          <div className="gantt-summary-icon">
            <Clock3 size={18} />
          </div>
          <div className="gantt-summary-info">
            <span>Active in Range</span>
            <strong>{summary.inProgress} In Progress</strong>
          </div>
        </div>

        <div className="gantt-summary-card purple">
          <div className="gantt-summary-icon">
            <CheckCircle2 size={18} />
          </div>
          <div className="gantt-summary-info">
            <span>Upcoming Work</span>
            <strong>{summary.upcoming} Upcoming</strong>
          </div>
        </div>

        <div className="gantt-summary-card green">
          <div className="gantt-summary-icon">
            <DollarSign size={18} />
          </div>
          <div className="gantt-summary-info">
            <span>Production Budget</span>
            <strong>{money(summary.totalBudget)}</strong>
          </div>
        </div>
      </div>

      {/* Main Gantt / Calendar Container */}
      <div className="gantt-wrapper">
        {/* Toolbar */}
        <div className="gantt-toolbar">
          <div className="gantt-toolbar-left">
            <h3>Project Schedule Timeline</h3>
            <span className="gantt-badge">
              {timelineDays.length} days (
              {formatDate(startDate)} – {formatDate(endDate)})
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Range Navigation Controls */}
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                className="icon-button"
                onClick={() => shiftDateRange(-7)}
                title="Shift 1 week earlier"
                aria-label="Previous week"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                className="button button-secondary"
                style={{ fontSize: "11px", padding: "5px 10px" }}
                onClick={() => {
                  setStartDate("2026-10-01");
                  setEndDate("2026-10-31");
                }}
              >
                Current Month
              </button>
              <button
                className="icon-button"
                onClick={() => shiftDateRange(7)}
                title="Shift 1 week later"
                aria-label="Next week"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Gantt Chart Timeline */}
        <div className="gantt-scroll-canvas">
          <div className="gantt-chart-table">
            {/* Header Rows */}
            <div className="gantt-header">
              {/* Months Row */}
              <div className="gantt-header-row-months">
                <div className="gantt-col-fixed-header">
                  <span>PROJECT NAME</span>
                </div>
                <div className="gantt-months-container">
                  {monthGroups.map((group) => (
                    <div
                      key={group.key}
                      className="gantt-month-cell"
                      style={{
                        width: `${group.count * cellWidth}px`,
                        minWidth: `${group.count * cellWidth}px`,
                      }}
                    >
                      {group.label} ({group.count} days)
                    </div>
                  ))}
                </div>
              </div>

              {/* Days Row */}
              <div className="gantt-header-row-days">
                <div
                  className="gantt-col-fixed-header"
                  style={{ background: "#f1f5f9" }}
                >
                  <span style={{ fontSize: "10px", color: "#64748b" }}>
                    {filteredProjects.length} projects
                  </span>
                </div>
                <div className="gantt-days-container">
                  {timelineDays.map((day) => {
                    const k = dateKey(day);
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isToday = k === todayKey;
                    const dayName = day.toLocaleDateString("en-GB", {
                      weekday: "narrow",
                    });

                    return (
                      <div
                        key={k}
                        className={
                          "gantt-day-col-header " +
                          (isWeekend ? "weekend " : "") +
                          (isToday ? "today " : "")
                        }
                        title={`${day.toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}${isToday ? " (Today)" : ""}`}
                      >
                        <span className="gantt-day-name">{dayName}</span>
                        <span className="gantt-day-num">
                          {day.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="gantt-rows-container">
              {filteredProjects.map((project) => {
                const pStart = parseDate(project.start);
                const pEnd = parseDate(project.end);
                const rangeStart = parseDate(startDate);
                const rangeEnd = parseDate(endDate);

                // Calculate visible start and end clamped to current range
                const effectiveStart =
                  pStart < rangeStart ? rangeStart : pStart;
                const effectiveEnd = pEnd > rangeEnd ? rangeEnd : pEnd;

                // Day offsets
                const startOffsetDays = Math.max(
                  0,
                  Math.round(
                    (effectiveStart.getTime() - rangeStart.getTime()) /
                    (1000 * 60 * 60 * 24),
                  ),
                );
                const spanDays = Math.max(
                  1,
                  Math.round(
                    (effectiveEnd.getTime() - effectiveStart.getTime()) /
                    (1000 * 60 * 60 * 24),
                  ) + 1,
                );
                const totalProjectDays = Math.max(
                  1,
                  Math.round(
                    (pEnd.getTime() - pStart.getTime()) /
                    (1000 * 60 * 60 * 24),
                  ) + 1,
                );

                const barLeft = startOffsetDays * cellWidth;
                const barWidth = Math.max(spanDays * cellWidth - 6, 28);
                const color = statusColors[project.status] || "#2563eb";

                return (
                  <div className="gantt-row" key={project.id}>
                    {/* Fixed Left Project Info Column - Project Name Only */}
                    <div
                      className="gantt-row-project-info"
                      onClick={() =>
                        onSelect ? onSelect(project) : setSelectedProject(project)
                      }
                      title={`${project.name} — click to view details`}
                    >
                      <div className="gantt-proj-title-row">
                        <strong title={project.name}>{project.name}</strong>
                      </div>
                    </div>

                    {/* Timeline Track with Background Grid Cells & Horizontal Bar */}
                    <div className="gantt-timeline-track">
                      {/* Background day cells */}
                      <div className="gantt-track-bg">
                        {timelineDays.map((day) => {
                          const k = dateKey(day);
                          const isWeekend =
                            day.getDay() === 0 || day.getDay() === 6;
                          const isToday = k === todayKey;

                          return (
                            <div
                              key={k}
                              className={
                                "gantt-track-cell " +
                                (isWeekend ? "weekend " : "") +
                                (isToday ? "today " : "")
                              }
                            />
                          );
                        })}
                      </div>

                      {/* Horizontal Gantt Project Bar - name only */}
                      <div
                        className="gantt-bar-element"
                        style={{
                          left: `${barLeft + 3}px`,
                          width: `${barWidth}px`,
                          backgroundColor: color,
                        }}
                        onClick={() =>
                          onSelect ? onSelect(project) : setSelectedProject(project)
                        }
                        title={`${project.name} — click to view details`}
                      >
                        <div className="gantt-bar-content">
                          <span className="gantt-bar-name">{project.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!filteredProjects.length && (
                <div className="gantt-empty-notice">
                  <CalendarDays size={32} color="#94a3b8" />
                  <h4>No projects found in this date range</h4>
                  <p>
                    Try expanding your start and end date range or resetting
                    the filters.
                  </p>
                  <button
                    className="button button-secondary"
                    style={{ marginTop: "12px" }}
                    onClick={resetFilters}
                  >
                    Reset Date Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Legend Footer */}
        <div className="gantt-legend-strip">
          <div className="gantt-legend-items">
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>Status:</span>
            <div className="gantt-legend-item">
              <span
                className="gantt-legend-dot"
                style={{ background: statusColors["In Progress"] }}
              />
              <span>In Progress</span>
            </div>
            <div className="gantt-legend-item">
              <span
                className="gantt-legend-dot"
                style={{ background: statusColors["Upcoming"] }}
              />
              <span>Upcoming</span>
            </div>
            <div className="gantt-legend-item">
              <span
                className="gantt-legend-dot"
                style={{ background: statusColors["Completed"] }}
              />
              <span>Completed</span>
            </div>
          </div>

          <div>
            <span>Click any project bar to view details & assignments</span>
          </div>
        </div>
      </div>
    </section>
    {selectedProject && (
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    )}
  </>
  );
}
