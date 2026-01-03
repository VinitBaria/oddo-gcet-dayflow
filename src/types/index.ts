export type UserRole = 'admin' | 'employee' | 'hr';

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
  companyName?: string;
  logoUrl?: string;
  avatar?: string;
  phone?: string;
  joinDate: string;
  status: AttendanceStatus;
  personalInfo?: {
    dob?: string;
    address?: string;
    nationality?: string;
    personalEmail?: string;
    gender?: 'male' | 'female' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  };
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    panNo?: string;
    uanNo?: string;
  };
  salaryInfo?: {
    wageType: 'monthly' | 'hourly';
    monthlyWage: number;
    basicSalary: number;
    hra: number;
    standardAllowance: number;
    performanceBonus: number;
    leaveTravelAllowance: number;
    fixedAllowance: number;
    pfEmployee: number;
    pfEmployer: number;
    professionalTax: number;
  };
  certificates?: Array<{
    _id?: string;
    name: string;
    fileUrl: string;
    uploadDate: string;
  }>;
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
