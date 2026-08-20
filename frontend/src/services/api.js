import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1227/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Auth Endpoints ---
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// --- User Endpoints ---
export const getUsers = () => api.get('/users').then(res => res.data);
export const createUser = (data) => api.post('/users', data).then(res => res.data);

// --- Employee Endpoints ---
export const getEmployees = () => api.get('/employees').then(res => res.data);
export const createEmployee = (data) => api.post('/employees', data).then(res => res.data);

// --- Department Endpoints ---
export const getDepartments = () => api.get('/departments').then(res => res.data);
export const createDepartment = (data) => api.post('/departments', data).then(res => res.data);

// --- Attendance Endpoints ---
export const getAttendance = (params) => api.get('/attendance', { params }).then(res => res.data);
export const createAttendance = (data) => api.post('/attendance', data).then(res => res.data);

// --- Leave Request Endpoints ---
export const getLeaveRequests = (params) => api.get('/leave-requests', { params }).then(res => res.data);
export const createLeaveRequest = (data) => api.post('/leave-requests', data).then(res => res.data);
export const approveLeaveRequest = (id, approverId) => api.patch(`/leave-requests/${id}/approve`, { approverId }).then(res => res.data);
export const rejectLeaveRequest = (id, approverId) => api.patch(`/leave-requests/${id}/reject`, { approverId }).then(res => res.data);

// --- Payroll Endpoints ---
export const getPayroll = (params) => api.get('/payroll', { params }).then(res => res.data);
export const createPayroll = (data) => api.post('/payroll', data).then(res => res.data);

export default api;