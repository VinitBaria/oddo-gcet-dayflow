import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AttendanceRecord, LeaveRequest, LeaveBalance, AttendanceStatus, LeaveStatus, LeaveType } from '@/types';
import { mockEmployees, mockAttendanceRecords, mockLeaveRequests, mockLeaveBalances } from '@/data/mockData';

interface HRContextType {
  // Employees
  employees: User[];
  addEmployee: (employee: Omit<User, 'id' | 'employeeId'>) => void;
  updateEmployee: (id: string, updates: Partial<User>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => User | undefined;
  
  // Attendance
  attendanceRecords: AttendanceRecord[];
  checkIn: (userId: string) => void;
  checkOut: (userId: string) => void;
  getUserAttendance: (userId: string) => AttendanceRecord[];
  
  // Leave
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => void;
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string) => void;
  updateLeaveBalance: (userId: string, balance: LeaveBalance) => void;
  
  // Departments
  departments: string[];
  addDepartment: (name: string) => void;
  removeDepartment: (name: string) => void;
  
  // Settings
  settings: HRSettings;
  updateSettings: (updates: Partial<HRSettings>) => void;
}

interface HRSettings {
  companyName: string;
  workingHoursPerDay: number;
  overtimeMultiplier: number;
  defaultPaidLeave: number;
  defaultSickLeave: number;
  emailNotifications: boolean;
  autoApproveLeave: boolean;
}

const defaultSettings: HRSettings = {
  companyName: 'Dayflow Inc.',
  workingHoursPerDay: 8,
  overtimeMultiplier: 1.5,
  defaultPaidLeave: 15,
  defaultSickLeave: 10,
  emailNotifications: true,
  autoApproveLeave: false,
};

const HRContext = createContext<HRContextType | undefined>(undefined);

export function HRProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<User[]>(mockEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(mockLeaveBalances);
  const [departments, setDepartments] = useState<string[]>([
    'Engineering', 'Human Resources', 'Marketing', 'Design', 'Finance', 'Operations'
  ]);
  const [settings, setSettings] = useState<HRSettings>(defaultSettings);

  // Employee Management
  const generateEmployeeId = () => {
    const year = new Date().getFullYear();
    const count = employees.length + 1;
    return `OIJODO${year}${count.toString().padStart(4, '0')}`;
  };

  const addEmployee = (employee: Omit<User, 'id' | 'employeeId'>) => {
    const id = (employees.length + 1).toString();
    const employeeId = generateEmployeeId();
    const newEmployee: User = {
      ...employee,
      id,
      employeeId,
    };
    setEmployees(prev => [...prev, newEmployee]);
    
    // Set default leave balance
    setLeaveBalances(prev => ({
      ...prev,
      [id]: {
        paid: settings.defaultPaidLeave,
        sick: settings.defaultSickLeave,
        unpaid: 0,
      }
    }));
  };

  const updateEmployee = (id: string, updates: Partial<User>) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setLeaveBalances(prev => {
      const newBalances = { ...prev };
      delete newBalances[id];
      return newBalances;
    });
  };

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  // Attendance Management
  const checkIn = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const existingRecord = attendanceRecords.find(
      r => r.userId === userId && r.date === today
    );

    if (existingRecord) {
      setAttendanceRecords(prev => 
        prev.map(r => r.id === existingRecord.id 
          ? { ...r, checkIn: time, status: 'present' as AttendanceStatus }
          : r
        )
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: (attendanceRecords.length + 1).toString(),
        userId,
        date: today,
        checkIn: time,
        status: 'present',
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    }

    // Update employee status
    updateEmployee(userId, { status: 'present' });
  };

  const checkOut = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    setAttendanceRecords(prev => 
      prev.map(r => {
        if (r.userId === userId && r.date === today && r.checkIn) {
          const checkInDate = new Date(`${today}T${r.checkIn}`);
          const checkOutDate = new Date(`${today}T${time}`);
          const hoursWorked = (checkOutDate.getTime() - checkInDate.getTime()) / 3600000;
          const extraHours = Math.max(0, hoursWorked - settings.workingHoursPerDay);
          
          return {
            ...r,
            checkOut: time,
            workHours: parseFloat(hoursWorked.toFixed(2)),
            extraHours: parseFloat(extraHours.toFixed(2)),
          };
        }
        return r;
      })
    );
  };

  const getUserAttendance = (userId: string) => 
    attendanceRecords.filter(r => r.userId === userId);

  // Leave Management
  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: (leaveRequests.length + 1).toString(),
      status: settings.autoApproveLeave ? 'approved' : 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests(prev => [...prev, newRequest]);

    if (settings.autoApproveLeave) {
      // Deduct from balance
      deductLeaveBalance(request.userId, request.type, request.startDate, request.endDate);
    }
  };

  const deductLeaveBalance = (userId: string, type: LeaveType, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    setLeaveBalances(prev => {
      const current = prev[userId] || { paid: 0, sick: 0, unpaid: 0 };
      return {
        ...prev,
        [userId]: {
          ...current,
          [type]: Math.max(0, current[type] - days),
        }
      };
    });
  };

  const approveLeaveRequest = (id: string) => {
    const request = leaveRequests.find(r => r.id === id);
    if (request) {
      setLeaveRequests(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'approved' as LeaveStatus } : r)
      );
      deductLeaveBalance(request.userId, request.type, request.startDate, request.endDate);
      
      // Update employee status if leave is current
      const today = new Date().toISOString().split('T')[0];
      if (request.startDate <= today && request.endDate >= today) {
        updateEmployee(request.userId, { status: 'on_leave' });
      }
    }
  };

  const rejectLeaveRequest = (id: string) => {
    setLeaveRequests(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'rejected' as LeaveStatus } : r)
    );
  };

  const updateLeaveBalance = (userId: string, balance: LeaveBalance) => {
    setLeaveBalances(prev => ({ ...prev, [userId]: balance }));
  };

  // Department Management
  const addDepartment = (name: string) => {
    if (!departments.includes(name)) {
      setDepartments(prev => [...prev, name]);
    }
  };

  const removeDepartment = (name: string) => {
    setDepartments(prev => prev.filter(d => d !== name));
  };

  // Settings
  const updateSettings = (updates: Partial<HRSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <HRContext.Provider value={{
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      getEmployee,
      attendanceRecords,
      checkIn,
      checkOut,
      getUserAttendance,
      leaveRequests,
      leaveBalances,
      submitLeaveRequest,
      approveLeaveRequest,
      rejectLeaveRequest,
      updateLeaveBalance,
      departments,
      addDepartment,
      removeDepartment,
      settings,
      updateSettings,
    }}>
      {children}
    </HRContext.Provider>
  );
}

export function useHR() {
  const context = useContext(HRContext);
  if (context === undefined) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
}
