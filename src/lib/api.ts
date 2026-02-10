const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

export const api = {
    // Auth (No token needed)
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
        const response = await fetch(`${API_BASE_URL}/employees`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch employees');
        return response.json();
    },
    getEmployee: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch employee');
        return response.json();
    },
    createEmployee: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create employee');
        return response.json();
    },
    updateEmployee: async (id: string, data: any) => {
        const isFormData = data instanceof FormData;
        const headers = getHeaders(isFormData);
        const body = isFormData ? data : JSON.stringify(data);

        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers,
            body,
        });
        if (!response.ok) throw new Error('Failed to update employee');
        return response.json();
    },
    deleteEmployee: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete employee');
        return response.json();
    },
    addCertificate: async (id: string, file: File, name: string) => {
        const formData = new FormData();
        formData.append('certificate', file);
        formData.append('name', name);

        const response = await fetch(`${API_BASE_URL}/employees/${id}/certificates`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to add certificate');
        return response.json();
    },

    // Departments
    getDepartments: async () => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch departments');
        return response.json();
    },
    addDepartment: async (name: string) => {
        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name }),
        });
        if (!response.ok) throw new Error('Failed to add department');
        return response.json();
    },
    deleteDepartment: async (name: string) => {
        const response = await fetch(`${API_BASE_URL}/departments/${name}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete department');
        return response.json();
    },

    // Settings
    getSettings: async () => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },
    updateSettings: async (settings: any) => {
        const isFormData = settings instanceof FormData;
        const headers = getHeaders(isFormData);
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
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch attendance');
        return response.json();
    },
    recordAttendance: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to record attendance');
        return response.json();
    },
    updateAttendance: async (id: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update attendance');
        return response.json();
    },

    // Leaves
    getLeaves: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch leaves');
        return response.json();
    },
    requestLeave: async (data: any) => {
        const isFormData = data instanceof FormData;
        const headers = getHeaders(isFormData);
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
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update leave');
        return response.json();
    },
    getLeaveBalances: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves/balances`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch leave balances');
        return response.json();
    },
    getLeaveBalance: async (userId: string) => {
        const response = await fetch(`${API_BASE_URL}/leaves/balance/${userId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch leave balance');
        return response.json();
    },
    verifyUser: async () => {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Token verification failed');
        return response.json();
    }
};
