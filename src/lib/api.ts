const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
    // Auth
    login: async (credentials: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Login failed (${response.status} ${response.statusText})`);
        }
        return response.json();
    },
    signup: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Signup failed (${response.status} ${response.statusText})`);
        }
        return response.json();
    },

    // Employees
    getEmployees: async () => {
        const response = await fetch(`${API_BASE_URL}/employees`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        return response.json();
    },
    getEmployee: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`);
        if (!response.ok) throw new Error('Failed to fetch employee');
        return response.json();
    },
    createEmployee: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create employee');
        return response.json();
    },
    updateEmployee: async (id: string, data: any) => {
        const isFormData = data instanceof FormData;
        const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
        const body = isFormData ? data : JSON.stringify(data);

        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers,
            body,
        });
        if (!response.ok) throw new Error('Failed to update employee');
        return response.json();
    },
    addCertificate: async (id: string, file: File, name: string) => {
        const formData = new FormData();
        formData.append('certificate', file);
        formData.append('name', name);

        const response = await fetch(`${API_BASE_URL}/employees/${id}/certificates`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to add certificate');
        return response.json();
    },

    // Departments
    getDepartments: async () => {
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) throw new Error('Failed to fetch departments');
        return response.json();
    },
    addDepartment: async (name: string) => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!response.ok) throw new Error('Failed to add department');
        return response.json();
    },
    deleteDepartment: async (name: string) => {
        const response = await fetch(`${API_BASE_URL}/departments/${name}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete department');
        return response.json();
    },

    // Settings
    getSettings: async () => {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },
    updateSettings: async (settings: any) => {
        const isFormData = settings instanceof FormData;
        const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
        const body = isFormData ? settings : JSON.stringify(settings);

        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers,
            body,
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
    },

    // Attendance
    getAttendance: async () => {
        const response = await fetch(`${API_BASE_URL}/attendance`);
        if (!response.ok) throw new Error('Failed to fetch attendance');
        return response.json();
    },
    recordAttendance: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to record attendance');
        return response.json();
    },
    updateAttendance: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update attendance');
        return response.json();
    },

    // Leaves
    getLeaves: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves`);
        if (!response.ok) throw new Error('Failed to fetch leaves');
        return response.json();
    },
    requestLeave: async (data: any) => {
        const isFormData = data instanceof FormData;
        const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
        const body = isFormData ? data : JSON.stringify(data);

        const response = await fetch(`${API_BASE_URL}/leaves`, {
            method: 'POST',
            headers,
            body,
        });
        if (!response.ok) throw new Error('Failed to request leave');
        return response.json();
    },
    updateLeave: async (id: string, status: string) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update leave');
        return response.json();
    },
    getLeaveBalances: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves/balances`);
        if (!response.ok) throw new Error('Failed to fetch leave balances');
        return response.json();
    },
    getLeaveBalance: async (userId: string) => {
        const response = await fetch(`${API_BASE_URL}/leaves/balance/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch leave balance');
        return response.json();
    },
};
