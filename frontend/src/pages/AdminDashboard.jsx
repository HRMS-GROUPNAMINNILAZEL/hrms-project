import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  deleteLeaveRequest
} from '../services/api';

// --- Shared inline style helpers (kept lightweight, consistent with the rest of the app) ---
const table = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' };
const thead = { backgroundColor: '#e9ecef', textAlign: 'left', borderBottom: '2px solid #dee2e6' };
const th = { padding: '12px' };
const td = { padding: '12px' };
const row = { borderBottom: '1px solid #dee2e6' };
const emptyRow = { padding: '20px', textAlign: 'center', color: '#6c757d' };
const label = { display: 'block', fontSize: '13px', marginBottom: '4px' };
const input = { width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalBox = { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' };
const btn = (bg) => ({ padding: '8px 16px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' });
const smallBtn = (bg) => ({ padding: '4px 8px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' });
const badge = (bg, color) => ({ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: bg, color });

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
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
      } else if (activeTab === 'payroll') {
        const [payData, empData] = await Promise.all([getPayroll(), getEmployees()]);
        setPayroll(payData);
        setEmployees(empData);
      } else if (activeTab === 'leaveRequests') {
        const leaveData = await getLeaveRequests();
        setLeaveRequests(leaveData);
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
        department: empEditForm.departmentId ? { departmentId: Number(empEditForm.departmentId) } : null,
        position: empEditForm.position,
        // preserve the existing manager link - the edit form doesn't expose it,
        // and the backend overwrites manager unconditionally on update.
        manager: editingEmployee.manager ? { employeeId: editingEmployee.manager.employeeId } : null,
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
      setError(err.response?.data?.message || err.message || 'Failed to delete employee (they may have linked attendance, leave, or payroll records)');
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
  // Payroll: Add / Edit / Delete
  // =========================================================================
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [payrollModalMode, setPayrollModalMode] = useState('add');
  const [paySaving, setPaySaving] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const emptyPayrollForm = { employeeId: '', payPeriodStart: '', payPeriodEnd: '', basicSalary: '', deductions: '0', bonuses: '0' };
  const [payrollForm, setPayrollForm] = useState(emptyPayrollForm);

  const openAddPayroll = () => {
    setPayrollModalMode('add');
    setEditingPayroll(null);
    setPayrollForm(emptyPayrollForm);
    setError('');
    setShowPayrollModal(true);
  };

  const openEditPayroll = (p) => {
    setPayrollModalMode('edit');
    setEditingPayroll(p);
    setPayrollForm({
      employeeId: p.employee?.employeeId || '',
      payPeriodStart: p.payPeriodStart || '',
      payPeriodEnd: p.payPeriodEnd || '',
      basicSalary: p.basicSalary ?? '',
      deductions: p.deductions ?? '0',
      bonuses: p.bonuses ?? '0'
    });
    setError('');
    setShowPayrollModal(true);
  };

  const handlePayrollInputChange = (e) => setPayrollForm({ ...payrollForm, [e.target.name]: e.target.value });

  const handleSavePayroll = async (e) => {
    e.preventDefault();
    setError('');
    if (!payrollForm.employeeId) {
      setError('Please select an employee.');
      return;
    }
    setPaySaving(true);
    try {
      const payload = {
        employee: { employeeId: Number(payrollForm.employeeId) },
        payPeriodStart: payrollForm.payPeriodStart,
        payPeriodEnd: payrollForm.payPeriodEnd,
        basicSalary: Number(payrollForm.basicSalary),
        deductions: Number(payrollForm.deductions || 0),
        bonuses: Number(payrollForm.bonuses || 0)
        // netPay is always derived server-side from the fields above
      };
      if (payrollModalMode === 'add') {
        await createPayroll(payload);
      } else {
        await updatePayroll(editingPayroll.payrollId, payload);
      }
      setShowPayrollModal(false);
      setPayrollForm(emptyPayrollForm);
      setEditingPayroll(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save payroll record');
    } finally {
      setPaySaving(false);
    }
  };

  const handleDeletePayroll = async (p) => {
    if (!window.confirm(`Delete this payroll record for ${p.employee?.firstName} ${p.employee?.lastName}?`)) return;
    setError('');
    try {
      await deletePayroll(p.payrollId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete payroll record');
    }
  };

  // =========================================================================
  // Leave Requests: Approve / Reject / Delete
  // =========================================================================
  const handleApprove = async (id) => {
    try {
      await approveLeaveRequest(id, user.userId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to approve leave request');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeaveRequest(id, user.userId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reject leave request');
    }
  };

  const handleDeleteLeaveRequest = async (req) => {
    if (!window.confirm('Delete this leave request record?')) return;
    setError('');
    try {
      await deleteLeaveRequest(req.leaveId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete leave request');
    }
  };

  const sidebarItem = (key, icon, text) => (
    <li
      onClick={() => setActiveTab(key)}
      style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: activeTab === key ? '#495057' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
    >
      {icon} {text}
    </li>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#343a40', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '30px', textAlign: 'center', color: '#17a2b8' }}>HRMS Admin</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sidebarItem('employees', '👥', 'Employees')}
            {sidebarItem('users', '🔐', 'System Users')}
            {sidebarItem('departments', '🏢', 'Departments')}
            {sidebarItem('payroll', '💰', 'Payroll')}
            {sidebarItem('leaveRequests', '📝', 'Leave Requests')}
          </ul>
        </div>
        <div>
          <p style={{ fontSize: '13px', color: '#adb5bd', marginBottom: '10px' }}>Logged in as: <strong>{user.username}</strong></p>
          <button onClick={logout} style={{ width: '100%', padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>
            {activeTab === 'employees' && 'Employee Directory'}
            {activeTab === 'users' && 'System Users'}
            {activeTab === 'departments' && 'Departments'}
            {activeTab === 'payroll' && 'Payroll'}
            {activeTab === 'leaveRequests' && 'Leave Requests Management'}
          </h1>
          <div>
            {activeTab === 'employees' && (
              <button onClick={() => setShowModal(true)} style={{ ...btn('#28a745'), marginRight: '10px', fontWeight: 'bold' }}>+ Add Employee</button>
            )}
            {activeTab === 'users' && (
              <button onClick={openAddUser} style={{ ...btn('#28a745'), marginRight: '10px', fontWeight: 'bold' }}>+ Add User</button>
            )}
            {activeTab === 'departments' && (
              <button onClick={openAddDept} style={{ ...btn('#28a745'), marginRight: '10px', fontWeight: 'bold' }}>+ Add Department</button>
            )}
            {activeTab === 'payroll' && (
              <button onClick={openAddPayroll} style={{ ...btn('#28a745'), marginRight: '10px', fontWeight: 'bold' }}>+ Add Payroll Record</button>
            )}
            <button onClick={loadData} style={btn('#6c757d')}>Refresh</button>
          </div>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}

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
                      <option value="admin">Admin</option>
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
                    {employees.map(emp => (
                      <option key={emp.employeeId} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>
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

        {/* ---------------- Add / Edit Payroll Modal ---------------- */}
        {showPayrollModal && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>{payrollModalMode === 'add' ? 'Add Payroll Record' : 'Edit Payroll Record'}</h3>
              <form onSubmit={handleSavePayroll}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Employee *</label>
                  <select name="employeeId" value={payrollForm.employeeId} onChange={handlePayrollInputChange} required style={input}>
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.employeeId} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Pay Period Start *</label>
                    <input type="date" name="payPeriodStart" value={payrollForm.payPeriodStart} onChange={handlePayrollInputChange} required style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Pay Period End *</label>
                    <input type="date" name="payPeriodEnd" value={payrollForm.payPeriodEnd} onChange={handlePayrollInputChange} required style={input} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>Basic Salary (₱) *</label>
                  <input type="number" step="0.01" min="0" name="basicSalary" value={payrollForm.basicSalary} onChange={handlePayrollInputChange} required style={input} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Deductions (₱)</label>
                    <input type="number" step="0.01" min="0" name="deductions" value={payrollForm.deductions} onChange={handlePayrollInputChange} style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={label}>Bonuses (₱)</label>
                    <input type="number" step="0.01" min="0" name="bonuses" value={payrollForm.bonuses} onChange={handlePayrollInputChange} style={input} />
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '-10px', marginBottom: '20px' }}>Net pay is calculated automatically: basic salary − deductions + bonuses.</p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => { setShowPayrollModal(false); setEditingPayroll(null); }} disabled={paySaving} style={btn('#6c757d')}>Cancel</button>
                  <button type="submit" disabled={paySaving} style={btn('#007bff')}>{paySaving ? 'Saving...' : 'Save Payroll Record'}</button>
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
                  {employees.length === 0 ? (
                    <tr><td colSpan="7" style={emptyRow}>No employees found.</td></tr>
                  ) : (
                    employees.map((emp) => (
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
            )}

            {/* ---------------- Users Table ---------------- */}
            {activeTab === 'users' && (
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
                  {users.length === 0 ? (
                    <tr><td colSpan="6" style={emptyRow}>No users found.</td></tr>
                  ) : (
                    users.map((u) => (
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
                        <td style={td}>{d.departmentHead ? `${d.departmentHead.firstName} ${d.departmentHead.lastName}` : 'None'}</td>
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

            {/* ---------------- Payroll Table ---------------- */}
            {activeTab === 'payroll' && (
              <table style={table}>
                <thead>
                  <tr style={thead}>
                    <th style={th}>ID</th>
                    <th style={th}>Employee</th>
                    <th style={th}>Pay Period</th>
                    <th style={th}>Basic Salary</th>
                    <th style={th}>Deductions</th>
                    <th style={th}>Bonuses</th>
                    <th style={th}>Net Pay</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.length === 0 ? (
                    <tr><td colSpan="8" style={emptyRow}>No payroll records found.</td></tr>
                  ) : (
                    payroll.map((p) => (
                      <tr key={p.payrollId} style={row}>
                        <td style={td}>{p.payrollId}</td>
                        <td style={td}>{p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : 'N/A'}</td>
                        <td style={td}>{p.payPeriodStart} to {p.payPeriodEnd}</td>
                        <td style={td}>₱{Number(p.basicSalary ?? 0).toFixed(2)}</td>
                        <td style={td}>₱{Number(p.deductions ?? 0).toFixed(2)}</td>
                        <td style={td}>₱{Number(p.bonuses ?? 0).toFixed(2)}</td>
                        <td style={td}><strong>₱{Number(p.netPay ?? 0).toFixed(2)}</strong></td>
                        <td style={td}>
                          <button onClick={() => openEditPayroll(p)} style={smallBtn('#ffc107')}>Edit</button>
                          <button onClick={() => handleDeletePayroll(p)} style={smallBtn('#dc3545')}>Delete</button>
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
                      <tr key={req.leaveId} style={row}>
                        <td style={td}>{req.leaveId}</td>
                        <td style={td}>{req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'N/A'}</td>
                        <td style={td}>{req.leaveType}</td>
                        <td style={td}>{req.startDate} to {req.endDate}</td>
                        <td style={td}>{req.reason || 'N/A'}</td>
                        <td style={td}>
                          <span style={badge(
                            req.status === 'approved' ? '#d4edda' : req.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                            req.status === 'approved' ? '#155724' : req.status === 'rejected' ? '#721c24' : '#856404'
                          )}>
                            {req.status}
                          </span>
                        </td>
                        <td style={td}>
                          {req.status === 'pending' ? (
                            user.role === 'admin' ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleApprove(req.leaveId)} style={smallBtn('#28a745')}>Approve</button>
                                <button onClick={() => handleReject(req.leaveId)} style={smallBtn('#dc3545')}>Reject</button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#6c757d' }}>Awaiting admin</span>
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
          </div>
        )}
      </div>
    </div>
  );
}