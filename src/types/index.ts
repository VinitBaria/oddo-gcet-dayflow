export type UserRole = 'admin' | 'employee';

export type AttendanceStatus = 'present' | 'absent' | 'on_leave';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveType = 'paid' | 'sick' | 'unpaid';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  jobTitle: string;
  department: string;
  avatar?: string;
  phone?: string;
  joinDate: string;
  status: AttendanceStatus;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  extraHours?: number;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface LeaveBalance {
  paid: number;
  sick: number;
  unpaid: number;
}

export interface SalaryInfo {
  basic: number;
  hra: number;
  allowances: number;
  pfContribution: number;
  wageType: 'monthly' | 'hourly';
}
