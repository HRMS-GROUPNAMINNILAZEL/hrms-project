import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getEmployees, 
  updateEmployee,
  getLeaveRequests, 
  createLeaveRequest, 
  deleteLeaveRequest,
  getAttendance, 
  createAttendance,
  updateAttendance,
  getPayroll 
} from '../services/api';

const todayStr = () => new Date().toISOString().split('T')[0];
const nowTimeStr = () => new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Form state for new leave request
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Clock in/out state
  const [clockLoading, setClockLoading] = useState(false);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ contactNumber: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch all employees to find the one matching the logged-in user's userId
      const employees = await getEmployees();
      const currentEmp = employees.find(emp => emp.user && emp.user.userId === user.userId);
      
      if (!currentEmp) {
        setError('No employee profile is linked to this user account yet. Contact Admin.');
        setLoading(false);
        return;
      }

      setEmployeeProfile(currentEmp);
      setProfileForm({
        contactNumber: currentEmp.contactNumber || '',
        address: currentEmp.address || ''
      });

      // 2. Fetch specific records using this employee's employeeId
      const empId = currentEmp.employeeId;
      const leaves = await getLeaveRequests({ employeeId: empId });
      setLeaveRequests(leaves);

      const att = await getAttendance({ employeeId: empId });
      setAttendance(att);

      const pay = await getPayroll({ employeeId: empId });
      setPayroll(pay);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const refreshAttendance = async () => {
    if (!employeeProfile) return;
    const att = await getAttendance({ employeeId: employeeProfile.employeeId });
    setAttendance(att);
  };

  const refreshLeaveRequests = async () => {
    if (!employeeProfile) return;
    const leaves = await getLeaveRequests({ employeeId: employeeProfile.employeeId });
    setLeaveRequests(leaves);
  };

  const handleLeaveInputChange = (e) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setActionError('');

    if (!employeeProfile) return;

    const payload = {
      employee: { employeeId: employeeProfile.employeeId },
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason
    };

    try {
      await createLeaveRequest(payload);
      setShowLeaveModal(false);
      setLeaveForm({ leaveType: 'vacation', startDate: '', endDate: '', reason: '' });
      await refreshLeaveRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to submit leave request');
    }
  };

  const handleCancelLeave = async (leaveId) => {
    setActionError('');
    try {
      await deleteLeaveRequest(leaveId);
      await refreshLeaveRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to cancel leave request');
    }
  };

  // --- Clock In / Clock Out ---
  const todaysAttendance = attendance.find(a => a.date === todayStr());

  const handleClockIn = async () => {
    if (!employeeProfile) return;
    setActionError('');
    setClockLoading(true);
    try {
      await createAttendance({
        employee: { employeeId: employeeProfile.employeeId },
        date: todayStr(),
        timeIn: nowTimeStr(),
        status: 'present'
      });
      await refreshAttendance();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to clock in');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!todaysAttendance) return;
    setActionError('');
    setClockLoading(true);
    try {
      await updateAttendance(todaysAttendance.attendanceId, {
        employee: { employeeId: employeeProfile.employeeId },
        date: todaysAttendance.date,
        timeIn: todaysAttendance.timeIn,
        timeOut: nowTimeStr(),
        status: todaysAttendance.status
      });
      await refreshAttendance();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to clock out');
    } finally {
      setClockLoading(false);
    }
  };

  // --- Profile edit ---
  const handleProfileInputChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!employeeProfile) return;
    setActionError('');
    setSavingProfile(true);

    const payload = {
      user: { userId: employeeProfile.user.userId },
      firstName: employeeProfile.firstName,
      lastName: employeeProfile.lastName,
      department: employeeProfile.department ? { departmentId: employeeProfile.department.departmentId } : null,
      manager: employeeProfile.manager ? { employeeId: employeeProfile.manager.employeeId } : null,
      position: employeeProfile.position,
      hireDate: employeeProfile.hireDate,
      status: employeeProfile.status,
      contactNumber: profileForm.contactNumber,
      address: profileForm.address
    };

    try {
      const updated = await updateEmployee(employeeProfile.employeeId, payload);
      setEmployeeProfile(updated);
      setEditingProfile(false);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>Loading your dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#0f172a' }}>
      {/* Sidebar matching screenshot layout precisely */}
      <div style={{ width: '260px', backgroundColor: '#182232', color: '#ffffff', padding: '32px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#ffffff', letterSpacing: '0.5px' }}>Employee Portal</h2>
          {employeeProfile && (
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {employeeProfile.position}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>
                {employeeProfile.firstName} {employeeProfile.lastName}
              </div>
            </div>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li 
              onClick={() => setActiveTab('profile')} 
              style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: activeTab === 'profile' ? '#24324a' : 'transparent', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', color: activeTab === 'profile' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'profile' ? '500' : 'normal', transition: 'background-color 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { if (activeTab !== 'profile') { e.currentTarget.style.backgroundColor = '#1f2d42'; e.currentTarget.style.color = '#ffffff'; }}}
              onMouseLeave={(e) => { if (activeTab !== 'profile') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
            >
              My Profile
            </li>
            <li 
              onClick={() => setActiveTab('leaves')} 
              style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: activeTab === 'leaves' ? '#24324a' : 'transparent', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', color: activeTab === 'leaves' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'leaves' ? '500' : 'normal', transition: 'background-color 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { if (activeTab !== 'leaves') { e.currentTarget.style.backgroundColor = '#1f2d42'; e.currentTarget.style.color = '#ffffff'; }}}
              onMouseLeave={(e) => { if (activeTab !== 'leaves') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
            >
              My Leave Requests
            </li>
            <li 
              onClick={() => setActiveTab('attendance')} 
              style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: activeTab === 'attendance' ? '#24324a' : 'transparent', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', color: activeTab === 'attendance' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'attendance' ? '500' : 'normal', transition: 'background-color 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { if (activeTab !== 'attendance') { e.currentTarget.style.backgroundColor = '#1f2d42'; e.currentTarget.style.color = '#ffffff'; }}}
              onMouseLeave={(e) => { if (activeTab !== 'attendance') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
            >
              My Attendance
            </li>
            <li 
              onClick={() => setActiveTab('payroll')} 
              style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: activeTab === 'payroll' ? '#24324a' : 'transparent', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', color: activeTab === 'payroll' ? '#ffffff' : '#94a3b8', fontWeight: activeTab === 'payroll' ? '500' : 'normal', transition: 'background-color 0.2s, color 0.2s' }}
              onMouseEnter={(e) => { if (activeTab !== 'payroll') { e.currentTarget.style.backgroundColor = '#1f2d42'; e.currentTarget.style.color = '#ffffff'; }}}
              onMouseLeave={(e) => { if (activeTab !== 'payroll') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
            >
              My Payroll History
            </li>
          </ul>
        </div>
        <div style={{ backgroundColor: '#101722', padding: '16px', borderRadius: '8px', border: '1px solid #24324a' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', textAlign: 'center' }}>Logged in as</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px', textAlign: 'center' }}>{user.username}</div>
          <button 
            onClick={logout}
            style={{ width: '100%', padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '32px 40px', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'leaves' && 'My Leave Requests'}
            {activeTab === 'attendance' && 'My Attendance Logs'}
            {activeTab === 'payroll' && 'My Payroll History'}
          </h1>
          <div>
            {activeTab === 'leaves' && (
              <button 
                onClick={() => setShowLeaveModal(true)} 
                style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
              >
                + Request Leave
              </button>
            )}
          </div>
        </div>

        {error && <div style={{ color: '#b91c1c', marginBottom: '20px', backgroundColor: '#fee2e2', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', border: '1px solid #fecaca' }}>{error}</div>}
        {actionError && <div style={{ color: '#b91c1c', marginBottom: '20px', backgroundColor: '#fee2e2', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', border: '1px solid #fecaca' }}>{actionError}</div>}

        {/* Leave Request Modal */}
        {showLeaveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginTop: 0, marginBottom: '16px' }}>Submit Leave Request</h3>
              <form onSubmit={handleSubmitLeave}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Leave Type</label>
                  <select 
                    name="leaveType" 
                    value={leaveForm.leaveType} 
                    onChange={handleLeaveInputChange} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', backgroundColor: '#ffffff', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px', boxSizing: 'border-box' }}
                  >
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick</option>
                    <option value="emergency">Emergency</option>
                    <option value="maternity">Maternity</option>
                    <option value="paternity">Paternity</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Start Date</label>
                  <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', backgroundColor: '#ffffff', colorScheme: 'light' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>End Date</label>
                  <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', backgroundColor: '#ffffff', colorScheme: 'light' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Reason</label>
                  <textarea name="reason" value={leaveForm.reason} onChange={handleLeaveInputChange} rows="3" placeholder="Brief explanation..." style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', backgroundColor: '#ffffff', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowLeaveModal(false)} 
                    style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'profile' && employeeProfile && (
          <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '24px', maxWidth: '600px', border: '1px solid #e2e8f0' }}>
            {!editingProfile ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '16px', fontSize: '14px' }}>
                  <div style={{ color: '#64748b', fontWeight: '500' }}>Full Name</div>
                  <div style={{ color: '#0f172a', fontWeight: '500' }}>{employeeProfile.firstName} {employeeProfile.lastName}</div>

                  <div style={{ color: '#64748b', fontWeight: '500' }}>Position</div>
                  <div style={{ color: '#0f172a' }}>{employeeProfile.position || 'N/A'}</div>

                  <div style={{ color: '#64748b', fontWeight: '500' }}>Department</div>
                  <div style={{ color: '#0f172a' }}>{employeeProfile.department?.departmentName || 'None'}</div>

                  <div style={{ color: '#64748b', fontWeight: '500' }}>Hire Date</div>
                  <div style={{ color: '#0f172a' }}>{employeeProfile.hireDate}</div>

                  <div style={{ color: '#64748b', fontWeight: '500' }}>Status</div>
                  <div>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '500', 
                      backgroundColor: employeeProfile.status === 'active' ? '#dcfce7' : '#f1f5f9', 
                      color: employeeProfile.status === 'active' ? '#166534' : '#475569',
                      textTransform: 'capitalize' 
                    }}>
                      {employeeProfile.status}
                    </span>
                  </div>

                  <div style={{ color: '#64748b', fontWeight: '500' }}>Contact Number</div>
                  <div style={{ color: '#0f172a' }}>{employeeProfile.contactNumber || 'N/A'}</div>

                  <div style={{ color: '#64748b', fontWeight: '500' }}>Address</div>
                  <div style={{ color: '#0f172a' }}>{employeeProfile.address || 'N/A'}</div>

                  <div style={{ color: '#64748b', fontWeight: '500' }}>Email</div>
                  <div style={{ color: '#0f172a' }}>{employeeProfile.user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    setProfileForm({
                      contactNumber: employeeProfile.contactNumber || '',
                      address: employeeProfile.address || ''
                    });
                    setEditingProfile(true);
                  }}
                  style={{ marginTop: '24px', padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                >
                  Edit Contact Info
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveProfile}>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '20px' }}>
                  Only your contact number and address can be edited here. Other details are managed by HR.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Contact Number</label>
                  <input type="text" name="contactNumber" value={profileForm.contactNumber} onChange={handleProfileInputChange} placeholder="09171234567" style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', backgroundColor: '#ffffff' }} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Address</label>
                  <input type="text" name="address" value={profileForm.address} onChange={handleProfileInputChange} placeholder="City, Province" style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', backgroundColor: '#ffffff' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    disabled={savingProfile} 
                    onClick={() => setEditingProfile(false)} 
                    style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: savingProfile ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => { if (!savingProfile) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                    onMouseLeave={(e) => { if (!savingProfile) e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingProfile} 
                    style={{ padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: savingProfile ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => { if (!savingProfile) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                    onMouseLeave={(e) => { if (!savingProfile) e.currentTarget.style.backgroundColor = '#0f172a'; }}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'leaves' && (
          <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px' }}>Type</th>
                  <th style={{ padding: '16px' }}>Start Date</th>
                  <th style={{ padding: '16px' }}>End Date</th>
                  <th style={{ padding: '16px' }}>Reason</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No leave requests found.</td></tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.leaveId} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                      <td style={{ padding: '16px', textTransform: 'capitalize', fontWeight: '500' }}>{req.leaveType}</td>
                      <td style={{ padding: '16px', color: '#334155' }}>{req.startDate}</td>
                      <td style={{ padding: '16px', color: '#334155' }}>{req.endDate}</td>
                      <td style={{ padding: '16px', color: '#64748b' }}>{req.reason || 'N/A'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px', 
                          fontWeight: '500',
                          backgroundColor: req.status === 'approved' ? '#dcfce7' : req.status === 'rejected' ? '#fee2e2' : '#fef9c3', 
                          color: req.status === 'approved' ? '#166534' : req.status === 'rejected' ? '#991b1b' : '#854d0e',
                          textTransform: 'capitalize'
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {req.status === 'pending' ? (
                          <button
                            onClick={() => handleCancelLeave(req.leaveId)}
                            style={{ padding: '4px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            {/* Today's clock in/out card */}
            <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Today &middot; {todayStr()}</div>
                {todaysAttendance ? (
                  <div style={{ fontSize: '14px', color: '#0f172a' }}>
                    Clocked in at <strong style={{ fontWeight: '600' }}>{todaysAttendance.timeIn}</strong>
                    {todaysAttendance.timeOut ? (
                      <> &middot; Clocked out at <strong style={{ fontWeight: '600' }}>{todaysAttendance.timeOut}</strong></>
                    ) : (
                      <span style={{ color: '#d97706', fontWeight: '500' }}> &middot; Still clocked in</span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#64748b' }}>You haven't clocked in yet today.</div>
                )}
              </div>
              <div>
                {!todaysAttendance && (
                  <button 
                    onClick={handleClockIn} 
                    disabled={clockLoading} 
                    style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: clockLoading ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => { if (!clockLoading) e.currentTarget.style.backgroundColor = '#15803d'; }}
                    onMouseLeave={(e) => { if (!clockLoading) e.currentTarget.style.backgroundColor = '#16a34a'; }}
                  >
                    {clockLoading ? 'Please wait...' : 'Clock In'}
                  </button>
                )}
                {todaysAttendance && !todaysAttendance.timeOut && (
                  <button 
                    onClick={handleClockOut} 
                    disabled={clockLoading} 
                    style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: clockLoading ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => { if (!clockLoading) e.currentTarget.style.backgroundColor = '#b91c1c'; }}
                    onMouseLeave={(e) => { if (!clockLoading) e.currentTarget.style.backgroundColor = '#dc2626'; }}
                  >
                    {clockLoading ? 'Please wait...' : 'Clock Out'}
                  </button>
                )}
                {todaysAttendance && todaysAttendance.timeOut && (
                  <span style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>✓ Done for today</span>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px' }}>Date</th>
                    <th style={{ padding: '16px' }}>Time In</th>
                    <th style={{ padding: '16px' }}>Time Out</th>
                    <th style={{ padding: '16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No attendance records found.</td></tr>
                  ) : (
                    [...attendance]
                      .sort((a, b) => (a.date < b.date ? 1 : -1))
                      .map((att) => (
                        <tr key={att.attendanceId} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                          <td style={{ padding: '16px', fontWeight: '500' }}>{att.date}</td>
                          <td style={{ padding: '16px', color: '#334155' }}>{att.timeIn || 'N/A'}</td>
                          <td style={{ padding: '16px', color: '#334155' }}>{att.timeOut || 'N/A'}</td>
                          <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              fontSize: '12px', 
                              fontWeight: '500', 
                              backgroundColor: att.status === 'present' ? '#dcfce7' : '#f1f5f9', 
                              color: att.status === 'present' ? '#166534' : '#475569' 
                            }}>
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px' }}>Pay Period</th>
                  <th style={{ padding: '16px' }}>Basic Salary</th>
                  <th style={{ padding: '16px' }}>Deductions</th>
                  <th style={{ padding: '16px' }}>Bonuses</th>
                  <th style={{ padding: '16px' }}>Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {payroll.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No payroll history found.</td></tr>
                ) : (
                  payroll.map((pay) => (
                    <tr key={pay.payrollId} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{pay.payPeriodStart} to {pay.payPeriodEnd}</td>
                      <td style={{ padding: '16px', color: '#334155' }}>₱{pay.basicSalary?.toFixed(2)}</td>
                      <td style={{ padding: '16px', color: '#334155' }}>₱{pay.deductions?.toFixed(2)}</td>
                      <td style={{ padding: '16px', color: '#334155' }}>₱{pay.bonuses?.toFixed(2)}</td>
                      <td style={{ padding: '16px', color: '#0f172a' }}><strong style={{ fontWeight: '600' }}>₱{pay.netPay?.toFixed(2)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}