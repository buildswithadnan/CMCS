import {
  Approval,
  EmployeeAttendance,
  Invoice,
  Notification,
  Payment,
  Project,
  Quotation,
  Role,
  Status,
  User,
  AttendanceItem,
} from "../types";

export const users: Record<Role, User> = {
  ceo: {
    employeeId: "CHN-CEO-001",
    email: "ceo@demo.chinar.tv",
    password: "ChinarCEO@2026",
    name: "Ahmad Khan",
    firstName: "Ahmad",
    role: "CEO / Founder Manager",
    department: "Executive",
  },
  hoo: {
    employeeId: "CHN-HOO-001",
    email: "hoo@demo.chinar.tv",
    password: "ChinarOps@2026",
    name: "Wali Khan",
    firstName: "Wali",
    role: "Head of Operations",
    department: "Operations",
  },
  production: {
    employeeId: "CHN-PROD-001",
    email: "production@demo.chinar.tv",
    password: "ChinarProd@2026",
    name: "Hafizullah Khan",
    firstName: "Hafizullah",
    role: "Production Manager",
    department: "Production",
  },
  technical: {
    employeeId: "CHN-TECH-001",
    email: "technical@demo.chinar.tv",
    password: "ChinarTech@2026",
    name: "Shoaib Ahmad",
    firstName: "Shoaib",
    role: "Technical Manager",
    department: "Technical",
  },
  finance: {
    employeeId: "CHN-FIN-001",
    email: "finance@demo.chinar.tv",
    password: "ChinarFinance@2026",
    name: "Farid Ahmad",
    firstName: "Farid",
    role: "Finance Officer",
    department: "Finance",
  },
  hr: {
    employeeId: "CHN-HR-001",
    email: "hr@demo.chinar.tv",
    password: "ChinarHR@2026",
    name: "Zainab Ahmad",
    firstName: "Zainab",
    role: "HR Manager",
    department: "Human Resources",
  },
  admin: {
    employeeId: "CHN-ADM-001",
    email: "admin@demo.chinar.tv",
    password: "ChinarAdmin@2026",
    name: "Mohammad Wali",
    firstName: "Mohammad",
    role: "System Administrator",
    department: "Administration",
  },
  employee: {
    employeeId: "CHN-EMP-001",
    email: "employee@demo.chinar.tv",
    password: "ChinarEmployee@2026",
    name: "Ahmad Rahimi",
    firstName: "Ahmad",
    role: "Employee",
    department: "Production",
  },
};

export const loginDepartments = Array.from(
  new Set(Object.values(users).map((user) => user.department)),
).sort((a, b) => a.localeCompare(b));

export const projectsSeed: Project[] = [
  {
    id: "PRJ-2026-0042",
    name: "UNDP Community Awareness Videography",
    client: "UNDP",
    owner: "Hafizullah Khan",
    start: "2026-10-12",
    end: "2026-10-22",
    progress: 72,
    status: "In Progress",
    department: "Production",
    budget: 42000,
  },
  {
    id: "PRJ-2026-0038",
    name: "National Election Coverage",
    client: "IEC",
    owner: "Wali Khan",
    start: "2026-10-05",
    end: "2026-10-09",
    progress: 48,
    status: "In Progress",
    department: "Operations",
    budget: 58000,
  },
  {
    id: "PRJ-2026-0045",
    name: "Kabul City Documentary",
    client: "Ministry of Culture",
    owner: "Zainab Ahmad",
    start: "2026-10-18",
    end: "2026-10-30",
    progress: 18,
    status: "Upcoming",
    department: "Production",
    budget: 31000,
  },
  {
    id: "PRJ-2026-0031",
    name: "Youth Media Training Series",
    client: "UNICEF",
    owner: "Ahmad Rahimi",
    start: "2026-10-02",
    end: "2026-10-06",
    progress: 100,
    status: "Completed",
    department: "HR",
    budget: 19500,
  },
  {
    id: "PRJ-2026-0048",
    name: "Sports Event Live Stream",
    client: "Ariana Sports",
    owner: "Shoaib Ahmad",
    start: "2026-10-20",
    end: "2026-10-24",
    progress: 8,
    status: "Upcoming",
    department: "Technical",
    budget: 27000,
  },
  {
    id: "PRJ-2026-0052",
    name: "Women in Media Forum Documentary",
    client: "UN Women",
    owner: "Zainab Ahmad",
    start: "2026-10-25",
    end: "2026-11-05",
    progress: 0,
    status: "Upcoming",
    department: "Production",
    budget: 36000,
  },
  {
    id: "PRJ-2026-0036",
    name: "Herat Cultural Heritage Series",
    client: "UNESCO",
    owner: "Hafizullah Khan",
    start: "2026-10-10",
    end: "2026-10-27",
    progress: 60,
    status: "In Progress",
    department: "Production",
    budget: 49000,
  },
  {
    id: "PRJ-2026-0029",
    name: "Balkh Community Radio Broadcast",
    client: "Internews",
    owner: "Shoaib Ahmad",
    start: "2026-10-01",
    end: "2026-10-14",
    progress: 85,
    status: "In Progress",
    department: "Technical",
    budget: 22500,
  },
];

