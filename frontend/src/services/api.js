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
export const getUserById = (id) => api.get(`/users/${id}`).then(res => res.data);
export const createUser = (data) => api.post('/users', data).then(res => res.data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then(res => res.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then(res => res.data);

// --- Employee Endpoints ---
export const getEmployees = () => api.get('/employees').then(res => res.data);
export const createEmployee = (data) => api.post('/employees', data).then(res => res.data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data).then(res => res.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then(res => res.data);

// --- Department Endpoints ---
export const getDepartments = () => api.get('/departments').then(res => res.data);
export const createDepartment = (data) => api.post('/departments', data).then(res => res.data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data).then(res => res.data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`).then(res => res.data);

// --- Attendance Endpoints ---
export const getAttendance = (params) => api.get('/attendance', { params }).then(res => res.data);
export const createAttendance = (data) => api.post('/attendance', data).then(res => res.data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data).then(res => res.data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`).then(res => res.data);

// --- Leave Request Endpoints ---
export const getLeaveRequests = (params) => api.get('/leave-requests', { params }).then(res => res.data);
export const createLeaveRequest = (data) => api.post('/leave-requests', data).then(res => res.data);
export const updateLeaveRequest = (id, data) => api.put(`/leave-requests/${id}`, data).then(res => res.data);
export const approveLeaveRequest = (id, approverId) => api.patch(`/leave-requests/${id}/approve`, { approverId }).then(res => res.data);
export const rejectLeaveRequest = (id, approverId) => api.patch(`/leave-requests/${id}/reject`, { approverId }).then(res => res.data);
export const deleteLeaveRequest = (id) => api.delete(`/leave-requests/${id}`).then(res => res.data);

// --- Payroll Endpoints ---
export const getPayroll = (params) => api.get('/payroll', { params }).then(res => res.data);
export const createPayroll = (data) => api.post('/payroll', data).then(res => res.data);
export const updatePayroll = (id, data) => api.put(`/payroll/${id}`, data).then(res => res.data);
export const deletePayroll = (id) => api.delete(`/payroll/${id}`).then(res => res.data);

export default api;