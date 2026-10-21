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
  | "administrationEmployee"
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
  assignedEmployees?: string[];
};

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export type EmployeeTask = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  progress: number;
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
};

export type EquipmentAssignment = {
  id: string;
  name: string;
  category: string;
  projectId: string;
  assignedTo: string;
  condition: "Good" | "Needs service";
  returnDate: string;
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
  items?: QuotationItem[];
  taxRate?: number;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  history?: QuotationHistory[];
  revisionRequest?: string;
  submittedTo?: Role[];
  quotationDate?: string;
  validity?: string;
  customerDetails?: string;
  contactPerson?: string;
  paymentTerm?: string;
  deliveryTime?: string;
  warranty?: string;
  mediaRights?: number;
  discount?: number;
  discountType?: "fixed" | "percentage";
  notes?: string;
};

export type QuotationItem = {
  id: string;
  itemNo?: string;
  category?: string;
  subcategory?: string;
  description: string;
  quantity: number;
  days: number;
  unitPrice: number;
  taxRate: number;
};

export type QuotationHistory = {
  status: string;
  date: string;
  actor: string;
  note?: string;
};

export type ExpenseStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Paid";

export type ExpenseCategory =
  | "Travel"
  | "Transportation"
  | "Equipment Rental"
  | "Production"
  | "Technical"
  | "Food & Accommodation"
  | "Office Supplies"
  | "Staff"
  | "Other";

export type ExpenseHistory = {
  status: ExpenseStatus;
  date: string;
  actor: string;
  note?: string;
};

export type Expense = {
  id: string;
  projectId: string;
  project: string;
  title: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  vendor: string;
  paymentMethod: string;
  receiptName?: string;
  status: ExpenseStatus;
  submittedBy: string;
  history: ExpenseHistory[];
};

export type Invoice = {
  id: string;
  projectId: string;
  quotationId: string;
  project: string;
  amount: number;
  submitted?: string;
  status: string;
  generationStatus: string;
  paymentStatus: string;
};

export type Payment = {
  id: string;
  invoiceId?: string;
  projectId: string;
  quotationId: string;
  project: string;
  amount: number;
  amountPaid?: number;
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

export type PaymentStatus = "Paid" | "Unpaid" | "Partially Paid";

export type Salary = {
  id: string;
  employeeName: string;
  employeeId: string;
  projectId: string;
  project: string;
  role: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  paidAmount?: number;
  notes?: string;
  history?: SalaryHistory[];
};

export type SalaryHistory = {
  date: string;
  action: string;
  amount: number;
  actor: string;
  note?: string;
};

export type EquipmentRental = {
  id: string;
  equipmentName: string;
  category: string;
  projectId: string;
  project: string;
  rentalProvider: string;
  rentalCost: number;
  rentalStartDate: string;
  rentalEndDate: string;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  quantity: number;
  notes?: string;
  history?: EquipmentRentalHistory[];
};

export type EquipmentRentalHistory = {
  date: string;
  action: string;
  amount?: number;
  actor: string;
  note?: string;
};