export const revenue = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map(
  (month, index) => ({
    month,
    revenue: 68 + index * 7,
    expenses: 31 + index * 3,
  }),
);

export const statusColors: Record<Status, string> = {
  "In Progress": "#2563eb",
  Upcoming: "#8b5cf6",
  Completed: "#16a34a",
  Rejected: "#dc2626",
};

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDate = (value: string) =>
  parseDate(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

export const attendanceToday: AttendanceItem[] = [
  {
    name: "Ahmad Rahimi",
    department: "Production",
    status: "Present",
    time: "08:42 AM",
  },
  {
    name: "Shoaib Ahmad",
    department: "Technical",
    status: "Present",
    time: "07:58 AM",
  },
  {
    name: "Hafizullah Khan",
    department: "Production",
    status: "Present",
    time: "08:16 AM",
  },
  { name: "Zainab Ahmad", department: "HR", status: "Absent", time: "—" },
  { name: "Farid Ahmad", department: "Finance", status: "Absent", time: "—" },
];

export const employeeAttendance: EmployeeAttendance[] = [
  {
    employee: "Ahmad Rahimi",
    department: "Production",
    completedProjects: 12,
    records: [
      { date: "2026-10-11", status: "Present", time: "08:42 AM" },
      { date: "2026-10-10", status: "Present", time: "08:37 AM" },
      { date: "2026-10-09", status: "Present", time: "08:51 AM" },
      { date: "2026-10-08", status: "Late", time: "09:21 AM" },
      { date: "2026-10-07", status: "Present", time: "08:35 AM" },
    ],
  },
  {
    employee: "Shoaib Ahmad",
    department: "Technical",
    completedProjects: 9,
    records: [
      { date: "2026-10-11", status: "Present", time: "07:58 AM" },
      { date: "2026-10-10", status: "Present", time: "08:04 AM" },
      { date: "2026-10-09", status: "Absent", time: "—" },
      { date: "2026-10-08", status: "Present", time: "08:11 AM" },
      { date: "2026-10-07", status: "Present", time: "07:55 AM" },
    ],
  },
  {
    employee: "Hafizullah Khan",
    department: "Production",
    completedProjects: 15,
    records: [
      { date: "2026-10-11", status: "Present", time: "08:16 AM" },
      { date: "2026-10-10", status: "Present", time: "08:19 AM" },
      { date: "2026-10-09", status: "Present", time: "08:22 AM" },
      { date: "2026-10-08", status: "Present", time: "08:18 AM" },
      { date: "2026-10-07", status: "Late", time: "09:06 AM" },
    ],
  },
  {
    employee: "Zainab Ahmad",
    department: "HR",
    completedProjects: 7,
    records: [
      { date: "2026-10-11", status: "Absent", time: "—" },
      { date: "2026-10-10", status: "Present", time: "08:46 AM" },
      { date: "2026-10-09", status: "Present", time: "08:40 AM" },
      { date: "2026-10-08", status: "Present", time: "08:52 AM" },
      { date: "2026-10-07", status: "Present", time: "08:38 AM" },
    ],
  },
  {
    employee: "Farid Ahmad",
    department: "Finance",
    completedProjects: 6,
    records: [
      { date: "2026-10-11", status: "Absent", time: "—" },
      { date: "2026-10-10", status: "Present", time: "08:30 AM" },
      { date: "2026-10-09", status: "Present", time: "08:34 AM" },
      { date: "2026-10-08", status: "Late", time: "09:17 AM" },
      { date: "2026-10-07", status: "Present", time: "08:29 AM" },
    ],
  },
];

export const ceoNotifications: Notification[] = [
  {
    id: "NTF-001",
    title: "New project requires approval",
    detail: "Head of Operations submitted National Election Coverage.",
    time: "Today, 09:18 AM",
    kind: "Project approval",
    recipient: "ceo",
  },
  {
    id: "NTF-002",
    title: "Quotation requires approval",
    detail: "QTN-2026-014 is ready for UNDP Community Awareness.",
    time: "Today, 08:55 AM",
    kind: "Quotation",
    recipient: "ceo",
  },
  {
    id: "NTF-003",
    title: "Project schedule updated",
    detail: "Kabul City Documentary dates were updated by Production.",
    time: "Yesterday, 04:20 PM",
    kind: "Project update",
    recipient: "ceo",
  },
];

export const notificationStorageKey = "cmcsNotifications";

export const readNotifications = (): Notification[] => {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(notificationStorageKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as Notification[];
  } catch {
    return [];
  }
};

export const defaultNotifications: Notification[] = ceoNotifications.map(
  (notification) => ({ ...notification, recipient: "ceo" as Role }),
);

export const quotationSeed: Quotation[] = [
  {
    id: "QTN-2026-014",
    projectId: "PRJ-2026-0042",
    project: "UNDP Community Awareness Videography",
    vendor: "Kabul Visuals Co.",
    amount: 18400,
    submittedBy: "Wali Khan",
    submitted: "07 Oct 2026",
    status: "Pending approval",
  },
  {
    id: "QTN-2026-011",
    projectId: "PRJ-2026-0038",
    project: "National Election Coverage",
    vendor: "Ariana Equipment Hire",
    amount: 12750,
    submittedBy: "Wali Khan",
    submitted: "06 Oct 2026",
    status: "Pending approval",
  },
  {
    id: "QTN-2026-009",
    projectId: "PRJ-2026-0031",
    project: "Youth Media Training Series",
    vendor: "Kabul Print Studio",
    amount: 4200,
    submittedBy: "Farid Ahmad",
    submitted: "02 Oct 2026",
    status: "Approved",
  },
  {
    id: "QTN-2026-006",
    projectId: "PRJ-2026-0045",
    project: "Kabul City Documentary",
    vendor: "Kabul Creative Works",
    amount: 9600,
    submittedBy: "Zainab Ahmad",
    submitted: "29 Sep 2026",
    status: "Rejected",
  },
];

export const invoiceSeed: Invoice[] = [
  {
    id: "INV-2026-024",
    projectId: "PRJ-2026-0042",
    quotationId: "QTN-2026-014",
    project: "UNDP Community Awareness Videography",
    amount: 42000,
    status: "Pending approval",
    generationStatus: "Generated",
    paymentStatus: "Not issued",
  },
  {
    id: "INV-2026-021",
    projectId: "PRJ-2026-0038",
    quotationId: "QTN-2026-011",
    project: "National Election Coverage",
    amount: 58000,
    status: "Approved",
    generationStatus: "Generated",
    paymentStatus: "Unpaid",
  },
  {
    id: "INV-2026-019",
    projectId: "PRJ-2026-0031",
    quotationId: "QTN-2026-009",
    project: "Youth Media Training Series",
    amount: 19500,
    status: "Approved",
    generationStatus: "Generated",
    paymentStatus: "Paid",
  },
  {
    id: "INV-2026-016",
    projectId: "PRJ-2026-0045",
    quotationId: "QTN-2026-006",
    project: "Kabul City Documentary",
    amount: 31000,
    status: "Rejected",
    generationStatus: "Not generated",
    paymentStatus: "Not issued",
  },
];

export const paymentSeed: Payment[] = [
  {
    id: "PAY-2026-017",
    projectId: "PRJ-2026-0031",
    quotationId: "QTN-2026-009",
    project: "Youth Media Training Series",
    amount: 19500,
    status: "Paid",
    generationStatus: "—",
    paymentStatus: "Paid",
  },
  {
    id: "PAY-2026-014",
    projectId: "PRJ-2026-0038",
    quotationId: "QTN-2026-011",
    project: "National Election Coverage",
    amount: 29000,
    status: "Unpaid",
    generationStatus: "—",
    paymentStatus: "Unpaid",
  },
];
