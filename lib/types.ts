export type User = {
  employeeId: string;
  email: string;
  password: string;
  name: string;
  firstName: string;
  role: string;
  department: string;
};

export type Role =
  | "ceo"
  | "hoo"
  | "production"
  | "technical"
  | "finance"
  | "hr"
  | "admin"
  | "employee";

export type Status = "In Progress" | "Upcoming" | "Completed" | "Rejected";

export type Project = {
  id: string;
  name: string;
  client: string;
  owner: string;
  start: string;
  end: string;
  progress: number;
  status: Status;
  department: string;
  budget: number;
};

export type Approval = "Pending approval" | "Approved" | "Rejected";

export type Notification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: string;
  recipient: Role | "all";
};

export type Quotation = {
  id: string;
  projectId: string;
  project: string;
  vendor: string;
  amount: number;
  submittedBy: string;
  submitted: string;
  status: string;
};

export type Invoice = {
  id: string;
  projectId: string;
  quotationId: string;
  project: string;
  amount: number;
  status: string;
  generationStatus: string;
  paymentStatus: string;
};

export type Payment = {
  id: string;
  projectId: string;
  quotationId: string;
  project: string;
  amount: number;
  status: string;
  generationStatus: string;
  paymentStatus: string;
};

export type AttendanceItem = {
  name: string;
  department: string;
  status: "Present" | "Absent" | "Late";
  time: string;
};

export type AttendanceRecord = {
  date: string;
  status: "Present" | "Absent" | "Late";
  time: string;
};

export type EmployeeAttendance = {
  employee: string;
  department: string;
  completedProjects: number;
  records: AttendanceRecord[];
};
