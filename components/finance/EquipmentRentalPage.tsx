"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  X,
  Calendar,
  DollarSign,
  Edit2,
  Eye,
  TrendingUp,
} from "lucide-react";
import {
  Project,
  EquipmentRental,
  EquipmentRentalHistory,
  PaymentStatus,
} from "../../lib/types";
import { PageHeader } from "../common/PageHeader";

// Mock data for equipment rentals
const mockEquipmentRentals: EquipmentRental[] = [
  {
    id: "EQR-001",
    equipmentName: "Sony FX6 Cinema Camera",
    category: "Camera",
    projectId: "PRJ-2026-0042",
    project: "UNDP Community Awareness Campaign",
    rentalProvider: "Pro Cinema Rentals",
    rentalCost: 45000,
    rentalStartDate: "2026-10-10",
    rentalEndDate: "2026-10-20",
    paymentStatus: "Paid",
    paidAmount: 45000,
    quantity: 2,
    history: [
      {
        date: "2026-10-09",
        action: "Payment Completed",
        amount: 45000,
        actor: "Finance Manager",
      },
    ],
  },
  {
    id: "EQR-002",
    equipmentName: "DJI Ronin 4D Gimbal",
    category: "Stabilization",
    projectId: "PRJ-2026-0036",
    project: "Herat Cultural Heritage Series",
    rentalProvider: "Motion Tech Equipment",
    rentalCost: 28000,
    rentalStartDate: "2026-10-12",
    rentalEndDate: "2026-10-25",
    paymentStatus: "Partially Paid",
    paidAmount: 14000,
    quantity: 1,
    history: [
      {
        date: "2026-10-11",
        action: "Partial Payment",
        amount: 14000,
        actor: "Finance Manager",
        note: "50% deposit paid",
      },
    ],
  },
  {
    id: "EQR-003",
    equipmentName: "Aputure 600D Pro LED Light",
    category: "Lighting",
    projectId: "PRJ-2026-0045",
    project: "National Election Coverage",
    rentalProvider: "Kabul Lighting Services",
    rentalCost: 35000,
    rentalStartDate: "2026-10-15",
    rentalEndDate: "2026-10-30",
    paymentStatus: "Unpaid",
    paidAmount: 0,
    quantity: 4,
  },
  {
    id: "EQR-004",
    equipmentName: "Sennheiser Wireless Mic System",
    category: "Audio",
    projectId: "PRJ-2026-0052",
    project: "Women in Media Forum Documentary",
    rentalProvider: "Audio Pro Kabul",
    rentalCost: 18000,
    rentalStartDate: "2026-10-08",
    rentalEndDate: "2026-10-22",
    paymentStatus: "Paid",
    paidAmount: 18000,
    quantity: 3,
    history: [
      {
        date: "2026-10-07",
        action: "Payment Completed",
        amount: 18000,
        actor: "Finance Manager",
      },
    ],
  },
  {
    id: "EQR-005",
    equipmentName: "Production Van with Driver",
    category: "Transportation",
    projectId: "PRJ-2026-0031",
    project: "Youth Media Training Series",
    rentalProvider: "Kabul Transport Solutions",
    rentalCost: 65000,
    rentalStartDate: "2026-10-05",
    rentalEndDate: "2026-10-19",
    paymentStatus: "Partially Paid",
    paidAmount: 32500,
    quantity: 1,
    notes: "Includes fuel and driver",
    history: [
      {
        date: "2026-10-04",
        action: "Partial Payment",
        amount: 32500,
        actor: "Finance Manager",
        note: "Initial payment - 50%",
      },
    ],
  },
];

