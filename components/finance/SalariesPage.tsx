"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Search,
  Plus,
  X,
  Calendar,
  User,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2,
  Eye,
} from "lucide-react";
import { Project, Salary, SalaryHistory, PaymentStatus } from "../../lib/types";
import { PageHeader } from "../common/PageHeader";

// Mock data for salaries
const mockSalaries: Salary[] = [
  {
    id: "SAL-001",
    employeeName: "Hafizullah Khan",
    employeeId: "EMP-001",
    projectId: "PRJ-2026-0042",
    project: "UNDP Community Awareness Campaign",
    role: "Director of Photography",
    amount: 85000,
    paymentStatus: "Paid",
    paymentDate: "2026-10-15",
    paidAmount: 85000,
    history: [
      {
        date: "2026-10-15",
        action: "Payment Completed",
        amount: 85000,
        actor: "Finance Manager",
      },
    ],
  },
  {
    id: "SAL-002",
    employeeName: "Ahmad Rahimi",
    employeeId: "EMP-002",
    projectId: "PRJ-2026-0036",
    project: "Herat Cultural Heritage Series",
    role: "Camera Operator",
    amount: 65000,
    paymentStatus: "Partially Paid",
    paymentDate: "2026-10-20",
    paidAmount: 32500,
    history: [
      {
        date: "2026-10-10",
        action: "Partial Payment",
        amount: 32500,
        actor: "Finance Manager",
        note: "50% advance payment",
      },
    ],
  },
  {
    id: "SAL-003",
    employeeName: "Wali Khan",
    employeeId: "EMP-003",
    projectId: "PRJ-2026-0045",
    project: "National Election Coverage",
    role: "Field Producer",
    amount: 95000,
    paymentStatus: "Unpaid",
    paymentDate: "2026-10-25",
    paidAmount: 0,
  },
  {
    id: "SAL-004",
    employeeName: "Zainab Ahmad",
    employeeId: "EMP-004",
    projectId: "PRJ-2026-0052",
    project: "Women in Media Forum Documentary",
    role: "Editor",
    amount: 70000,
    paymentStatus: "Paid",
    paymentDate: "2026-10-12",
    paidAmount: 70000,
    history: [
      {
        date: "2026-10-12",
        action: "Payment Completed",
        amount: 70000,
        actor: "Finance Manager",
      },
    ],
  },
  {
    id: "SAL-005",
    employeeName: "Shoaib Ahmad",
    employeeId: "EMP-005",
    projectId: "PRJ-2026-0031",
    project: "Youth Media Training Series",
    role: "Sound Engineer",
    amount: 55000,
    paymentStatus: "Unpaid",
    paymentDate: "2026-10-28",
    paidAmount: 0,
  },
];

