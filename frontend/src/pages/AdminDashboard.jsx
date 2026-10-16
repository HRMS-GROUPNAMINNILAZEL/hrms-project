import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  deleteLeaveRequest,
  exportToCsv
} from '../services/api';
import LeaveBalancesTab from './admin/LeaveBalancesTab';
import PerformanceReviewsTab from './admin/PerformanceReviewsTab';
import SkillsTab from './admin/SkillsTab';
import AttritionTab from './admin/AttritionTab';
import AnalyticsTab from './admin/AnalyticsTab';
import AttendanceTab from './admin/AttendanceTab';
import DashboardCharts from './admin/DashboardCharts';
import EmployeeDirectory from './admin/EmployeeDirectory';
import Pagination from './admin/Pagination';
import { IconDashboard, IconAnalytics, IconEmployees, IconDirectory, IconUsers, IconDepartment, IconLeave, IconLeaveBalance, IconAttendance, IconPerformance, IconSkills, IconAttrition, IconLogout, IconSun, IconMoon, IconRefresh, IconPlus, IconDownload } from '../components/Icons';

const PAGE_SIZE = 10;

// --- Shared inline style helpers (InsightX-inspired design system) ---
const btn = (bg) => ({ padding: '10px 18px', backgroundColor: bg, color: bg === '#84cc16' || bg === '#65a30d' ? '#09090b' : '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease', letterSpacing: '0.01em' });
const smallBtn = (bg) => ({ padding: '7px 14px', backgroundColor: bg, color: bg === '#84cc16' || bg === '#65a30d' ? '#09090b' : '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginRight: '8px', transition: 'all 0.2s ease' });
const badge = (bg, color) => ({ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', backgroundColor: bg, color, display: 'inline-flex', alignItems: 'center' });

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '14px 20px', fontSize: '11px', fontWeight: '600', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' };
  const td = { padding: '16px 20px', fontSize: '13px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '13px' };
  const label = { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: theme.text, letterSpacing: '0.01em' };
  const input = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '10px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' };
  const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalBox = { backgroundColor: theme.cardBg, padding: '32px', borderRadius: '16px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: theme.text, border: `1px solid ${theme.border}` };
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- Search / filter / pagination (client-side; datasets here are small) ---
  const [empSearch, setEmpSearch] = useState('');
  const [empStatusFilter, setEmpStatusFilter] = useState('all');
  const [empDeptFilter, setEmpDeptFilter] = useState('all');
  const [empPage, setEmpPage] = useState(1);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);

  // Any time a search term or filter changes, jump back to page 1 - staying on
  // page 4 of a filtered-down list that now only has 1 page looks like a bug.
  useEffect(() => { setEmpPage(1); }, [empSearch, empStatusFilter, empDeptFilter]);
  useEffect(() => { setUserPage(1); }, [userSearch, userRoleFilter]);

  const filteredEmployees = employees.filter((emp) => {
    const q = empSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
      (emp.position || '').toLowerCase().includes(q) ||
      (emp.contactNumber || '').toLowerCase().includes(q);
    const matchesStatus = empStatusFilter === 'all' || emp.status === empStatusFilter;
    const matchesDept = empDeptFilter === 'all' || emp.department?.departmentId === Number(empDeptFilter);
    return matchesSearch && matchesStatus && matchesDept;
  });
  const pagedEmployees = filteredEmployees.slice((empPage - 1) * PAGE_SIZE, empPage * PAGE_SIZE);

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      u.username.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });
  const pagedUsers = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);

  useEffect(() => {
    if (user?.role !== 'admin' && activeTab === 'users') {
      setActiveTab('dashboard');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'employees') {
        const [empData, deptData] = await Promise.all([getEmployees(), getDepartments()]);
        setEmployees(empData);
        setDepartments(deptData);
      } else if (activeTab === 'users') {
        const usrData = await getUsers();
        setUsers(usrData);
      } else if (activeTab === 'departments') {
        const [deptData, empData] = await Promise.all([getDepartments(), getEmployees()]);
        setDepartments(deptData);
        setEmployees(empData);
      } else if (activeTab === 'leaveRequests') {
        const leaveData = await getLeaveRequests();
        setLeaveRequests(leaveData);
      } else if (activeTab === 'dashboard') {
        const [empData, deptData, leaveData] = await Promise.all([getEmployees(), getDepartments(), getLeaveRequests()]);
        setEmployees(empData);
        setDepartments(deptData);
        setLeaveRequests(leaveData);
      } else if (activeTab === 'directory') {
        const empData = await getEmployees();
        setEmployees(empData);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data from backend');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // Employees: Add (creates linked User + Employee) / Edit / Delete
  // =========================================================================
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyFormData = {
    username: '', email: '', password: '', role: 'employee',
    firstName: '', lastName: '', departmentId: '', position: '',
    hireDate: new Date().toISOString().split('T')[0], status: 'active',
    contactNumber: '', address: ''
  };
  const [formData, setFormData] = useState(emptyFormData);
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    let createdUser = null;

    try {
      // Step 1: admin provides the new hire's login credentials, so we create
      // the User account first.
      createdUser = await createUser({
        username: formData.username,
        email: formData.email,
        passwordHash: formData.password, // backend hashes this before saving
        role: formData.role,
        isActive: true
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create the user account');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        user: { userId: createdUser.userId },
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.departmentId ? { departmentId: Number(formData.departmentId) } : null,
        position: formData.position,
        hireDate: formData.hireDate,
        status: formData.status,
        contactNumber: formData.contactNumber,
        address: formData.address
      };

      await createEmployee(payload);
      setShowModal(false);
      setFormData(emptyFormData);
      loadData();
    } catch (err) {
      // Roll back the orphaned user account if the employee profile failed to save.
      try {
        await deleteUser(createdUser.userId);
      } catch (rollbackErr) {
        console.error('Failed to roll back orphaned user account:', rollbackErr);
      }
      setError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setSaving(false);
    }
  };

  // --- Edit Employee (profile fields only; login account is edited via System Users) ---
  const [showEmpEditModal, setShowEmpEditModal] = useState(false);
  const [empSaving, setEmpSaving] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const emptyEmpEditForm = { firstName: '', lastName: '', departmentId: '', position: '', hireDate: '', status: 'active', contactNumber: '', address: '' };
  const [empEditForm, setEmpEditForm] = useState(emptyEmpEditForm);

  const openEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmpEditForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      departmentId: emp.department?.departmentId || '',
      position: emp.position || '',
      hireDate: emp.hireDate || '',
      status: emp.status || 'active',
      contactNumber: emp.contactNumber || '',
      address: emp.address || ''
    });
    setError('');
    setShowEmpEditModal(true);
  };

  const handleEmpEditInputChange = (e) => setEmpEditForm({ ...empEditForm, [e.target.name]: e.target.value });

  const handleSaveEmployeeEdit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setError('');
    setEmpSaving(true);
    try {
      await updateEmployee(editingEmployee.employeeId, {
        firstName: empEditForm.firstName,
        lastName: empEditForm.lastName,
        departmentId: empEditForm.departmentId ? Number(empEditForm.departmentId) : null,
        position: empEditForm.position,
        // preserve the existing manager link - the edit form doesn't expose it,
        // and the backend overwrites manager unconditionally on update.
        managerId: editingEmployee.manager ? editingEmployee.manager.employeeId : null,
        hireDate: empEditForm.hireDate,
        status: empEditForm.status,
        contactNumber: empEditForm.contactNumber,
        address: empEditForm.address
      });
      setShowEmpEditModal(false);
      setEditingEmployee(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update employee');
    } finally {
      setEmpSaving(false);
    }
  };

  const handleDeleteEmployee = async (emp) => {
    if (!window.confirm(`Delete employee "${emp.firstName} ${emp.lastName}"? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteEmployee(emp.employeeId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete employee (they may have linked attendance or leave records)');
    }
  };

  // =========================================================================
  // System Users: Add / Edit / Delete
  // =========================================================================
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('add'); // 'add' | 'edit'
  const [userSaving, setUserSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const emptyUserForm = { username: '', email: '', password: '', role: 'employee', isActive: true };
  const [userForm, setUserForm] = useState(emptyUserForm);

  const openAddUser = () => {
    setUserModalMode('add');
    setEditingUser(null);
    setUserForm(emptyUserForm);
    setError('');
    setShowUserModal(true);
  };

  const openEditUser = (u) => {
    setUserModalMode('edit');
    setEditingUser(u);
    setUserForm({ username: u.username, email: u.email, password: '', role: u.role, isActive: u.isActive });
    setError('');
    setShowUserModal(true);
  };

  const handleUserInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm({ ...userForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError('');

    if (userForm.password && userForm.password.length > 0 && userForm.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (userModalMode === 'add' && userForm.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setUserSaving(true);
    try {
      const payload = {
        username: userForm.username,
        email: userForm.email,
        passwordHash: userForm.password, // backend hashes this; blank = keep existing on edit
        role: userForm.role,
        isActive: userForm.isActive
      };

      if (userModalMode === 'add') {
        await createUser(payload);
      } else {
        await updateUser(editingUser.userId, payload);
      }

      setShowUserModal(false);
      setUserForm(emptyUserForm);
      setEditingUser(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save user');
    } finally {
      setUserSaving(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteUser(u.userId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user (they may have a linked employee profile)');
    }
  };

  // =========================================================================
  // Departments: Add / Edit / Delete
  // =========================================================================
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptModalMode, setDeptModalMode] = useState('add');
  const [deptSaving, setDeptSaving] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const emptyDeptForm = { departmentName: '', departmentHeadId: '' };
  const [deptForm, setDeptForm] = useState(emptyDeptForm);

  const openAddDept = () => {
    setDeptModalMode('add');
    setEditingDept(null);
    setDeptForm(emptyDeptForm);
    setError('');
    setShowDeptModal(true);
  };

  const openEditDept = (d) => {
    setDeptModalMode('edit');
    setEditingDept(d);
    setDeptForm({ departmentName: d.departmentName || '', departmentHeadId: d.departmentHead?.employeeId || '' });
    setError('');
    setShowDeptModal(true);
  };

  const handleDeptInputChange = (e) => setDeptForm({ ...deptForm, [e.target.name]: e.target.value });

  const handleSaveDept = async (e) => {
    e.preventDefault();
    setError('');
    setDeptSaving(true);
    try {
      const payload = {
        departmentName: deptForm.departmentName,
        departmentHead: deptForm.departmentHeadId ? { employeeId: Number(deptForm.departmentHeadId) } : null
      };
      if (deptModalMode === 'add') {
        await createDepartment(payload);
      } else {
        await updateDepartment(editingDept.departmentId, payload);
      }
      setShowDeptModal(false);
      setDeptForm(emptyDeptForm);
      setEditingDept(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save department');
    } finally {
      setDeptSaving(false);
    }
  };

  const handleDeleteDept = async (d) => {
    if (!window.confirm(`Delete department "${d.departmentName}"? Employees assigned to it will need to be reassigned.`)) return;
    setError('');
    try {
      await deleteDepartment(d.departmentId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete department (it may still have employees assigned)');
    }
  };

  // =========================================================================
  // Leave Requests: Approve / Reject / Delete
  // =========================================================================
  const [rejectingLeave, setRejectingLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectSaving, setRejectSaving] = useState(false);

  const handleOpenRejectModal = (req) => {
    setRejectingLeave(req);
    setRejectionReason('');
  };

  const handleCloseRejectModal = () => {
    setRejectingLeave(null);
    setRejectionReason('');
  };

  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault();
    if (!rejectingLeave) return;
    setRejectSaving(true);
    setError('');
    try {
      await rejectLeaveRequest(rejectingLeave.leaveId, user.userId, rejectionReason.trim());
      handleCloseRejectModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reject leave request');
    } finally {
      setRejectSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      if (!id || id === "undefined") { console.error("Invalid ID", id); return; } await approveLeaveRequest(id, user.userId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to approve leave request');
    }
  };

  const handleDeleteLeaveRequest = async (req) => {
    if (!window.confirm('Delete this leave request record?')) return;
    setError('');
    try {
      await deleteLeaveRequest(req.leaveId || req._id);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete leave request');
    }
  };

  const SidebarItem = ({ itemKey, icon, text }) => {
    const [hovered, setHovered] = React.useState(false);
    const isActive = activeTab === itemKey;
    return (
      <li
        onClick={() => setActiveTab(itemKey)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ padding: '9px 14px', cursor: 'pointer', backgroundColor: isActive ? theme.sidebarActive : (hovered ? theme.sidebarHover : 'transparent'), borderRadius: '10px', marginBottom: '2px', color: isActive ? theme.sidebarActiveText : theme.sidebarText, fontWeight: isActive ? '600' : '400', fontSize: '13px', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.01em' }}
      >
        {icon} {text}
      </li>
    );
  };

  return (
    <div className="dashboard-shell" style={{ backgroundColor: theme.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: theme.text }}>
      {/* Sidebar */}
      <div className="dashboard-sidebar" style={{ backgroundColor: theme.sidebarBg, padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: `1px solid ${theme.border}` }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', padding: '4px 10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #84cc16, #65a30d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(132,204,22,0.3)' }}>
              <IconDashboard size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: theme.text, letterSpacing: '-0.3px' }}>HRMS</span>
          </div>

          <div style={{ fontSize: '10px', fontWeight: '600', color: theme.textSecondary || theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: '8px' }}>Main</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
            <SidebarItem itemKey="dashboard" icon={<IconDashboard size={16} />} text="Dashboard" />
            <SidebarItem itemKey="analytics" icon={<IconAnalytics size={16} />} text="Analytics" />
          </ul>

          <div style={{ fontSize: '10px', fontWeight: '600', color: theme.textSecondary || theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: '8px' }}>Management</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
            <SidebarItem itemKey="employees" icon={<IconEmployees size={16} />} text="Employees" />
            <SidebarItem itemKey="directory" icon={<IconDirectory size={16} />} text="Directory" />
            <SidebarItem itemKey="departments" icon={<IconDepartment size={16} />} text="Departments" />
            <SidebarItem itemKey="leaveRequests" icon={<IconLeave size={16} />} text="Leave Requests" />
            <SidebarItem itemKey="leaveBalances" icon={<IconLeaveBalance size={16} />} text="Leave Balances" />
            <SidebarItem itemKey="attendance" icon={<IconAttendance size={16} />} text="Attendance" />
          </ul>

          <div style={{ fontSize: '10px', fontWeight: '600', color: theme.textSecondary || theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: '8px' }}>Performance</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
            <SidebarItem itemKey="performanceReviews" icon={<IconPerformance size={16} />} text="Reviews" />
            <SidebarItem itemKey="skills" icon={<IconSkills size={16} />} text="Skills & Gap" />
            <SidebarItem itemKey="attrition" icon={<IconAttrition size={16} />} text="Attrition Risk" />
          </ul>

          {user?.role === 'admin' && (
            <>
              <div style={{ fontSize: '10px', fontWeight: '600', color: theme.textSecondary || theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: '8px' }}>System</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <SidebarItem itemKey="users" icon={<IconUsers size={16} />} text="System Users" />
              </ul>
            </>
          )}
        </div>
        <div>
          <div style={{ padding: '12px 14px', backgroundColor: theme.cardBg, borderRadius: '12px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: '10px', color: theme.textSecondary || theme.textMuted, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Logged in as</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{user.username}</div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: theme.primary, textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.05em' }}>
              {user.role === 'admin' ? 'Administrator' : 'HR Specialist'}
            </div>
          </div>
          <button
            onClick={logout}
            style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#ef4444', border: `1px solid ${theme.border}`, borderRadius: '10px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = theme.border; }}
          >
            <IconLogout size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: theme.text, margin: 0, letterSpacing: '-0.5px' }}>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'analytics' && 'Analytics Overview'}
            {activeTab === 'employees' && 'Employee Management'}
            {activeTab === 'directory' && 'Employee Directory'}
            {activeTab === 'users' && 'System Users'}
            {activeTab === 'departments' && 'Departments'}

            {activeTab === 'leaveRequests' && 'Leave Requests'}
            {activeTab === 'leaveBalances' && 'Leave Balances'}
            {activeTab === 'performanceReviews' && 'Performance Reviews'}
            {activeTab === 'skills' && 'Skills & Gap Analysis'}
            {activeTab === 'attrition' && 'Attrition Risk'}
            {activeTab === 'attendance' && 'Attendance Records'}
          </h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {activeTab === 'employees' && (
              <>
                <button onClick={() => setShowModal(true)} style={{ ...btn(theme.primary), color: theme.primaryText, display: 'flex', alignItems: 'center', gap: '6px' }}><IconPlus size={14} /> Add Employee</button>
                <button onClick={() => {
                  const rows = employees.map(e => ({
                    ID: e.employeeId,
                    'First Name': e.firstName,
                    'Last Name': e.lastName,
                    Department: e.department?.departmentName || '',
                    Position: e.position || '',
                    Status: e.status,
                    'Hire Date': e.hireDate,
                    Contact: e.contactNumber || '',
                  }));
                  exportToCsv('employees.csv', rows);
                }} style={{ ...btn(theme.cardBg), color: theme.text, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '6px' }}><IconDownload size={14} /> Export</button>
              </>
            )}
            {activeTab === 'users' && (
              <button onClick={openAddUser} style={{ ...btn(theme.primary), color: theme.primaryText, display: 'flex', alignItems: 'center', gap: '6px' }}><IconPlus size={14} /> Add User</button>
            )}
            {activeTab === 'departments' && (
              <button onClick={openAddDept} style={{ ...btn(theme.primary), color: theme.primaryText, display: 'flex', alignItems: 'center', gap: '6px' }}><IconPlus size={14} /> Add Department</button>
            )}
            {activeTab === 'leaveRequests' && (
              <button onClick={() => {
                const rows = leaveRequests.map(r => ({
                  ID: r.leaveId,
                  Employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
                  Type: r.leaveType,
                  'Start Date': r.startDate,
                  'End Date': r.endDate,
                  Reason: r.reason || '',
                  Status: r.status,
                }));
                exportToCsv('leave_requests.csv', rows);
              }} style={{ ...btn(theme.cardBg), color: theme.text, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '6px' }}><IconDownload size={14} /> Export CSV</button>
            )}

            <button onClick={loadData} style={{ ...btn(theme.cardBg), color: theme.text, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '6px' }}><IconRefresh size={14} /> Refresh</button>
            <button
              onClick={toggleTheme}
              style={{ padding: '10px 14px', backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
            >
              {isDarkMode ? <><IconSun size={14} /> Light</> : <><IconMoon size={14} /> Dark</>}
            </button>
          </div>
        </div>

        {error && <div style={{ color: theme.dangerText, marginBottom: '24px', backgroundColor: theme.dangerBg, padding: '14px 18px', borderRadius: '12px', border: `1px solid ${theme.dangerBorder}`, fontSize: '13px' }}>{error}</div>}

        {/* ---------------- Add Employee Modal ---------------- */}
        {showModal && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>Add New Employee</h3>
              <form onSubmit={handleCreateEmployee}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ ...label, fontWeight: 'bold' }}>Create Login Account</label>
                  <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '0', marginBottom: '8px' }}>
                    This creates the employee's system account along with their profile.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Username *</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} style={input}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="hr">HR</option>
                      {user?.role === 'admin' && <option value="admin">Admin</option>}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Temporary Password *</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength={8} style={input} />
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e9ecef', margin: '16px 0' }} />

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required style={input} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Department</label>
                    <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} style={input}>
                      <option value="">Select Department...</option>
                      {departments.map(d => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Position</label>
                    <input type="text" name="position" value={formData.position} onChange={handleInputChange} placeholder="e.g. Software Engineer" style={input} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Hire Date *</label>
                    <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} style={input}>
                      <option value="active">Active</option>
                      <option value="resigned">Resigned</option>
                      <option value="terminated">Terminated</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Contact Number</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="09171234567" style={input} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={label}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="City, Province" style={input} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} disabled={saving} style={btn('#6c757d')}>Cancel</button>
                  <button type="submit" disabled={saving} style={btn('#007bff')}>{saving ? 'Saving...' : 'Save Employee'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- Edit Employee Modal ---------------- */}
        {showEmpEditModal && editingEmployee && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>Edit Employee</h3>
              <p style={{ fontSize: '12px', color: '#6c757d', marginTop: 0 }}>
                Login credentials (username, email, role) are managed under System Users.
              </p>
              <form onSubmit={handleSaveEmployeeEdit}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>First Name *</label>
                    <input type="text" name="firstName" value={empEditForm.firstName} onChange={handleEmpEditInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Last Name *</label>
                    <input type="text" name="lastName" value={empEditForm.lastName} onChange={handleEmpEditInputChange} required style={input} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Department</label>
                    <select name="departmentId" value={empEditForm.departmentId} onChange={handleEmpEditInputChange} style={input}>
                      <option value="">Select Department...</option>
                      {departments.map(d => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Position</label>
                    <input type="text" name="position" value={empEditForm.position} onChange={handleEmpEditInputChange} style={input} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Hire Date *</label>
                    <input type="date" name="hireDate" value={empEditForm.hireDate} onChange={handleEmpEditInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Status</label>
                    <select name="status" value={empEditForm.status} onChange={handleEmpEditInputChange} style={input}>
                      <option value="active">Active</option>
                      <option value="resigned">Resigned</option>
                      <option value="terminated">Terminated</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Contact Number</label>
                  <input type="text" name="contactNumber" value={empEditForm.contactNumber} onChange={handleEmpEditInputChange} style={input} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={label}>Address</label>
                  <input type="text" name="address" value={empEditForm.address} onChange={handleEmpEditInputChange} style={input} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => { setShowEmpEditModal(false); setEditingEmployee(null); }} disabled={empSaving} style={btn('#6c757d')}>Cancel</button>
                  <button type="submit" disabled={empSaving} style={btn('#007bff')}>{empSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- Add / Edit User Modal ---------------- */}
        {showUserModal && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>{userModalMode === 'add' ? 'Add New User' : `Edit User: ${editingUser?.username}`}</h3>
              <form onSubmit={handleSaveUser}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Username *</label>
                    <input type="text" name="username" value={userForm.username} onChange={handleUserInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Role</label>
                    <select name="role" value={userForm.role} onChange={handleUserInputChange} style={input}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Email *</label>
                  <input type="email" name="email" value={userForm.email} onChange={handleUserInputChange} required style={input} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>{userModalMode === 'add' ? 'Password *' : 'New Password (leave blank to keep current)'}</label>
                  <input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleUserInputChange}
                    required={userModalMode === 'add'}
                    minLength={8}
                    placeholder={userModalMode === 'edit' ? '••••••••' : ''}
                    style={input}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="checkbox" name="isActive" checked={userForm.isActive} onChange={handleUserInputChange} />
                    Account is active
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null); }} disabled={userSaving} style={btn('#6c757d')}>Cancel</button>
                  <button type="submit" disabled={userSaving} style={btn('#007bff')}>{userSaving ? 'Saving...' : 'Save User'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- Add / Edit Department Modal ---------------- */}
        {showDeptModal && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>{deptModalMode === 'add' ? 'Add Department' : `Edit Department: ${editingDept?.departmentName}`}</h3>
              <form onSubmit={handleSaveDept}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Department Name *</label>
                  <input type="text" name="departmentName" value={deptForm.departmentName} onChange={handleDeptInputChange} required style={input} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={label}>Department Head</label>
                  <select name="departmentHeadId" value={deptForm.departmentHeadId} onChange={handleDeptInputChange} style={input}>
                    <option value="">None</option>
                    {employees
                      .filter(emp => deptModalMode === 'add' || emp.departmentId === editingDept?.departmentId || emp.employeeId === Number(deptForm.departmentHeadId))
                      .map(emp => (
                        <option key={emp.employeeId} value={emp.employeeId}>
                          {emp.firstName} {emp.lastName} {emp.position ? `(${emp.position})` : ''}
                        </option>
                      ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => { setShowDeptModal(false); setEditingDept(null); }} disabled={deptSaving} style={btn('#6c757d')}>Cancel</button>
                  <button type="submit" disabled={deptSaving} style={btn('#007bff')}>{deptSaving ? 'Saving...' : 'Save Department'}</button>
                </div>
              </form>
            </div>
          </div>
        )}



        {/* Reject Leave Request Modal */}
        {rejectingLeave && (
          <div style={modalOverlay} onClick={handleCloseRejectModal}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.text }}>Reject Leave Request</h3>
                <button
                  type="button"
                  onClick={handleCloseRejectModal}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: theme.textMuted }}
                >
                  &times;
                </button>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '10px', border: `1px solid ${theme.border}`, marginBottom: '16px', fontSize: '13px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: theme.textMuted }}>Employee: </span>
                  <strong style={{ color: theme.text }}>{rejectingLeave.employee ? `${rejectingLeave.employee.firstName} ${rejectingLeave.employee.lastName}` : `ID #${rejectingLeave.employeeId}`}</strong>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: theme.textMuted }}>Leave Type: </span>
                  <strong style={{ color: theme.text, textTransform: 'capitalize' }}>{rejectingLeave.leaveType}</strong>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: theme.textMuted }}>Duration: </span>
                  <span style={{ color: theme.text }}>{rejectingLeave.startDate} to {rejectingLeave.endDate}</span>
                </div>
                {rejectingLeave.reason && (
                  <div>
                    <span style={{ color: theme.textMuted }}>Employee's Note: </span>
                    <span style={{ color: theme.text, fontStyle: 'italic' }}>"{rejectingLeave.reason}"</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleConfirmReject}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={label}>
                    Message / Reason for Rejection <span style={{ fontSize: '12px', fontWeight: 'normal', color: theme.textMuted }}>(will be sent to employee notification)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter reason or instructions for the employee (e.g. Schedule conflict, insufficient staffing, please reschedule)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{ ...input, resize: 'vertical', fontFamily: 'inherit', minHeight: '80px' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleCloseRejectModal}
                    disabled={rejectSaving}
                    style={btn('#6c757d')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rejectSaving}
                    style={btn('#dc3545')}
                  >
                    {rejectSaving ? 'Rejecting...' : 'Reject Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {loading ? (
          <p>Loading data from MySQL / Spring Boot...</p>
        ) : (
          <div>
            {/* ---------------- Employees Table ---------------- */}
            {activeTab === 'employees' && (
              <>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Search by name, position, or contact..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    style={{ ...input, flex: '1 1 240px', width: 'auto' }}
                  />
                  <select value={empStatusFilter} onChange={(e) => setEmpStatusFilter(e.target.value)} style={{ ...input, width: 'auto' }}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="resigned">Resigned</option>
                    <option value="terminated">Terminated</option>
                  </select>
                  <select value={empDeptFilter} onChange={(e) => setEmpDeptFilter(e.target.value)} style={{ ...input, width: 'auto' }}>
                    <option value="all">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>

                <table style={table}>
                  <thead>
                    <tr style={thead}>
                      <th style={th}>ID</th>
                      <th style={th}>Name</th>
                      <th style={th}>Position</th>
                      <th style={th}>Department</th>
                      <th style={th}>Status</th>
                      <th style={th}>Contact</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr><td colSpan="7" style={emptyRow}>No employees match your search/filters.</td></tr>
                    ) : (
                      pagedEmployees.map((emp) => (
                        <tr key={emp.employeeId} style={row}>
                          <td style={td}>{emp.employeeId}</td>
                          <td style={td}>{emp.firstName} {emp.lastName}</td>
                          <td style={td}>{emp.position || 'N/A'}</td>
                          <td style={td}>{emp.department?.departmentName || 'None'}</td>
                          <td style={td}>
                            <span style={badge(emp.status === 'active' ? '#d4edda' : '#f8d7da', emp.status === 'active' ? '#155724' : '#721c24')}>
                              {emp.status}
                            </span>
                          </td>
                          <td style={td}>{emp.contactNumber || 'N/A'}</td>
                          <td style={td}>
                            <button onClick={() => openEditEmployee(emp)} style={smallBtn('#ffc107')}>Edit</button>
                            <button onClick={() => handleDeleteEmployee(emp)} style={smallBtn('#dc3545')}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <Pagination page={empPage} totalItems={filteredEmployees.length} pageSize={PAGE_SIZE} onPageChange={setEmpPage} />
              </>
            )}

            {/* ---------------- Users Table ---------------- */}
            {activeTab === 'users' && (
              <>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ ...input, flex: '1 1 240px', width: 'auto' }}
                  />
                  <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} style={{ ...input, width: 'auto' }}>
                    <option value="all">All Roles</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <table style={table}>
                  <thead>
                    <tr style={thead}>
                      <th style={th}>User ID</th>
                      <th style={th}>Username</th>
                      <th style={th}>Email</th>
                      <th style={th}>Role</th>
                      <th style={th}>Active</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" style={emptyRow}>No users match your search/filters.</td></tr>
                    ) : (
                      pagedUsers.map((u) => (
                        <tr key={u.userId} style={row}>
                          <td style={td}>{u.userId}</td>
                          <td style={td}>{u.username}</td>
                          <td style={td}>{u.email}</td>
                          <td style={td}><strong>{u.role}</strong></td>
                          <td style={td}>
                            <span style={badge(u.isActive ? '#d4edda' : '#f8d7da', u.isActive ? '#155724' : '#721c24')}>
                              {u.isActive ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td style={td}>
                            <button onClick={() => openEditUser(u)} style={smallBtn('#ffc107')}>Edit</button>
                            <button onClick={() => handleDeleteUser(u)} style={smallBtn('#dc3545')}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <Pagination page={userPage} totalItems={filteredUsers.length} pageSize={PAGE_SIZE} onPageChange={setUserPage} />
              </>
            )}

            {/* ---------------- Departments Table ---------------- */}
            {activeTab === 'departments' && (
              <table style={table}>
                <thead>
                  <tr style={thead}>
                    <th style={th}>ID</th>
                    <th style={th}>Department Name</th>
                    <th style={th}>Department Head</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr><td colSpan="4" style={emptyRow}>No departments found.</td></tr>
                  ) : (
                    departments.map((d) => (
                      <tr key={d.departmentId} style={row}>
                        <td style={td}>{d.departmentId}</td>
                        <td style={td}>{d.departmentName}</td>
                        <td style={td}>{d.departmentHead ? `${d.departmentHead.firstName} ${d.departmentHead.lastName}${d.departmentHead.position ? ` (${d.departmentHead.position})` : ''}` : 'None'}</td>
                        <td style={td}>
                          <button onClick={() => openEditDept(d)} style={smallBtn('#ffc107')}>Edit</button>
                          <button onClick={() => handleDeleteDept(d)} style={smallBtn('#dc3545')}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}



            {/* ---------------- Leave Requests Table ---------------- */}
            {activeTab === 'leaveRequests' && (
              <table style={table}>
                <thead>
                  <tr style={thead}>
                    <th style={th}>ID</th>
                    <th style={th}>Employee</th>
                    <th style={th}>Type</th>
                    <th style={th}>Dates</th>
                    <th style={th}>Reason</th>
                    <th style={th}>Status</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr><td colSpan="7" style={emptyRow}>No leave requests found.</td></tr>
                  ) : (
                    leaveRequests.map((req) => (
                      <tr key={req.leaveId || req._id} style={row}>
                        <td style={td}>{req.leaveId || 'N/A'}</td>
                        <td style={td}>{req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'N/A'}</td>
                        <td style={td}>{req.leaveType}</td>
                        <td style={td}>{req.startDate} to {req.endDate}</td>
                        <td style={td}>{req.reason || 'N/A'}</td>
                        <td style={td}>
                          <span style={badge(
                            req.status === 'approved' ? (isDarkMode ? '#064e3b' : '#d4edda') : req.status === 'rejected' ? (isDarkMode ? '#7f1d1d' : '#f8d7da') : (isDarkMode ? '#78350f' : '#fff3cd'),
                            req.status === 'approved' ? (isDarkMode ? '#6ee7b7' : '#155724') : req.status === 'rejected' ? (isDarkMode ? '#fca5a5' : '#721c24') : (isDarkMode ? '#fbbf24' : '#856404')
                          )}>
                            {req.status}
                          </span>
                        </td>
                        <td style={td}>
                          {req.status === 'pending' ? (
                            (user.role === 'admin' || user.role === 'hr' || user.role === 'manager') ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleApprove(req.leaveId || req._id)} style={smallBtn('#28a745')}>Approve</button>
                                <button onClick={() => handleOpenRejectModal(req)} style={smallBtn('#dc3545')}>Reject</button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#6c757d' }}>Awaiting approval</span>
                            )
                          ) : (
                            <button onClick={() => handleDeleteLeaveRequest(req)} style={smallBtn('#dc3545')}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* ---------------- Leave Balances ---------------- */}
            {activeTab === 'leaveBalances' && <LeaveBalancesTab />}

            {/* ---------------- Performance Reviews ---------------- */}
            {activeTab === 'performanceReviews' && <PerformanceReviewsTab />}

            {/* ---------------- Skills & Gap Analysis ---------------- */}
            {activeTab === 'skills' && <SkillsTab />}

            {/* ---------------- Attrition Risk Dashboard ---------------- */}
            {activeTab === 'attrition' && <AttritionTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}

            {/* ---------------- Attendance Records ---------------- */}
            {activeTab === 'attendance' && <AttendanceTab />}

            {/* ---------------- Dashboard Charts ---------------- */}
            {activeTab === 'dashboard' && (
              <DashboardCharts employees={employees} departments={departments} leaveRequests={leaveRequests} theme={theme} isDarkMode={isDarkMode} />
            )}

            {/* ---------------- Employee Directory ---------------- */}
            {activeTab === 'directory' && (
              <EmployeeDirectory employees={employees} theme={theme} isDarkMode={isDarkMode} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