function EquipmentRentalDialog({
  rental,
  projects,
  onClose,
  onSave,
  mode,
}: {
  rental: EquipmentRental | null;
  projects: Project[];
  onClose: () => void;
  onSave: (rental: EquipmentRental) => void;
  mode: "add" | "edit" | "view";
}) {
  const [formData, setFormData] = useState<EquipmentRental>(
    rental || {
      id: "",
      equipmentName: "",
      category: "",
      projectId: "",
      project: "",
      rentalProvider: "",
      rentalCost: 0,
      rentalStartDate: "",
      rentalEndDate: "",
      paymentStatus: "Unpaid",
      paidAmount: 0,
      quantity: 1,
      notes: "",
      history: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return;

    const selectedProject = projects.find((p) => p.id === formData.projectId);
    const newRental: EquipmentRental = {
      ...formData,
      id: rental?.id || `EQR-${Date.now()}`,
      project: selectedProject?.name || "",
      history: [
        ...(formData.history || []),
        {
          date: new Date().toISOString().split("T")[0],
          action: rental ? "Updated" : "Created",
          actor: "Finance Manager",
        },
      ],
    };

    onSave(newRental);
  };

  const isView = mode === "view";
  const rentalDays = useMemo(() => {
    if (!formData.rentalStartDate || !formData.rentalEndDate) return 0;
    const start = new Date(formData.rentalStartDate);
    const end = new Date(formData.rentalEndDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [formData.rentalStartDate, formData.rentalEndDate]);

  return (
    <div className="dialog-backdrop">
      <div className="dialog" style={{ maxWidth: "680px" }}>
        <div className="dialog-head">
          <div>
            <span className="eyebrow">
              {mode === "add"
                ? "ADD EQUIPMENT RENTAL"
                : mode === "edit"
                  ? "EDIT RENTAL"
                  : "RENTAL DETAILS"}
            </span>
            <h2>{formData.equipmentName || "New Equipment Rental"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <label>
            Equipment Name *
            <input
              type="text"
              value={formData.equipmentName}
              onChange={(e) =>
                setFormData({ ...formData, equipmentName: e.target.value })
              }
              placeholder="e.g. Sony FX6 Cinema Camera"
              required
              disabled={isView}
            />
          </label>

          <label>
            Category *
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              disabled={isView}
            >
              <option value="">Select category</option>
              <option value="Camera">Camera</option>
              <option value="Lighting">Lighting</option>
              <option value="Audio">Audio</option>
              <option value="Stabilization">Stabilization</option>
              <option value="Transportation">Transportation</option>
              <option value="Grip">Grip Equipment</option>
              <option value="Other">Other</option>
            </select>
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
            Rental Provider *
            <input
              type="text"
              value={formData.rentalProvider}
              onChange={(e) =>
                setFormData({ ...formData, rentalProvider: e.target.value })
              }
              placeholder="Provider company name"
              required
              disabled={isView}
            />
          </label>

          <label>
            Quantity *
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Number(e.target.value) })
              }
              required
              disabled={isView}
              min="1"
            />
          </label>

          <label>
            Rental Cost (AFN) *
            <input
              type="number"
              value={formData.rentalCost}
              onChange={(e) =>
                setFormData({ ...formData, rentalCost: Number(e.target.value) })
              }
              required
              disabled={isView}
              min="0"
            />
          </label>

          <label>
            Start Date *
            <input
              type="date"
              value={formData.rentalStartDate}
              onChange={(e) =>
                setFormData({ ...formData, rentalStartDate: e.target.value })
              }
              required
              disabled={isView}
            />
          </label>

          <label>
            End Date *
            <input
              type="date"
              value={formData.rentalEndDate}
              onChange={(e) =>
                setFormData({ ...formData, rentalEndDate: e.target.value })
              }
              required
              disabled={isView}
              min={formData.rentalStartDate}
            />
          </label>

          {rentalDays > 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "12px",
                background: "#f0f6ff",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#1d4ed8",
              }}
            >
              <strong>Rental Duration:</strong> {rentalDays} days
            </div>
          )}

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
                max={formData.rentalCost}
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
              placeholder="Additional details about the rental..."
            />
          </label>

          {isView && formData.history && formData.history.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <h3 style={{ fontSize: "14px", marginBottom: "12px" }}>
                Rental History
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
                    <div
                      style={{ marginTop: "4px", fontSize: "11px", color: "#94a3b8" }}
                    >
                      By: {h.actor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dialog-actions" style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              {isView ? "Close" : "Cancel"}
            </button>
            {!isView && (
              <button type="submit" className="button button-primary">
                <Package size={14} />
                {mode === "add" ? "Add Rental" : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function EquipmentRentalPage({
  projects,
  onNotify,
}: {
  projects: Project[];
  onNotify: (message: string) => void;
}) {
  const [rentals, setRentals] = useState<EquipmentRental[]>(mockEquipmentRentals);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedRental, setSelectedRental] = useState<EquipmentRental | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view" | null>(null);

  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      const matchesSearch =
        rental.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.rentalProvider.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || rental.paymentStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || rental.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [rentals, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = rentals.reduce((sum, r) => sum + r.rentalCost, 0);
    const paid = rentals
      .filter((r) => r.paymentStatus === "Paid")
      .reduce((sum, r) => sum + r.rentalCost, 0);
    const unpaid = rentals
      .filter((r) => r.paymentStatus === "Unpaid")
      .reduce((sum, r) => sum + r.rentalCost, 0);
    const partial = rentals
      .filter((r) => r.paymentStatus === "Partially Paid")
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    return {
      total,
      paid,
      unpaid,
      partial,
      count: rentals.length,
      paidCount: rentals.filter((r) => r.paymentStatus === "Paid").length,
      unpaidCount: rentals.filter((r) => r.paymentStatus === "Unpaid").length,
      partialCount: rentals.filter((r) => r.paymentStatus === "Partially Paid")
        .length,
    };
  }, [rentals]);

  const categories = useMemo(() => {
    const cats = new Set(rentals.map((r) => r.category));
    return ["All", ...Array.from(cats).sort()];
  }, [rentals]);

  const handleSave = (rental: EquipmentRental) => {
    if (dialogMode === "add") {
      setRentals([...rentals, rental]);
      onNotify(`Equipment rental ${rental.id} added successfully`);
    } else {
      setRentals(rentals.map((r) => (r.id === rental.id ? rental : r)));
      onNotify(`Equipment rental ${rental.id} updated successfully`);
    }
    setDialogMode(null);
    setSelectedRental(null);
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
        eyebrow="FINANCE / EQUIPMENT RENTAL"
        title="Equipment Rentals"
        copy="Track and manage rented equipment for projects, including costs and payment status."
      />

      {/* Summary Stats */}
      <div className="invoice-summary-grid" style={{ marginBottom: "20px" }}>
        <div className="invoice-summary-card">
          <span>Total Rentals</span>
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
              placeholder="Search equipment..."
            />
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "7px",
              fontSize: "13px",
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PaymentStatus | "All")
            }
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
            setSelectedRental(null);
            setDialogMode("add");
          }}
        >
          <Plus size={14} />
          Add Rental
        </button>
      </div>

      {/* Equipment Rentals Table */}
      <div className="panel invoice-table-panel">
        <div className="table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Equipment</th>
                <th>Project</th>
                <th>Provider</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.map((rental) => {
                const start = new Date(rental.rentalStartDate);
                const end = new Date(rental.rentalEndDate);
                const days = Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr key={rental.id}>
                    <td>
                      <span
                        className="invoice-link"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedRental(rental);
                          setDialogMode("view");
                        }}
                      >
                        <Package size={14} />
                        {rental.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong style={{ fontSize: "12px" }}>
                          {rental.equipmentName}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {rental.category} × {rental.quantity}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: "180px" }}>
                        <strong style={{ fontSize: "12px" }}>
                          {rental.project}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {rental.projectId}
                        </div>
                      </div>
                    </td>
                    <td>{rental.rentalProvider}</td>
                    <td>
                      <div>
                        <strong style={{ fontSize: "12px" }}>{days} days</strong>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {formatDate(rental.rentalStartDate)} -{" "}
                          {formatDate(rental.rentalEndDate)}
                        </div>
                      </div>
                    </td>
                    <td className="invoice-amount">
                      {formatCurrency(rental.rentalCost)}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${rental.paymentStatus
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {rental.paymentStatus}
                      </span>
                      {rental.paymentStatus === "Partially Paid" && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "4px",
                          }}
                        >
                          Paid: {formatCurrency(rental.paidAmount || 0)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="invoice-actions">
                        <button
                          className="invoice-action-button"
                          style={{
                            background: "#f0f6ff",
                            color: "#1d4ed8",
                          }}
                          onClick={() => {
                            setSelectedRental(rental);
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
                            setSelectedRental(rental);
                            setDialogMode("edit");
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRentals.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#94a3b8",
                    }}
                  >
                    No equipment rental records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {dialogMode && (
        <EquipmentRentalDialog
          rental={selectedRental}
          projects={projects}
          onClose={() => {
            setDialogMode(null);
            setSelectedRental(null);
          }}
          onSave={handleSave}
          mode={dialogMode}
        />
      )}
    </>
  );
}
