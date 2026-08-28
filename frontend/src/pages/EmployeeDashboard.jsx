import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
import MyLeaveBalances from './employee/MyLeaveBalances';
import MyPerformanceReviews from './employee/MyPerformanceReviews';
import MySkills from './employee/MySkills';

const todayStr = () => new Date().toISOString().split('T')[0];
const nowTimeStr = () => new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const theadStyle = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const errorBoxStyle = { color: isDarkMode ? '#fca5a5' : '#b91c1c', marginBottom: '20px', backgroundColor: isDarkMode ? '#450a0a' : '#fee2e2', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', border: `1px solid ${isDarkMode ? '#991b1b' : '#fecaca'}` };
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

    // The backend PUT overwrites every field on the employee, so the full
    // current profile has to be sent back along with the two editable fields.
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
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading your dashboard...</div>;
  }

  const EmployeeSidebarItem = ({ itemKey, icon, text }) => {
    const [hovered, setHovered] = React.useState(false);
    const isActive = activeTab === itemKey;
    return (
      <li
        onClick={() => setActiveTab(itemKey)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: isActive ? '#24324a' : (hovered ? '#1f2d42' : 'transparent'), borderRadius: '6px', marginBottom: '8px', fontSize: '14px', color: isActive ? '#ffffff' : '#94a3b8', fontWeight: isActive ? '500' : 'normal', transition: 'background-color 0.2s, color 0.2s' }}
      >
        {icon} {text}
      </li>
    );
  };

  return (
    <div className="dashboard-shell" style={{ backgroundColor: theme.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: theme.text }}>
      {/* Sidebar matching screenshot layout precisely */}
      <div className="dashboard-sidebar" style={{ backgroundColor: theme.sidebarBg, color: '#ffffff', padding: '32px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
            <EmployeeSidebarItem itemKey="profile" icon="🙍" text="My Profile" />
            <EmployeeSidebarItem itemKey="leaves" icon="📝" text="My Leave Requests" />
            <EmployeeSidebarItem itemKey="attendance" icon="🕒" text="My Attendance" />
            <EmployeeSidebarItem itemKey="payroll" icon="💰" text="My Payroll History" />
            <EmployeeSidebarItem itemKey="myPerformance" icon="⭐" text="My Performance" />
            <EmployeeSidebarItem itemKey="mySkills" icon="🧩" text="My Skills" />
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
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: theme.text, margin: 0 }}>
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'leaves' && 'My Leave Requests'}
            {activeTab === 'attendance' && 'My Attendance Logs'}
            {activeTab === 'payroll' && 'My Payroll History'}
            {activeTab === 'myPerformance' && 'My Performance Reviews'}
            {activeTab === 'mySkills' && 'My Skills'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'leaves' && (
              <button 
                onClick={() => setShowLeaveModal(true)} 
                style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: theme.primary, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              >
                + Request Leave
              </button>
            )}
            <button
              onClick={toggleTheme}
              style={{ padding: '8px 14px', backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              {isDarkMode ? '☀ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}
        {actionError && <div style={errorBoxStyle}>{actionError}</div>}

        {/* Leave Request Modal */}
        {showLeaveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: theme.cardBg, color: theme.text, padding: '30px', borderRadius: '8px', width: '400px', border: `1px solid ${theme.border}` }}>
              <h3>Submit Leave Request</h3>
              <form onSubmit={handleSubmitLeave}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Leave Type</label>
                  <select name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text }}>
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick</option>
                    <option value="emergency">Emergency</option>
                    <option value="maternity">Maternity</option>
                    <option value="paternity">Paternity</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Start Date</label>
                  <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>End Date</label>
                  <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Reason</label>
                  <textarea name="reason" value={leaveForm.reason} onChange={handleLeaveInputChange} rows="3" placeholder="Brief explanation..." style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setShowLeaveModal(false)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'leaves' && employeeProfile && (
          <MyLeaveBalances employeeId={employeeProfile.employeeId} />
        )}

        {activeTab === 'myPerformance' && employeeProfile && (
          <MyPerformanceReviews employeeId={employeeProfile.employeeId} />
        )}

        {activeTab === 'mySkills' && employeeProfile && (
          <MySkills employeeId={employeeProfile.employeeId} />
        )}

        {activeTab === 'profile' && employeeProfile && (
          <div style={{ backgroundColor: theme.cardBg, color: theme.text, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', padding: '24px', maxWidth: '600px', border: `1px solid ${theme.border}` }}>
            {!editingProfile ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '14px' }}>
                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Full Name</div>
                  <div>{employeeProfile.firstName} {employeeProfile.lastName}</div>

                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Position</div>
                  <div>{employeeProfile.position || 'N/A'}</div>

                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Department</div>
                  <div>{employeeProfile.department?.departmentName || 'None'}</div>

                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Hire Date</div>
                  <div>{employeeProfile.hireDate}</div>

                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Status</div>
                  <div style={{ textTransform: 'capitalize' }}>{employeeProfile.status}</div>

                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Contact Number</div>
                  <div>{employeeProfile.contactNumber || 'N/A'}</div>

                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Address</div>
                  <div>{employeeProfile.address || 'N/A'}</div>

                  <div style={{ color: '#6c757d', fontSize: '13px' }}>Email</div>
                  <div>{employeeProfile.user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    setProfileForm({
                      contactNumber: employeeProfile.contactNumber || '',
                      address: employeeProfile.address || ''
                    });
                    setEditingProfile(true);
                  }}
                  style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Edit Contact Info
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveProfile}>
                <p style={{ fontSize: '12px', color: '#6c757d', marginTop: 0 }}>
                  Only your contact number and address can be edited here. Other details are managed by HR.
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Contact Number</label>
                  <input type="text" name="contactNumber" value={profileForm.contactNumber} onChange={handleProfileInputChange} placeholder="09171234567" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Address</label>
                  <input type="text" name="address" value={profileForm.address} onChange={handleProfileInputChange} placeholder="City, Province" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" disabled={savingProfile} onClick={() => setEditingProfile(false)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: savingProfile ? 'not-allowed' : 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={savingProfile} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: savingProfile ? 'not-allowed' : 'pointer' }}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'leaves' && (
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Start Date</th>
                <th style={{ padding: '12px' }}>End Date</th>
                <th style={{ padding: '12px' }}>Reason</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No leave requests found.</td></tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.leaveId} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{req.leaveType}</td>
                    <td style={{ padding: '12px' }}>{req.startDate}</td>
                    <td style={{ padding: '12px' }}>{req.endDate}</td>
                    <td style={{ padding: '12px' }}>{req.reason || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        backgroundColor: req.status === 'approved' ? '#d4edda' : req.status === 'rejected' ? '#f8d7da' : '#fff3cd', 
                        color: req.status === 'approved' ? '#155724' : req.status === 'rejected' ? '#721c24' : '#856404' 
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {req.status === 'pending' ? (
                        <button
                          onClick={() => handleCancelLeave(req.leaveId)}
                          style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#6c757d' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'attendance' && (
          <div>
            {/* Today's clock in/out card */}
            <div style={{ backgroundColor: theme.cardBg, color: theme.text, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>Today &middot; {todayStr()}</div>
                {todaysAttendance ? (
                  <div style={{ fontSize: '14px' }}>
                    Clocked in at <strong>{todaysAttendance.timeIn}</strong>
                    {todaysAttendance.timeOut ? (
                      <> &middot; Clocked out at <strong>{todaysAttendance.timeOut}</strong></>
                    ) : (
                      <span style={{ color: '#856404' }}> &middot; Still clocked in</span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', color: '#6c757d' }}>You haven't clocked in yet today.</div>
                )}
              </div>
              <div>
                {!todaysAttendance && (
                  <button onClick={handleClockIn} disabled={clockLoading} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: clockLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    {clockLoading ? 'Please wait...' : 'Clock In'}
                  </button>
                )}
                {todaysAttendance && !todaysAttendance.timeOut && (
                  <button onClick={handleClockOut} disabled={clockLoading} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: clockLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    {clockLoading ? 'Please wait...' : 'Clock Out'}
                  </button>
                )}
                {todaysAttendance && todaysAttendance.timeOut && (
                  <span style={{ fontSize: '13px', color: '#28a745', fontWeight: 'bold' }}>✓ Done for today</span>
                )}
              </div>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr style={theadStyle}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Time In</th>
                  <th style={{ padding: '12px' }}>Time Out</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No attendance records found.</td></tr>
                ) : (
                  [...attendance]
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .map((att) => (
                      <tr key={att.attendanceId} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{att.date}</td>
                        <td style={{ padding: '12px' }}>{att.timeIn || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{att.timeOut || 'N/A'}</td>
                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{att.status}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payroll' && (
          <table style={tableStyle}>
            <thead>
              <tr style={theadStyle}>
                <th style={{ padding: '12px' }}>Pay Period</th>
                <th style={{ padding: '12px' }}>Basic Salary</th>
                <th style={{ padding: '12px' }}>Deductions</th>
                <th style={{ padding: '12px' }}>Bonuses</th>
                <th style={{ padding: '12px' }}>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {payroll.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No payroll history found.</td></tr>
              ) : (
                payroll.map((pay) => (
                  <tr key={pay.payrollId} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{pay.payPeriodStart} to {pay.payPeriodEnd}</td>
                    <td style={{ padding: '12px' }}>₱{pay.basicSalary?.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>₱{pay.deductions?.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>₱{pay.bonuses?.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}><strong>₱{pay.netPay?.toFixed(2)}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}