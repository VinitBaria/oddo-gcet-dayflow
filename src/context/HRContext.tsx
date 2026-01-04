import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AttendanceRecord, LeaveRequest, LeaveBalance, AttendanceStatus, LeaveStatus, LeaveType } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string; // ISO string 
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

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
  manualAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  getUserAttendance: (userId: string) => AttendanceRecord[];
  activeSession: AttendanceRecord | undefined; // Add activeSession


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
  updateSettings: (updates: Partial<HRSettings> | FormData) => void;

  // Notifications
  notifications: Notification[];
}

interface HRSettings {
  companyName: string;
  workingHoursPerDay: number;
  overtimeMultiplier: number;
  defaultPaidLeave: number;
  defaultSickLeave: number;
  emailNotifications: boolean;
  autoApproveLeave: boolean;
  companyLogoUrl?: string;
}

const defaultSettings: HRSettings = {
  companyName: 'Dayflow Inc.',
  workingHoursPerDay: 8,
  overtimeMultiplier: 1.5,
  defaultPaidLeave: 15,
  defaultSickLeave: 10,
  emailNotifications: true,
  autoApproveLeave: false,
  companyLogoUrl: '',
};

const HRContext = createContext<HRContextType | undefined>(undefined);

export function HRProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Get user from AuthContext
  const [employees, setEmployees] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>({});
  const [activeSession, setActiveSession] = useState<AttendanceRecord | undefined>(undefined);

  // Derived Notifications
  const notifications: Notification[] = React.useMemo(() => {
    if (!user) return [];

    const notifs: Notification[] = [];

    // 1. Admin Notifications: Pending Leave Requests
    if (user.role === 'admin') {
      const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');
      pendingLeaves.forEach(req => {
        notifs.push({
          id: `leave-req-${req.id}`,
          title: 'New Leave Request',
          message: `${req.userName} requested leave involved ${new Date(req.startDate).toLocaleDateString()}`, // Simplified message
          time: req.createdAt,
          read: false,
          type: 'info'
        });
      });
    }

    // 2. Employee Notifications: Approved/Rejected Requests
    // We filter requests made by THIS user that are NOT pending
    const myRequests = leaveRequests.filter(r => r.userId === user.id && r.status !== 'pending');
    myRequests.forEach(req => {
      // In a real app we'd track "read" status in DB. 
      // For now, let's show recent ones (e.g. last 3 days?) or just all history?
      // Let's show all for demo, sorted by date.
      notifs.push({
        id: `leave-update-${req.id}`,
        title: `Leave Request ${req.status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your request for ${new Date(req.startDate).toLocaleDateString()} has been ${req.status}.`,
        time: req.createdAt, // Ideally we'd have updatedAt, but createdAt is close enough fallback or we assume recent action
        read: false,
        type: req.status === 'approved' ? 'success' : 'error'
      });
    });

    // Sort by time descending
    return notifs.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
  }, [leaveRequests, user]);


  // Initialize with hardcoded departments
  const [departments, setDepartments] = useState<string[]>([
    'Management',
    'Human Resources',
    'Engineering',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Customer Support',
    'IT',
    'Legal',
    'Research & Development',
    'Quality Assurance'
  ]);

  const [settings, setSettings] = useState<HRSettings>(defaultSettings);

  React.useEffect(() => {
    // Only fetch if we have a user (logged in)
    if (!user) {
      // Optional: clear state on logout? For now, we just don't fetch.
      // setEmployees([]); 
      return;
    }

    const fetchData = async () => {
      try {
        const [empData, attData, leaveData, balanceData, deptData] = await Promise.all([
          api.getEmployees(),
          api.getAttendance(),
          api.getLeaves(),
          api.getLeaveBalances(),
          api.getDepartments()
        ]);

        setEmployees(empData);
        setAttendanceRecords(attData);
        setLeaveRequests(leaveData);

        // Merge API departments with hardcoded ones (remove duplicates)
        const allDepartments = [...new Set([
          'Management',
          'Human Resources',
          'Engineering',
          'Marketing',
          'Sales',
          'Finance',
          'Operations',
          'Customer Support',
          'IT',
          'Legal',
          'Research & Development',
          'Quality Assurance',
          ...deptData
        ])];
        setDepartments(allDepartments);

        const balances: Record<string, LeaveBalance> = {};
        balanceData.forEach((b: any) => {
          balances[b.userId] = { paid: b.paid, sick: b.sick, unpaid: b.unpaid };
        });
        setLeaveBalances(balances);

        // Derive Employee Status
        const today = new Date().toISOString().split('T')[0];
        const derivedEmployees = empData.map((emp: User) => {
          // 1. Check for Active/Approved Leave
          const onLeave = leaveData.find((l: LeaveRequest) =>
            l.userId === emp.id &&
            l.status === 'approved' &&
            l.startDate <= today &&
            l.endDate >= today
          );

          if (onLeave) return { ...emp, status: 'on_leave' };

          // 2. Check for Attendance Today
          const hasAttendance = attData.some((a: AttendanceRecord) =>
            a.userId === emp.id && a.date === today
          );

          if (hasAttendance) return { ...emp, status: 'present' };

          // 3. Default to Absent (if neither above)
          return { ...emp, status: 'absent' };
        });

        setEmployees(derivedEmployees);

        // Also fetch settings to ensure we have the latest logo
        try {
          const settingsData = await api.getSettings(); // Assuming this API exists or we use default fallback
          if (settingsData) setSettings(prev => ({ ...prev, ...settingsData }));
        } catch (e) {
          console.warn("Could not fetch settings", e);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user]); // Re-run when user changes

  // Update active session explicitly when attendanceRecords change
  React.useEffect(() => {
    if (user && attendanceRecords.length > 0) {
      // Find ANY record for the user that has NO checkout time
      // We take the latest one if multiple (though theoretically should be one)
      const current = attendanceRecords
        .filter(r => r.userId === user.id && !r.checkOut)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      setActiveSession(current);
    } else {
      setActiveSession(undefined);
    }
  }, [attendanceRecords, user]);


  // Employee Management
  const generateEmployeeId = () => {
    const year = new Date().getFullYear();
    const count = employees.length + 1;
    return `OIJODO${year}${count.toString().padStart(4, '0')}`;
  };

  const addEmployee = async (employee: Omit<User, 'id' | 'employeeId'>) => {
    try {
      const savedEmployee = await api.createEmployee(employee);

      // Update state with the REAL employee from DB (including ID and companyName)
      setEmployees(prev => [...prev, savedEmployee]);

      // Initialize local leave balance state (matches backend default)
      setLeaveBalances(prev => ({
        ...prev,
        [savedEmployee.id]: {
          paid: settings.defaultPaidLeave,
          sick: settings.defaultSickLeave,
          unpaid: 0,
          companyName: savedEmployee.companyName
        }
      }));
    } catch (error) {
      console.error('Failed to add employee:', error);
    }
  };

  const updateEmployee = (id: string, updates: Partial<User>) => {
    setEmployees(prev =>
      prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    );
  };

  const deleteEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setLeaveBalances(prev => {
        const newBalances = { ...prev };
        delete newBalances[id];
        return newBalances;
      });
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  // Attendance Management
  const checkIn = async (userId: string) => {
    // Use local date YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    try {
      const newRecord = {
        id: Date.now().toString(), // Generate ID
        userId,
        date: today,
        checkIn: time,
        status: 'present',
      };

      const savedRecord = await api.recordAttendance(newRecord);

      // Always append new record, do not overwrite previous records for the same day
      // This supports multiple check-in/out sessions per day
      setAttendanceRecords(prev => [...prev, savedRecord]);

      // Persist status change to backend
      await api.updateEmployee(userId, { status: 'present' });
      // Update local state
      updateEmployee(userId, { status: 'present' });
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const checkOut = async (userId: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Find the active record (one without checkout) regardless of date
    const record = attendanceRecords.find(r => r.userId === userId && !r.checkOut);

    // If no active record, maybe they forgot to check in? 
    if (!record) return;

    // Use record.date for checkInDate construction
    const checkInDate = new Date(`${record.date}T${record.checkIn}`);

    // For checkOutDate, we use "today" (local) if it matches record date, or we construct full date
    // Actually simpler: just use now() for end time calculation to be accurate across midnight
    const checkOutDate = now;

    // Safety check for date mismatch (if record date != today date)
    // If we just use time string, we lose day info. 
    // We only store 'checkOut' as TIME string in DB. 
    // If it spans midnight, we might have issues if we only look at time string for duration later.
    // But for now, let's calculate duration using full Date objects.

    const diff = checkOutDate.getTime() - checkInDate.getTime();
    const hoursWorked = diff / 3600000;
    const extraHours = Math.max(0, hoursWorked - settings.workingHoursPerDay);

    const updatedRecordData = {
      checkOut: time,
      workHours: parseFloat(hoursWorked.toFixed(2)),
      extraHours: parseFloat(extraHours.toFixed(2)),
      status: 'present' as AttendanceStatus
    };

    try {
      const savedRecord = await api.updateAttendance(record.id, updatedRecordData);
      setAttendanceRecords(prev =>
        prev.map(r => r.id === record.id ? savedRecord : r)
      );
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  const manualAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      const newRecord = { ...record, id: Date.now().toString() };
      const savedRecord = await api.recordAttendance(newRecord);
      setAttendanceRecords(prev => {
        const index = prev.findIndex(r => r.userId === record.userId && r.date === record.date && r.checkIn === record.checkIn);
        if (index >= 0) {
          // This logic is a bit flawed for unique ID based updates but for manual entry usually it's a new record
          // unless we are updating. But let's just append or update if ID existed (which it didn't in Omit).
          // Actually manual entry is usually "CREATE".
          return [...prev, savedRecord];
        }
        return [...prev, savedRecord];
      });
    } catch (error) {
      console.error("Failed to add manual attendance", error);
      throw error;
    }
  };

  const getUserAttendance = (userId: string) =>
    attendanceRecords.filter(r => r.userId === userId);

  // Leave Management
  // Leave Management
  const submitLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'> | FormData) => {
    try {
      let payload: any;
      const isFormData = request instanceof FormData;

      if (isFormData) {
        request.append('id', (leaveRequests.length + 1).toString());
        request.append('status', settings.autoApproveLeave ? 'approved' : 'pending');
        request.append('createdAt', new Date().toISOString().split('T')[0]);
        payload = request;
      } else {
        payload = {
          ...request,
          id: (leaveRequests.length + 1).toString(),
          status: settings.autoApproveLeave ? 'approved' : 'pending',
          createdAt: new Date().toISOString().split('T')[0],
        };
      }

      const savedRequest = await api.requestLeave(payload);
      setLeaveRequests(prev => [...prev, savedRequest]);

      if (settings.autoApproveLeave) {
        if (isFormData) {
          const userId = request.get('userId') as string;
          const type = request.get('type') as LeaveType;
          const startDate = request.get('startDate') as string;
          const endDate = request.get('endDate') as string;
          deductLeaveBalance(userId, type, startDate, endDate);
        } else {
          // @ts-ignore
          deductLeaveBalance(request.userId, request.type, request.startDate, request.endDate);
        }
      }
    } catch (error) {
      console.error('Submit leave failed:', error);
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

  const approveLeaveRequest = async (id: string) => {
    try {
      await api.updateLeave(id, 'approved');

      const request = leaveRequests.find(r => r.id === id);
      if (request) {
        setLeaveRequests(prev =>
          prev.map(r => r.id === id ? { ...r, status: 'approved' as LeaveStatus } : r)
        );
        deductLeaveBalance(request.userId, request.type, request.startDate, request.endDate);

        const today = new Date().toISOString().split('T')[0];
        if (request.startDate <= today && request.endDate >= today) {
          await api.updateEmployee(request.userId, { status: 'on_leave' });
          updateEmployee(request.userId, { status: 'on_leave' });
        }
      }
    } catch (error) {
      console.error('Approve leave failed:', error);
    }
  };

  const rejectLeaveRequest = async (id: string) => {
    try {
      await api.updateLeave(id, 'rejected');
      setLeaveRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'rejected' as LeaveStatus } : r)
      );
    } catch (error) {
      console.error('Reject leave failed:', error);
    }
  };

  const updateLeaveBalance = (userId: string, balance: LeaveBalance) => {
    setLeaveBalances(prev => ({ ...prev, [userId]: balance }));
  };

  // Department Management
  const addDepartment = async (name: string) => {
    if (!departments.includes(name)) {
      try {
        await api.addDepartment(name);
        setDepartments(prev => [...prev, name]);
      } catch (error) {
        console.error('Failed to add department', error);
      }
    }
  };

  const removeDepartment = async (name: string) => {
    try {
      await api.deleteDepartment(name);
      setDepartments(prev => prev.filter(d => d !== name));
    } catch (error) {
      console.error('Failed to remove department', error);
    }
  };

  // Settings
  const updateSettings = async (updates: Partial<HRSettings> | FormData) => {
    try {
      // We pass the updates directly to the API (whether object or FormData)
      // The API returns the FULL updated settings object
      const updatedSettings = await api.updateSettings(updates);

      // We update our local state with the response from the server
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings', error);
    }
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
      manualAttendance,
      getUserAttendance,
      activeSession, // Export activeSession
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
      notifications, // Export
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
