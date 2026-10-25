"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileText,
  FilePlus,
  Hourglass,
  ListChecks,
  Plus,
  ReceiptText,
  Search,
  TrendingUp,
  Wallet,
  WalletCards,
  X,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Expense, Invoice, Payment, Project, Quotation } from "../../lib/types";
import {
  invoiceSeed,
  paymentSeed,
  projectsSeed,
  quotationSeed,
} from "../../lib/dummy-data/mock-data";

// ─── helpers ────────────────────────────────────────────────────────────────

const usd = (n: number) =>
  "$" +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const usdShort = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return usd(n);
};

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── static mock data ────────────────────────────────────────────────────────

const monthlyRevenue = [
  { month: "May", revenue: 10000, expenses: 34009 },
  { month: "Jun", revenue: 10000, expenses: 50000 },
  { month: "Jul", revenue: 20000, expenses: 67000 },
  { month: "Aug", revenue: 39000, expenses: 34200 },
  { month: "Sep", revenue: 45000, expenses: 37800 },
  { month: "Oct", revenue: 15000, expenses: 41200 },
  {month: "Nov", revenue: 0, expenses: 0},
  {month: "Dec", revenue: 0, expenses: 0},
  {month: "Jan", revenue: 0, expenses: 0},
  {month: "Feb", revenue: 0, expenses: 0},
];

const recentTransactions: {
  id: string;
  type: "Invoice" | "Payment" | "Quotation" | "Expense";
  project: string;
  amount: number;
  date: string;
  status: string;
}[] = [
  {
    id: "INV-2026-024",
    type: "Invoice",
    project: "UNDP Community Awareness",
    amount: 42000,
    date: "12 Oct 2026",
    status: "Pending approval",
  },
  {
    id: "PAY-2026-017",
    type: "Payment",
    project: "Youth Media Training Series",
    amount: 19500,
    date: "08 Oct 2026",
    status: "Paid",
  },
  {
    id: "QTN-2026-014",
    type: "Quotation",
    project: "UNDP Community Awareness",
    amount: 18400,
    date: "07 Oct 2026",
    status: "Pending approval",
  },
  {
    id: "INV-2026-021",
    type: "Invoice",
    project: "National Election Coverage",
    amount: 58000,
    date: "10 Oct 2026",
    status: "Approved",
  },
  {
    id: "EXP-2026-002",
    type: "Expense",
    project: "Sports Event Live Stream",
    amount: 4200,
    date: "14 Oct 2026",
    status: "Pending Approval",
  },
  {
    id: "QTN-2026-009",
    type: "Quotation",
    project: "Youth Media Training Series",
    amount: 4200,
    date: "02 Oct 2026",
    status: "Approved",
  },
];

const expenseByCategory = [
  { category: "Production", amount: 38400 },
  { category: "Equipment Rental", amount: 24800 },
  { category: "Travel", amount: 12600 },
  { category: "Technical", amount: 9200 },
  { category: "Staff", amount: 7100 },
  { category: "Other", amount: 4800 },
];

const paymentStatusColors: Record<string, string> = {
  Paid: "#16a34a",
  "Partially Paid": "#f59e0b",
  Unpaid: "#dc2626",
};

const statusPillClass = (status: string) =>
  ({
    Approved: "approved",
    "Pending approval": "pending-approval",
    "Pending Approval": "pending-approval",
    Rejected: "rejected",
    "Revision requested": "revision-requested",
    Draft: "draft",
    Paid: "approved",
    Unpaid: "rejected",
    "Partially Paid": "pending-approval",
    "Not issued": "draft",
  })[status] ?? "draft";

// ─── Quick-action dialog ─────────────────────────────────────────────────────

function QuickActionDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="dialog-backdrop">
      <div className="dialog finance-quick-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">QUICK ACTION</span>
            <h2>{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Stat summary card ───────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <article className={`stat-card finance-summary-card ${tone}`}>
      <div>
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </article>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  return (
    <span className={`quotation-status ${statusPillClass(status)}`}>
      {status}
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function FinanceDashboard({
  projects,
  onNotify,
  onNavigate,
}: {
  projects: Project[];
  onNotify: (msg: string) => void;
  onNavigate: (section: string, view?: string) => void;
}) {
  const [quotations] = useState<Quotation[]>(quotationSeed);
  const [invoices] = useState<Invoice[]>(invoiceSeed);
  const [payments] = useState<Payment[]>(paymentSeed);
  const [txnSearch, setTxnSearch] = useState("");
  const [txnType, setTxnType] = useState<
    "All" | "Invoice" | "Payment" | "Quotation" | "Expense"
  >("All");
  const [quickAction, setQuickAction] = useState<
    "quotation" | "invoice" | "payment" | "expense" | null
  >(null);

  // ─── derived metrics ───────────────────────────────────────────────────────

  const totalRevenue = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "Approved")
        .reduce((s, inv) => s + inv.amount, 0),
    [invoices],
  );

  const pendingPayments = useMemo(() => {
    const approved = invoices.filter((inv) => inv.status === "Approved");
    return approved.reduce((s, inv) => {
      const paid =
        payments.find((p) => p.invoiceId === inv.id)?.amountPaid ?? 0;
      return s + Math.max(0, inv.amount - paid);
    }, 0);
  }, [invoices, payments]);

  const paidInvoicesCount = useMemo(
    () =>
      invoices.filter((inv) => {
        const paid =
          payments.find((p) => p.invoiceId === inv.id)?.amountPaid ?? 0;
        return paid >= inv.amount && inv.amount > 0;
      }).length,
    [invoices, payments],
  );

  const totalExpenses = 97100; // static mock total from expense records

  // payment status breakdown for donut
  const paymentBreakdown = useMemo(() => {
    const approved = invoices.filter((inv) => inv.status === "Approved");
    let paid = 0,
      partial = 0,
      unpaid = 0;
    approved.forEach((inv) => {
      const amtPaid =
        payments.find((p) => p.invoiceId === inv.id)?.amountPaid ?? 0;
      if (amtPaid >= inv.amount) paid++;
      else if (amtPaid > 0) partial++;
      else unpaid++;
    });
    return [
      { name: "Paid", value: paid, color: "#16a34a" },
      { name: "Partial", value: partial, color: "#f59e0b" },
      { name: "Unpaid", value: unpaid, color: "#dc2626" },
    ];
  }, [invoices, payments]);

  // quotation status breakdown for bar chart
  const quotationBreakdown = [
    {
      status: "Approved",
      count: quotations.filter((q) => q.status === "Approved").length,
    },
    {
      status: "Pending",
      count: quotations.filter((q) => q.status === "Pending approval").length,
    },
    {
      status: "Rejected",
      count: quotations.filter((q) => q.status === "Rejected").length,
    },
    {
      status: "Draft",
      count: quotations.filter((q) => q.status === "Draft").length,
    },
  ];

  const filteredTxns = useMemo(
    () =>
      recentTransactions.filter((txn) => {
        const matchType = txnType === "All" || txn.type === txnType;
        const matchSearch = `${txn.id} ${txn.project}`
          .toLowerCase()
          .includes(txnSearch.toLowerCase());
        return matchType && matchSearch;
      }),
    [txnType, txnSearch],
  );

  return (
    <section className="page-section finance-dashboard">
      {/* ── Header ── */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">FINANCE / OVERVIEW</span>
          <h1>Finance dashboard</h1>
          <p>
            A unified view of revenue, invoices, payments, and expenses across
            all projects.
          </p>
        </div>
        <div className="finance-dash-header-actions">
          <button
            className="button button-secondary"
            onClick={() => setQuickAction("quotation")}
          >
            <FilePlus size={15} /> New quotation
          </button>
          <button
            className="button button-primary"
            onClick={() => setQuickAction("invoice")}
          >
            <Plus size={15} /> Generate invoice
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="stat-grid finance-summary-grid">
        <SummaryCard
          label="Total revenue"
          value={usdShort(totalRevenue)}
          sub={`${invoices.filter((i) => i.status === "Approved").length} approved invoices`}
          icon={CircleDollarSign}
          tone="indigo"
        />
        <SummaryCard
          label="Pending payments"
          value={usdShort(pendingPayments)}
          sub="Outstanding balance due"
          icon={Hourglass}
          tone="amber"
        />
        <SummaryCard
          label="Paid invoices"
          value={String(paidInvoicesCount)}
          sub="Fully settled invoices"
          icon={CheckCircle2}
          tone="green"
        />
        <SummaryCard
          label="Total expenses"
          value={usdShort(totalExpenses)}
          sub="Across all categories"
          icon={ReceiptText}
          tone=""
        />
      </div>

      {/* ── Charts row ── */}
      <div className="finance-dash-charts">
        {/* Revenue vs Expenses area chart */}
        <article className="panel finance-chart-card wide">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MONTHLY TREND</span>
              <h2>Revenue vs expenses</h2>
              <p>Six-month view in USD.</p>
            </div>
            <TrendingUp size={17} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={monthlyRevenue}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#edf1f6"
              />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `$${v / 1000}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: unknown) =>
                  typeof v === "number" ? usd(v) : String(v)
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#2563eb"
                fill="url(#gradRev)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#f59e0b"
                fill="url(#gradExp)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="finance-chart-legend">
            <span>
              <i style={{ background: "#2563eb" }} />
              Revenue
            </span>
            <span>
              <i style={{ background: "#f59e0b" }} />
              Expenses
            </span>
          </div>
        </article>

        {/* Payment status donut */}
        <article className="panel finance-chart-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PAYMENT STATUS</span>
              <h2>Invoice collections</h2>
              <p>Approved invoices by payment state.</p>
            </div>
            <WalletCards size={17} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={paymentBreakdown}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={3}
              >
                {paymentBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="finance-donut-legend">
            {paymentBreakdown.map((entry) => (
              <div key={entry.name}>
                <span
                  className="finance-legend-dot"
                  style={{ background: entry.color }}
                />
                <span>{entry.name}</span>
                <strong>{entry.value}</strong>
              </div>
            ))}
          </div>
        </article>

        {/* Expense by category bar chart */}
        <article className="panel finance-chart-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">EXPENSE BREAKDOWN</span>
              <h2>By category</h2>
              <p>Spending distribution in USD.</p>
            </div>
            <BadgeDollarSign size={17} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={expenseByCategory}
              layout="vertical"
              margin={{ left: 0, right: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#edf1f6"
              />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${v / 1000}k`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={108}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: unknown) =>
                  typeof v === "number" ? usd(v) : String(v)
                }
              />
              <Bar
                dataKey="amount"
                name="Amount"
                fill="#6657d8"
                radius={[0, 3, 3, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      {/* ── Middle sections row ── */}
      <div className="finance-dash-mid">
        {/* Project Quotations */}
        <article className="panel finance-dash-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">QUOTATIONS</span>
              <h2>Project quotations</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Finance", "quotations")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="finance-dash-stat-row">
            {quotationBreakdown.map((item) => (
              <div key={item.status} className="finance-mini-stat">
                <strong>{item.count}</strong>
                <span>{item.status}</span>
              </div>
            ))}
          </div>
          <div className="finance-list">
            {quotations.slice(0, 4).map((q) => {
              const proj = projects.find((p) => p.id === q.projectId);
              return (
                <div key={q.id} className="finance-list-row">
                  <FileText size={14} className="finance-list-icon" />
                  <div className="finance-list-main">
                    <strong>{q.id}</strong>
                    <small>{proj?.client ?? q.project}</small>
                  </div>
                  <span className="finance-list-amount">
                    {usdShort(q.amount)}
                  </span>
                  <Badge status={q.status} />
                </div>
              );
            })}
          </div>
          <button
            className="finance-dash-action-btn"
            onClick={() => setQuickAction("quotation")}
          >
            <FilePlus size={14} /> Create quotation
          </button>
        </article>

        {/* Invoice Management */}
        <article className="panel finance-dash-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">INVOICES</span>
              <h2>Invoice management</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Finance", "invoices")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="finance-dash-stat-row">
            <div className="finance-mini-stat">
              <strong>{invoices.length}</strong>
              <span>Total</span>
            </div>
            <div className="finance-mini-stat">
              <strong>
                {invoices.filter((i) => i.status === "Pending approval").length}
              </strong>
              <span>Pending</span>
            </div>
            <div className="finance-mini-stat">
              <strong>
                {invoices.filter((i) => i.status === "Approved").length}
              </strong>
              <span>Approved</span>
            </div>
            <div className="finance-mini-stat">
              <strong>
                {invoices.filter((i) => i.status === "Rejected").length}
              </strong>
              <span>Rejected</span>
            </div>
          </div>
          <div className="finance-list">
            {invoices.slice(0, 4).map((inv) => {
              const proj = projects.find((p) => p.id === inv.projectId);
              return (
                <div key={inv.id} className="finance-list-row">
                  <FileText size={14} className="finance-list-icon" />
                  <div className="finance-list-main">
                    <strong>{inv.id}</strong>
                    <small>{proj?.client ?? inv.project}</small>
                  </div>
                  <span className="finance-list-amount">
                    {usdShort(inv.amount)}
                  </span>
                  <Badge status={inv.status} />
                </div>
              );
            })}
          </div>
          <button
            className="finance-dash-action-btn"
            onClick={() => setQuickAction("invoice")}
          >
            <Plus size={14} /> Generate invoice
          </button>
        </article>

        {/* Payment Tracking */}
        <article className="panel finance-dash-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PAYMENTS</span>
              <h2>Payment tracking</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Finance", "payments")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="finance-payment-track-stats">
            {paymentBreakdown.map((item) => (
              <div
                key={item.name}
                className="finance-payment-track-pill"
                style={{ borderColor: item.color, color: item.color }}
              >
                <strong>{item.value}</strong>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          <div className="finance-list">
            {invoices
              .filter((inv) => inv.status === "Approved")
              .slice(0, 3)
              .map((inv) => {
                const amtPaid =
                  payments.find((p) => p.invoiceId === inv.id)?.amountPaid ?? 0;
                const ps =
                  amtPaid >= inv.amount
                    ? "Paid"
                    : amtPaid > 0
                      ? "Partially Paid"
                      : "Unpaid";
                const pct =
                  inv.amount > 0 ? Math.round((amtPaid / inv.amount) * 100) : 0;
                return (
                  <div
                    key={inv.id}
                    className="finance-list-row finance-payment-row"
                  >
                    <div className="finance-list-main">
                      <strong>{inv.id}</strong>
                      <small>{inv.project}</small>
                    </div>
                    <div className="finance-payment-progress-wrap">
                      <div className="finance-payment-progress-bar">
                        <span
                          style={{
                            width: `${pct}%`,
                            background: paymentStatusColors[ps],
                          }}
                        />
                      </div>
                      <small>{pct}%</small>
                    </div>
                    <Badge status={ps} />
                  </div>
                );
              })}
          </div>
          <button
            className="finance-dash-action-btn"
            onClick={() => setQuickAction("payment")}
          >
            <Wallet size={14} /> Record payment
          </button>
        </article>

        {/* Expense Management */}
        <article className="panel finance-dash-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">EXPENSES</span>
              <h2>Expense management</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Expenses")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="finance-dash-stat-row">
            <div className="finance-mini-stat">
              <strong>{usdShort(totalExpenses)}</strong>
              <span>Total</span>
            </div>
            <div className="finance-mini-stat">
              <strong>2</strong>
              <span>Pending</span>
            </div>
            <div className="finance-mini-stat">
              <strong>{usdShort(1850)}</strong>
              <span>Approved</span>
            </div>
            <div className="finance-mini-stat">
              <strong>{usdShort(1850)}</strong>
              <span>Paid</span>
            </div>
          </div>
          <div className="finance-list">
            {expenseByCategory.slice(0, 4).map((item) => (
              <div key={item.category} className="finance-list-row">
                <ReceiptText size={14} className="finance-list-icon" />
                <div className="finance-list-main">
                  <strong>{item.category}</strong>
                  <small>Expense category</small>
                </div>
                <span className="finance-list-amount">
                  {usdShort(item.amount)}
                </span>
                <div
                  className="finance-expense-bar-mini"
                  title={usd(item.amount)}
                >
                  <span
                    style={{
                      width: `${Math.round((item.amount / expenseByCategory[0].amount) * 100)}%`,
                      background: "#6657d8",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            className="finance-dash-action-btn"
            onClick={() => setQuickAction("expense")}
          >
            <Plus size={14} /> Add expense
          </button>
        </article>
      </div>

      {/* ── Recent transactions + quick-action shortcuts ── */}
      <div className="finance-dash-bottom">
        <article className="panel finance-transactions-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">ACTIVITY</span>
              <h2>Recent transactions</h2>
              <p>Latest financial events across all projects.</p>
            </div>
            <ListChecks size={17} />
          </div>
          {/* search + type filter */}
          <div className="finance-txn-toolbar">
            <label className="inline-search">
              <Search size={14} />
              <input
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search ID or project..."
              />
            </label>
            <select
              value={txnType}
              onChange={(e) => setTxnType(e.target.value as typeof txnType)}
            >
              <option value="All">All types</option>
              <option value="Invoice">Invoice</option>
              <option value="Payment">Payment</option>
              <option value="Quotation">Quotation</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div className="finance-txn-list">
            <div className="finance-txn-head">
              <span>ID</span>
              <span>Type</span>
              <span>Project</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {filteredTxns.map((txn) => (
              <div key={txn.id} className="finance-txn-row">
                <span className="finance-txn-id">
                  <FileText size={13} />
                  {txn.id}
                </span>
                <span>
                  <span
                    className={`finance-txn-type finance-txn-type-${txn.type.toLowerCase()}`}
                  >
                    {txn.type}
                  </span>
                </span>
                <span className="finance-txn-project">{txn.project}</span>
                <span className="finance-txn-date">{txn.date}</span>
                <strong className="finance-txn-amount">
                  {usd(txn.amount)}
                </strong>
                <Badge status={txn.status} />
              </div>
            ))}
            {!filteredTxns.length && (
              <div className="empty-state" style={{ padding: "2rem" }}>
                <Search size={24} />
                <p>No matching transactions found.</p>
              </div>
            )}
          </div>
        </article>

        {/* Quick actions sidebar */}
        <aside className="finance-quick-actions-panel">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">QUICK ACTIONS</span>
                <h2>Finance shortcuts</h2>
              </div>
            </div>
            <div className="finance-quick-action-list">
              <button
                className="finance-quick-action-item"
                onClick={() => setQuickAction("quotation")}
              >
                <span className="finance-qa-icon qa-quotation">
                  <FilePlus size={16} />
                </span>
                <div>
                  <strong>Create quotation</strong>
                  <small>Prepare a new project quotation</small>
                </div>
                <ChevronRight size={14} />
              </button>
              <button
                className="finance-quick-action-item"
                onClick={() => setQuickAction("invoice")}
              >
                <span className="finance-qa-icon qa-invoice">
                  <FileText size={16} />
                </span>
                <div>
                  <strong>Generate invoice</strong>
                  <small>Submit an invoice for CEO review</small>
                </div>
                <ChevronRight size={14} />
              </button>
              <button
                className="finance-quick-action-item"
                onClick={() => setQuickAction("payment")}
              >
                <span className="finance-qa-icon qa-payment">
                  <Wallet size={16} />
                </span>
                <div>
                  <strong>Record payment</strong>
                  <small>Log a payment against an invoice</small>
                </div>
                <ChevronRight size={14} />
              </button>
              <button
                className="finance-quick-action-item"
                onClick={() => setQuickAction("expense")}
              >
                <span className="finance-qa-icon qa-expense">
                  <ReceiptText size={16} />
                </span>
                <div>
                  <strong>Add expense</strong>
                  <small>Record a new project expense</small>
                </div>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Pending alerts */}
            <div className="finance-alert-section">
              <span
                className="eyebrow"
                style={{ marginBottom: 8, display: "block" }}
              >
                ALERTS
              </span>
              {invoices
                .filter((i) => i.status === "Pending approval")
                .map((inv) => (
                  <div key={inv.id} className="finance-alert-item">
                    <AlertCircle size={13} />
                    <div>
                      <strong>{inv.id} awaiting CEO</strong>
                      <small>
                        {usd(inv.amount)} · {inv.project.slice(0, 26)}
                      </small>
                    </div>
                  </div>
                ))}
              {quotations
                .filter((q) => q.status === "Pending approval")
                .map((q) => (
                  <div key={q.id} className="finance-alert-item">
                    <Clock size={13} />
                    <div>
                      <strong>{q.id} pending review</strong>
                      <small>
                        {usd(q.amount)} · {q.project.slice(0, 26)}
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          </article>
        </aside>
      </div>

      {/* ── Quick action dialogs ── */}
      {quickAction === "quotation" && (
        <QuickActionDialog
          title="Create quotation"
          onClose={() => setQuickAction(null)}
        >
          <p style={{ color: "#718096", fontSize: 13, marginBottom: 16 }}>
            Select a project to generate a new quotation. You can edit all
            details in the Quotations workspace.
          </p>
          <label className="invoice-submit-field">
            Project
            <select>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.client}
                </option>
              ))}
            </select>
          </label>
          <div className="dialog-actions">
            <button
              className="button button-secondary"
              onClick={() => setQuickAction(null)}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setQuickAction(null);
                onNavigate("Finance", "quotations");
                onNotify("Opening Quotation Management…");
              }}
            >
              <FilePlus size={14} /> Open quotations
            </button>
          </div>
        </QuickActionDialog>
      )}

      {quickAction === "invoice" && (
        <QuickActionDialog
          title="Generate invoice"
          onClose={() => setQuickAction(null)}
        >
          <p style={{ color: "#718096", fontSize: 13, marginBottom: 16 }}>
            Submit an invoice linked to an approved quotation. Full invoice
            builder is in the Invoices workspace.
          </p>
          <label className="invoice-submit-field">
            Project
            <select>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.name}
                </option>
              ))}
            </select>
          </label>
          <div className="dialog-actions">
            <button
              className="button button-secondary"
              onClick={() => setQuickAction(null)}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setQuickAction(null);
                onNavigate("Finance", "invoices");
                onNotify("Opening Invoice Management…");
              }}
            >
              <FileText size={14} /> Open invoices
            </button>
          </div>
        </QuickActionDialog>
      )}

      {quickAction === "payment" && (
        <QuickActionDialog
          title="Record payment"
          onClose={() => setQuickAction(null)}
        >
          <p style={{ color: "#718096", fontSize: 13, marginBottom: 16 }}>
            Log a payment against an approved invoice. Full payment tracker is
            in the Payments workspace.
          </p>
          <div className="finance-list" style={{ marginBottom: 16 }}>
            {invoices
              .filter((inv) => inv.status === "Approved")
              .map((inv) => {
                const amtPaid =
                  payments.find((p) => p.invoiceId === inv.id)?.amountPaid ?? 0;
                const ps =
                  amtPaid >= inv.amount
                    ? "Paid"
                    : amtPaid > 0
                      ? "Partially Paid"
                      : "Unpaid";
                return (
                  <div key={inv.id} className="finance-list-row">
                    <div className="finance-list-main">
                      <strong>{inv.id}</strong>
                      <small>{inv.project}</small>
                    </div>
                    <strong style={{ fontSize: 13 }}>{usd(inv.amount)}</strong>
                    <Badge status={ps} />
                  </div>
                );
              })}
          </div>
          <div className="dialog-actions">
            <button
              className="button button-secondary"
              onClick={() => setQuickAction(null)}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setQuickAction(null);
                onNavigate("Finance", "payments");
                onNotify("Opening Payment Tracking…");
              }}
            >
              <Wallet size={14} /> Open payments
            </button>
          </div>
        </QuickActionDialog>
      )}

      {quickAction === "expense" && (
        <QuickActionDialog
          title="Add expense"
          onClose={() => setQuickAction(null)}
        >
          <p style={{ color: "#718096", fontSize: 13, marginBottom: 16 }}>
            Create and submit a new project expense. Full expense management is
            in the Expenses workspace.
          </p>
          <label className="invoice-submit-field">
            Project
            <select>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="invoice-submit-field" style={{ marginTop: 12 }}>
            Title
            <input placeholder="e.g. Location transport" />
          </label>
          <label className="invoice-submit-field" style={{ marginTop: 12 }}>
            Amount (USD)
            <input type="number" min="0" placeholder="0.00" />
          </label>
          <div className="dialog-actions">
            <button
              className="button button-secondary"
              onClick={() => setQuickAction(null)}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setQuickAction(null);
                onNavigate("Expenses");
                onNotify("Opening Expense Management…");
              }}
            >
              <ReceiptText size={14} /> Open expenses
            </button>
          </div>
        </QuickActionDialog>
      )}
    </section>
  );
}
