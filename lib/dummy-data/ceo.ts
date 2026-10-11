export const ceoPeriods = [
  "Today",
  "This Week",
  "This Month",
  "This Quarter",
  "This Year",
] as const;
export type CeoPeriod = (typeof ceoPeriods)[number];

export const ceoKpis = {
  Today: {
    projects: 127,
    active: 18,
    upcoming: 24,
    completed: 85,
    onHold: 6,
    revenue: 125400,
    outstanding: 21500,
    invoices: 8,
  },
  "This Week": {
    projects: 132,
    active: 20,
    upcoming: 27,
    completed: 88,
    onHold: 5,
    revenue: 142800,
    outstanding: 19800,
    invoices: 7,
  },
  "This Month": {
    projects: 141,
    active: 22,
    upcoming: 31,
    completed: 96,
    onHold: 7,
    revenue: 188600,
    outstanding: 28400,
    invoices: 10,
  },
  "This Quarter": {
    projects: 158,
    active: 25,
    upcoming: 36,
    completed: 112,
    onHold: 8,
    revenue: 492400,
    outstanding: 36200,
    invoices: 13,
  },
  "This Year": {
    projects: 186,
    active: 28,
    upcoming: 42,
    completed: 137,
    onHold: 9,
    revenue: 1248000,
    outstanding: 45800,
    invoices: 16,
  },
} as const;

export const revenueTrend = [
  { month: "Jan", revenue: 42, expenses: 18 },
  { month: "Feb", revenue: 48, expenses: 21 },
  { month: "Mar", revenue: 55, expenses: 23 },
  { month: "Apr", revenue: 51, expenses: 20 },
  { month: "May", revenue: 63, expenses: 27 },
  { month: "Jun", revenue: 70, expenses: 30 },
  { month: "Jul", revenue: 68, expenses: 29 },
  { month: "Aug", revenue: 75, expenses: 32 },
  { month: "Sep", revenue: 82, expenses: 35 },
  { month: "Oct", revenue: 91, expenses: 38 },
];

export const projectPerformance = [
  { month: "Jan", completed: 8, onHold: 2 },
  { month: "Feb", completed: 11, onHold: 1 },
  { month: "Mar", completed: 9, onHold: 2 },
  { month: "Apr", completed: 14, onHold: 2 },
  { month: "May", completed: 12, onHold: 1 },
  { month: "Jun", completed: 17, onHold: 2 },
  { month: "Jul", completed: 15, onHold: 1 },
  { month: "Aug", completed: 19, onHold: 2 },
  { month: "Sep", completed: 21, onHold: 1 },
  { month: "Oct", completed: 18, onHold: 2 },
];

export const projectStatus = [
  { name: "Completed", value: 85, color: "#16a34a" },
  { name: "In Progress", value: 18, color: "#1f41bb" },
  { name: "Upcoming", value: 24, color: "#7c6ee6" },
  { name: "On Hold", value: 6, color: "#d97706" },
  { name: "Draft", value: 3, color: "#94a3b8" },
  { name: "Assigned", value: 4, color: "#4b9bd2" },
];

export const projects = [
  {
    name: "UNDP Videography",
    client: "UNDP",
    lead: "Hafiz",
    team: 4,
    start: "10 Oct",
    end: "20 Oct",
    progress: 65,
    status: "In Progress",
  },
  {
    name: "Sports Coverage",
    client: "Ariana Sports",
    lead: "Shoaib",
    team: 6,
    start: "08 Oct",
    end: "12 Oct",
    progress: 82,
    status: "In Progress",
  },
  {
    name: "Kabul City Documentary",
    client: "Ministry of Culture",
    lead: "Zainab",
    team: 5,
    start: "18 Oct",
    end: "28 Oct",
    progress: 18,
    status: "Upcoming",
  },
  {
    name: "Youth Media Training",
    client: "UNICEF",
    lead: "Ahmad",
    team: 3,
    start: "02 Oct",
    end: "05 Oct",
    progress: 100,
    status: "Completed",
  },
];

export const workload = [
  { name: "Hafiz", role: "Production", value: 85, status: "Busy" },
  { name: "Shoaib", role: "Technical", value: 62, status: "Available" },
  { name: "Ahmad", role: "Field team", value: 45, status: "On Field Duty" },
  { name: "Farid", role: "Finance", value: 92, status: "Overloaded" },
  { name: "Zainab", role: "Production", value: 38, status: "Available" },
  { name: "Wali", role: "Operations", value: 70, status: "Busy" },
];

export const actions = [
  {
    severity: "HIGH",
    title: "UNDP Videography",
    description: "Project schedule updated",
    time: "Today, 09:42 AM",
    icon: "alert",
  },
  {
    severity: "MEDIUM",
    title: "Assignment responses",
    description: "3 employees have not responded",
    time: "Today, 09:18 AM",
    icon: "users",
  },
  {
    severity: "HIGH",
    title: "$21,500 outstanding",
    description: "12 accounts require follow-up",
    time: "Today, 08:55 AM",
    icon: "wallet",
  },
  {
    severity: "MEDIUM",
    title: "OB Van 02",
    description: "Under maintenance until 09 Oct",
    time: "Yesterday",
    icon: "truck",
  },
  {
    severity: "LOW",
    title: "INV-2026-021",
    description: "Invoice awaiting review",
    time: "Yesterday",
    icon: "file",
  },
];

export const activities = [
  ["09:42 AM", "Head of Operations changed UNDP project date.", "alert"],
  ["09:18 AM", "Hafiz accepted assignment for Sports Coverage.", "check"],
  ["08:55 AM", "Finance submitted INV-2026-021 for review.", "file"],
  ["08:20 AM", "OB Van 02 moved to maintenance.", "truck"],
  ["Yesterday", "Sports Coverage project completed.", "check"],
];

export const upcomingProjects = [
  {
    month: "OCT",
    day: "10",
    name: "UNDP Videography",
    location: "Kabul",
    lead: "Hafiz",
    team: 4,
  },
  {
    month: "OCT",
    day: "12",
    name: "Sports Event Coverage",
    location: "Kabul",
    lead: "Shoaib",
    team: 6,
  },
  {
    month: "OCT",
    day: "18",
    name: "Kabul City Documentary",
    location: "Kabul",
    lead: "Zainab",
    team: 5,
  },
  {
    month: "OCT",
    day: "21",
    name: "Women in Media Forum",
    location: "Herat",
    lead: "Wali",
    team: 3,
  },
  {
    month: "OCT",
    day: "24",
    name: "Community Radio Series",
    location: "Balkh",
    lead: "Ahmad",
    team: 4,
  },
];