function SalaryDialog({
  salary,
  projects,
  onClose,
  onSave,
  mode,
}: {
  salary: Salary | null;
  projects: Project[];
  onClose: () => void;
  onSave: (salary: Salary) => void;
  mode: "add" | "edit" | "view";
}) {
  const [formData, setFormData] = useState<Salary>(
    salary || {
      id: "",
      employeeName: "",
      employeeId: "",
      projectId: "",
      project: "",
      role: "",
      amount: 0,
      paymentStatus: "Unpaid",
      paymentDate: "",
      paidAmount: 0,
      notes: "",
      history: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return;

    const selectedProject = projects.find((p) => p.id === formData.projectId);
    const newSalary: Salary = {
      ...formData,
      id: salary?.id || `SAL-${Date.now()}`,
      project: selectedProject?.name || "",
      history: [
        ...(formData.history || []),
        {
          date: new Date().toISOString().split("T")[0],
          action: salary ? "Updated" : "Created",
          amount: formData.amount,
          actor: "Finance Manager",
        },
      ],
    };

    onSave(newSalary);
  };

  const isView = mode === "view";

  return (
    <div className="dialog-backdrop">
      <div className="dialog" style={{ maxWidth: "680px" }}>
        <div className="dialog-head">
          <div>
            <span className="eyebrow">
              {mode === "add" ? "ADD NEW SALARY" : mode === "edit" ? "EDIT SALARY" : "SALARY DETAILS"}
            </span>
            <h2>{formData.employeeName || "New Salary Record"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <label>
            Employee Name *
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) =>
                setFormData({ ...formData, employeeName: e.target.value })
              }
              required
              disabled={isView}
            />
          </label>

          <label>
            Employee ID *
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              required
              disabled={isView}
            />
          </label>

          <label>
            Project *
            <select
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
              required
              disabled={isView}
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </label>

          <label>
            Assigned Role *
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Director, Camera Operator"
              required
              disabled={isView}
            />
          </label>

          <label>
            Salary Amount (AFN) *
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) })
              }
              required
              disabled={isView}
              min="0"
            />
          </label>

          <label>
            Payment Status *
            <select
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentStatus: e.target.value as PaymentStatus,
                })
              }
              required
              disabled={isView}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
            </select>
          </label>

          <label>
            Payment Date *
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) =>
                setFormData({ ...formData, paymentDate: e.target.value })
              }
              required
              disabled={isView}
            />
          </label>

          {formData.paymentStatus === "Partially Paid" && (
            <label>
              Paid Amount (AFN)
              <input
                type="number"
                value={formData.paidAmount || 0}
                onChange={(e) =>
                  setFormData({ ...formData, paidAmount: Number(e.target.value) })
                }
                disabled={isView}
                min="0"
                max={formData.amount}
              />
            </label>
          )}

          <label style={{ gridColumn: "1 / -1" }}>
            Notes
            <textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              disabled={isView}
            />
          </label>

          {isView && formData.history && formData.history.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <h3 style={{ fontSize: "14px", marginBottom: "12px" }}>
                Payment History
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {formData.history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{h.action}</strong>
                      <span style={{ color: "#64748b" }}>{h.date}</span>
                    </div>
                    {h.amount && (
                      <div style={{ marginTop: "4px", color: "#16a34a" }}>
                        Amount: {h.amount.toLocaleString()} AFN
                      </div>
                    )}
                    {h.note && (
                      <div style={{ marginTop: "4px", color: "#64748b" }}>
                        {h.note}
                      </div>
                    )}
                    <div style={{ marginTop: "4px", fontSize: "11px", color: "#94a3b8" }}>
                      By: {h.actor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dialog-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="button" className="button button-secondary" onClick={onClose}>
              {isView ? "Close" : "Cancel"}
            </button>
            {!isView && (
              <button type="submit" className="button button-primary">
                <DollarSign size={14} />
                {mode === "add" ? "Add Salary" : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function SalariesPage({
  projects,
  onNotify,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
}) {
  const [salaries, setSalaries] = useState<Salary[]>(mockSalaries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | null>(null);

  const filteredSalaries = useMemo(() => {
    return salaries.filter((salary) => {
      const matchesSearch =
        salary.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || salary.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [salaries, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = salaries.reduce((sum, s) => sum + s.amount, 0);
    const paid = salaries
      .filter((s) => s.paymentStatus === "Paid")
      .reduce((sum, s) => sum + s.amount, 0);
    const unpaid = salaries
      .filter((s) => s.paymentStatus === "Unpaid")
      .reduce((sum, s) => sum + s.amount, 0);
    const partial = salaries
      .filter((s) => s.paymentStatus === "Partially Paid")
      .reduce((sum, s) => sum + (s.paidAmount || 0), 0);

    return {
      total,
      paid,
      unpaid,
      partial,
      count: salaries.length,
      paidCount: salaries.filter((s) => s.paymentStatus === "Paid").length,
      unpaidCount: salaries.filter((s) => s.paymentStatus === "Unpaid").length,
      partialCount: salaries.filter((s) => s.paymentStatus === "Partially Paid")
        .length,
    };
  }, [salaries]);

  const handleSave = (salary: Salary) => {
    if (dialogMode === "add") {
      setSalaries([...salaries, salary]);
      onNotify(`Salary record ${salary.id} added successfully`);
    } else {
      setSalaries(salaries.map((s) => (s.id === salary.id ? salary : s)));
      onNotify(`Salary record ${salary.id} updated successfully`);
    }
    setDialogMode(null);
    setSelectedSalary(null);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} AFN`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="FINANCE / SALARIES"
        title="Employee Salaries"
        copy="Manage project-based employee salary payments and track payment history."
      />

      {/* Summary Stats */}
      <div className="invoice-summary-grid" style={{ marginBottom: "20px" }}>
        <div className="invoice-summary-card">
          <span>Total Salaries</span>
          <strong>{formatCurrency(stats.total)}</strong>
        </div>
        <div className="invoice-summary-card paid">
          <span>Paid ({stats.paidCount})</span>
          <strong>{formatCurrency(stats.paid)}</strong>
        </div>
        <div className="invoice-summary-card pending">
          <span>Unpaid ({stats.unpaidCount})</span>
          <strong>{formatCurrency(stats.unpaid)}</strong>
        </div>
        <div className="invoice-summary-card revision">
          <span>Partial ({stats.partialCount})</span>
          <strong>{formatCurrency(stats.partial)}</strong>
        </div>
      </div>

      {/* Toolbar */}
      <div className="invoice-toolbar">
        <div className="invoice-search-toolbar">
          <label className="invoice-search inline-search">
            <Search size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search salaries..."
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "All")}
            style={{
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "7px",
              fontSize: "13px",
            }}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
        <button
          className="button button-primary"
          onClick={() => {
            setSelectedSalary(null);
            setDialogMode("add");
          }}
        >
          <Plus size={14} />
          Add Salary
        </button>
      </div>

      {/* Salaries Table */}
      <div className="panel invoice-table-panel">
        <div className="table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Salary ID</th>
                <th>Employee</th>
                <th>Project</th>
                <th>Role</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalaries.map((salary) => (
                <tr key={salary.id}>
                  <td>
                    <span
                      className="invoice-link"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedSalary(salary);
                        setDialogMode("view");
                      }}
                    >
                      <DollarSign size={14} />
                      {salary.id}
                    </span>
                  </td>
                  <td>
                    <div>
                      <strong style={{ fontSize: "12px" }}>
                        {salary.employeeName}
                      </strong>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {salary.employeeId}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: "200px" }}>
                      <strong style={{ fontSize: "12px" }}>{salary.project}</strong>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {salary.projectId}
                      </div>
                    </div>
                  </td>
                  <td>{salary.role}</td>
                  <td className="invoice-amount">{formatCurrency(salary.amount)}</td>
                  <td>
                    <span
                      className={`status-pill ${salary.paymentStatus
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {salary.paymentStatus}
                    </span>
                    {salary.paymentStatus === "Partially Paid" && (
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                        Paid: {formatCurrency(salary.paidAmount || 0)}
                      </div>
                    )}
                  </td>
                  <td>{formatDate(salary.paymentDate)}</td>
                  <td>
                    <div className="invoice-actions">
                      <button
                        className="invoice-action-button"
                        style={{
                          background: "#f0f6ff",
                          color: "#1d4ed8",
                        }}
                        onClick={() => {
                          setSelectedSalary(salary);
                          setDialogMode("view");
                        }}
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        className="invoice-action-button"
                        style={{
                          background: "#fff7ed",
                          color: "#ea580c",
                        }}
                        onClick={() => {
                          setSelectedSalary(salary);
                          setDialogMode("edit");
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSalaries.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                    }}
                  >
                    No salary records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {dialogMode && (
        <SalaryDialog
          salary={selectedSalary}
          projects={projects}
          onClose={() => {
            setDialogMode(null);
            setSelectedSalary(null);
          }}
          onSave={handleSave}
          mode={dialogMode}
        />
      )}
    </>
  );
}
