import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1227/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
// Attach the JWT (if we have one) to every request so the backend's
// SecurityConfig can authenticate and authorize it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request comes back 401, the token is missing/expired/invalid - force a
// clean logout instead of leaving the app in a broken, half-authenticated state.
// The login request itself is excluded so a wrong password just shows an error
// on the login form instead of triggering this.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('hrms_user');
      localStorage.removeItem('hrms_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

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

// --- Password Reset Endpoints ---
export const forgotPassword = (usernameOrEmail) => api.post('/auth/forgot-password', { usernameOrEmail }).then(res => res.data);
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }).then(res => res.data);

// --- Leave Balance Endpoints ---
export const getLeaveBalances = (params) => api.get('/leave-balances', { params }).then(res => res.data);
export const createLeaveBalance = (data) => api.post('/leave-balances', data).then(res => res.data);
export const updateLeaveBalance = (id, data) => api.put(`/leave-balances/${id}`, data).then(res => res.data);
export const deleteLeaveBalance = (id) => api.delete(`/leave-balances/${id}`).then(res => res.data);

// --- Performance Review Endpoints ---
export const getPerformanceReviews = (params) => api.get('/performance-reviews', { params }).then(res => res.data);
export const createPerformanceReview = (data) => api.post('/performance-reviews', data).then(res => res.data);
export const updatePerformanceReview = (id, data) => api.put(`/performance-reviews/${id}`, data).then(res => res.data);
export const deletePerformanceReview = (id) => api.delete(`/performance-reviews/${id}`).then(res => res.data);

// --- Skills Endpoints ---
export const getSkills = () => api.get('/skills').then(res => res.data);
export const createSkill = (data) => api.post('/skills', data).then(res => res.data);
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data).then(res => res.data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`).then(res => res.data);

// --- Employee Skill Endpoints ---
export const getEmployeeSkills = (params) => api.get('/employee-skills', { params }).then(res => res.data);
export const getSkillGapAnalysis = (employeeId) => api.get(`/employee-skills/gap-analysis/${employeeId}`).then(res => res.data);
export const createEmployeeSkill = (data) => api.post('/employee-skills', data).then(res => res.data);
export const updateEmployeeSkill = (id, data) => api.put(`/employee-skills/${id}`, data).then(res => res.data);
export const deleteEmployeeSkill = (id) => api.delete(`/employee-skills/${id}`).then(res => res.data);

// --- Role Required Skill Endpoints ---
export const getRoleRequiredSkills = () => api.get('/role-required-skills').then(res => res.data);
export const createRoleRequiredSkill = (data) => api.post('/role-required-skills', data).then(res => res.data);
export const updateRoleRequiredSkill = (id, data) => api.put(`/role-required-skills/${id}`, data).then(res => res.data);
export const deleteRoleRequiredSkill = (id) => api.delete(`/role-required-skills/${id}`).then(res => res.data);

// --- Attrition Risk Endpoints ---
export const getAttritionIndicators = (params) => api.get('/attrition', { params }).then(res => res.data);
export const computeAttritionForAll = () => api.post('/attrition/compute').then(res => res.data);
export const computeAttritionForEmployee = (employeeId) => api.post(`/attrition/compute/${employeeId}`).then(res => res.data);

// --- Analytics Endpoints ---
export const getAnalyticsSummary = () => api.get('/analytics/summary').then(res => res.data);

export default api;