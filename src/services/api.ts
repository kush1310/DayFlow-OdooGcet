// API Service Layer for DayFlow HR System
// Base URL for backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// Helper function to create headers with auth
const getHeaders = (): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'An error occurred' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// ==================== AUTHENTICATION ====================
export const authAPI = {
    login: async (email: string, password: string) => {
        console.log('🔐 Attempting login for:', email);
        console.log('📡 API URL:', `${API_BASE_URL}/auth/login`);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        console.log('📥 Response status:', response.status, response.statusText);
        console.log('📥 Response OK:', response.ok);

        const data = await handleResponse(response);

        console.log('✅ Login data received:', data);

        if (data.token) {
            localStorage.setItem('authToken', data.token);
            console.log('🔑 Token saved to localStorage');
        }

        return data;
    },

    register: async (userData: {
        employeeId: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
        department?: string;
        position?: string;
        phone?: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await handleResponse(response);

        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }

        return data;
    },

    logout: () => {
        localStorage.removeItem('authToken');
    },
};

// ==================== USER PROFILE ====================
export const userAPI = {
    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    updateProfile: async (profileData: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        address?: string;
        profilePicture?: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData),
        });
        return handleResponse(response);
    },

    getAllUsers: async (params?: { department?: string; search?: string }) => {
        const queryParams = new URLSearchParams(params as Record<string, string>);
        const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// ==================== LEAVE MANAGEMENT ====================
export const leaveAPI = {
    submitRequest: async (leaveData: {
        leaveType: 'paid' | 'sick' | 'unpaid';
        startDate: string;
        endDate: string;
        reason: string;
    }) => {
        const response = await fetch(`${API_BASE_URL}/leaves/request`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(leaveData),
        });
        return handleResponse(response);
    },

    getMyRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves/my-requests`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getBalance: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves/balance`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getPendingRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/leaves/pending`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getAllRequests: async (status?: string) => {
        const queryParams = status ? `?status=${status}` : '';
        const response = await fetch(`${API_BASE_URL}/leaves/all${queryParams}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    approveRequest: async (id: string, adminComment?: string) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}/approve`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ adminComment }),
        });
        return handleResponse(response);
    },

    rejectRequest: async (id: string, adminComment?: string) => {
        const response = await fetch(`${API_BASE_URL}/leaves/${id}/reject`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ adminComment }),
        });
        return handleResponse(response);
    },
};

// ==================== ATTENDANCE ====================
export const attendanceAPI = {
    checkIn: async () => {
        const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    checkOut: async () => {
        const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getMyRecords: async (params?: { startDate?: string; endDate?: string; limit?: number }) => {
        const queryParams = new URLSearchParams(params as Record<string, string>);
        const response = await fetch(`${API_BASE_URL}/attendance/my-records?${queryParams}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getSummary: async () => {
        const response = await fetch(`${API_BASE_URL}/attendance/summary`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getAllRecords: async (params?: { date?: string; userId?: string }) => {
        const queryParams = new URLSearchParams(params as Record<string, string>);
        const response = await fetch(`${API_BASE_URL}/attendance/all?${queryParams}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// ==================== PAYROLL ====================
export const payrollAPI = {
    getSalary: async () => {
        const response = await fetch(`${API_BASE_URL}/payroll/salary`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getPayslips: async () => {
        const response = await fetch(`${API_BASE_URL}/payroll/payslips`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    downloadPayslip: async (month: string, year: string) => {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/payroll/payslip/${month}/${year}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download payslip');
        }

        // Return blob for download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${month}_${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
    },

    updateSalary: async (userId: string, salaryData: {
        basicSalary?: number;
        allowances?: number;
        deductions?: number;
    }) => {
        const response = await fetch(`${API_BASE_URL}/payroll/update/${userId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(salaryData),
        });
        return handleResponse(response);
    },
};

// ==================== EMPLOYEES ====================
export const employeeAPI = {
    getAll: async (params?: { department?: string; search?: string }) => {
        const queryParams = new URLSearchParams(params as Record<string, string>);
        const response = await fetch(`${API_BASE_URL}/employees?${queryParams}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    addEmployee: async (employeeData: {
        employeeId: string;
        email: string;
        firstName: string;
        lastName: string;
        department: string;
        position: string;
        phone?: string;
        joiningDate?: string;
        basicSalary?: number;
        allowances?: number;
        deductions?: number;
    }) => {
        const response = await fetch(`${API_BASE_URL}/employees/add`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(employeeData),
        });
        return handleResponse(response);
    },

    async getDepartments() {
        const response = await fetch(`${API_BASE_URL}/employees/departments`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    async getPositions() {
        const response = await fetch(`${API_BASE_URL}/employees/positions`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    async getStatistics() {
        const response = await fetch(`${API_BASE_URL}/employees/statistics`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// ==================== ANALYTICS ====================
export const analyticsAPI = {
    getDashboard: async () => {
        const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getAttendanceAnalytics: async (params?: { startDate?: string; endDate?: string }) => {
        const queryParams = new URLSearchParams(params as Record<string, string>);
        const response = await fetch(`${API_BASE_URL}/analytics/attendance?${queryParams}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getLeaveTrends: async () => {
        const response = await fetch(`${API_BASE_URL}/analytics/leave-trends`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// ==================== PERMISSIONS (HR SYSTEM) ====================
export const permissionsAPI = {
    grant: async (userId: number, permissionType: string) => {
        const response = await fetch(`${API_BASE_URL}/permissions/grant`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId, permissionType }),
        });
        return handleResponse(response);
    },

    revoke: async (userId: number, permission: string) => {
        const response = await fetch(`${API_BASE_URL}/permissions/revoke/${userId}/${permission}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getUserPermissions: async (userId: number) => {
        const response = await fetch(`${API_BASE_URL}/permissions/${userId}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    listAll: async () => {
        const response = await fetch(`${API_BASE_URL}/permissions/list`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

// Export all APIs
export const api = {
    auth: authAPI,
    user: userAPI,
    leave: leaveAPI,
    attendance: attendanceAPI,
    payroll: payrollAPI,
    employee: employeeAPI,
    analytics: analyticsAPI,
    permissions: permissionsAPI,
};

export default api;
