import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  getMyEmployee, 
  updateEmployee,
  updateMyProfile,
  getLeaveRequests, 
  createLeaveRequest, 
  deleteLeaveRequest,
  getAttendance, 
  createAttendance,
  updateAttendance,
  changePassword,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  getLeaveBalances
} from '../services/api';
import MyLeaveBalances from './employee/MyLeaveBalances';
import MyPerformanceReviews from './employee/MyPerformanceReviews';
import MySkills from './employee/MySkills';
import { IconDashboard, IconProfile, IconLeave, IconAttendance, IconPerformance, IconSkills, IconPassword, IconLogout, IconSun, IconMoon, IconBell, IconCamera } from '../components/Icons';

const todayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const nowTimeStr = () => new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"

const getInclusiveDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: theme.cardBg, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const theadStyle = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const errorBoxStyle = { color: theme.dangerText, marginBottom: '20px', backgroundColor: theme.dangerBg, padding: '12px 16px', borderRadius: '12px', fontSize: '13px', border: `1px solid ${theme.dangerBorder}` };
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  
  const [activeTab, setActiveTab] = useState('overview');
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

  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveBalancesKey, setLeaveBalancesKey] = useState(0);
  const [clockLoading, setClockLoading] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [messageDialog, setMessageDialog] = useState(null);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ contactNumber: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Profile photo state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadEmployeeData();
    loadNotifications();
    const interval = setInterval(() => { getUnreadCount().then(setUnreadCount).catch(() => {}); }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([getNotifications(), getUnreadCount()]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (e) { /* ignore */ }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !employeeProfile) return;
    if (file.size > 2000000) { setActionError('Image must be under 2MB'); return; }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await updateMyProfile({ ...employeeProfile, profilePhoto: reader.result });
        setEmployeeProfile(updated);
      } catch (err) { setActionError('Failed to upload photo'); }
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const loadEmployeeData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch only the current employee record via /employees/me
      const currentEmp = await getMyEmployee();

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

      try {
        const bal = await getLeaveBalances({ employeeId: empId, year: new Date().getFullYear() });
        setLeaveBalances(bal || []);
      } catch (e) {
        console.warn('Failed to prefetch leave balances:', e);
      }



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
    try {
      const bal = await getLeaveBalances({ employeeId: employeeProfile.employeeId, year: new Date().getFullYear() });
      setLeaveBalances(bal || []);
    } catch (e) {
      console.warn('Failed to refresh leave balances:', e);
    }
    setLeaveBalancesKey(prev => prev + 1);
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

    setSubmittingLeave(true);
    try {
      await createLeaveRequest(payload);
      setShowLeaveModal(false);
      setLeaveForm({ leaveType: 'vacation', startDate: '', endDate: '', reason: '' });
      await refreshLeaveRequests();
      setMessageDialog({
        type: 'success',
        title: 'Leave Request Submitted',
        message: 'Your leave request has been submitted successfully and is pending approval.'
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit leave request';
      setShowLeaveModal(false);
      setActionError(errorMsg);
      const isLimit = errorMsg.toLowerCase().includes('remain') ||
                      errorMsg.toLowerCase().includes('limit') ||
                      errorMsg.toLowerCase().includes('balance') ||
                      errorMsg.toLowerCase().includes('exceed');
      setMessageDialog({
        type: 'error',
        title: isLimit ? 'Leave Limit Reached' : 'Unable to Submit Leave',
        message: errorMsg
      });
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    setActionError('');
    try {
      await deleteLeaveRequest(leaveId);
      await refreshLeaveRequests();
      setMessageDialog({
        type: 'success',
        title: 'Leave Cancelled',
        message: 'Your leave request has been cancelled successfully.'
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to cancel leave request';
      setActionError(errorMsg);
      setMessageDialog({
        type: 'error',
        title: 'Cancellation Failed',
        message: errorMsg
      });
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
      contactNumber: profileForm.contactNumber,
      address: profileForm.address
    };

    try {
      const updated = await updateMyProfile(payload);
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
        style={{ padding: '9px 14px', cursor: 'pointer', backgroundColor: isActive ? theme.sidebarActive : (hovered ? theme.sidebarHover : 'transparent'), borderRadius: '10px', marginBottom: '2px', fontSize: '13px', color: isActive ? theme.sidebarActiveText : theme.sidebarText, fontWeight: isActive ? '600' : '400', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.01em' }}
      >
        {icon} {text}
      </li>
    );
  };

  const currentLeaveYear = leaveForm.startDate ? new Date(leaveForm.startDate).getFullYear() : new Date().getFullYear();
  const selectedBalance = leaveBalances.find(b => 
    b.leaveType?.toLowerCase() === leaveForm.leaveType?.toLowerCase() &&
    (!b.year || b.year === currentLeaveYear)
  );

  const calculateDays = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) return null;
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    if (end < start) return -1;
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };
  const modalDaysCount = calculateDays();
  const isOverBalance = modalDaysCount && modalDaysCount > 0 && 
    leaveForm.leaveType !== 'unpaid' && 
    selectedBalance && 
    modalDaysCount > (selectedBalance.remainingDays ?? 0);

  return (
    <div className="dashboard-shell" style={{ backgroundColor: theme.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: theme.text }}>
      <div className="dashboard-sidebar" style={{ backgroundColor: theme.sidebarBg, padding: '20px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: `1px solid ${theme.border}` }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '4px 10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #84cc16, #65a30d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(132,204,22,0.3)' }}>
              <IconDashboard size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: theme.text, letterSpacing: '-0.3px' }}>HRMS</span>
          </div>
          {employeeProfile && (
            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', backgroundColor: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 10px', overflow: 'hidden', border: `2px solid ${theme.border}`, backgroundColor: theme.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {employeeProfile.profilePhoto ? (
                  <img src={employeeProfile.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconProfile size={24} color={theme.textMuted} />
                )}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>
                {employeeProfile.firstName} {employeeProfile.lastName}
              </div>
              <div style={{ fontSize: '10px', color: theme.textSecondary || theme.textMuted, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {employeeProfile.position}
              </div>
            </div>
          )}

          <div style={{ fontSize: '10px', fontWeight: '600', color: theme.textSecondary || theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: '8px' }}>Main</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
            <EmployeeSidebarItem itemKey="overview" icon={<IconDashboard size={16} />} text="Overview" />
            <EmployeeSidebarItem itemKey="profile" icon={<IconProfile size={16} />} text="My Profile" />
          </ul>

          <div style={{ fontSize: '10px', fontWeight: '600', color: theme.textSecondary || theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: '8px' }}>Work</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
            <EmployeeSidebarItem itemKey="leaves" icon={<IconLeave size={16} />} text="Leave Requests" />
            <EmployeeSidebarItem itemKey="attendance" icon={<IconAttendance size={16} />} text="Attendance" />
            <EmployeeSidebarItem itemKey="myPerformance" icon={<IconPerformance size={16} />} text="Performance" />
            <EmployeeSidebarItem itemKey="mySkills" icon={<IconSkills size={16} />} text="My Skills" />
          </ul>

          <div style={{ fontSize: '10px', fontWeight: '600', color: theme.textSecondary || theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 14px', marginBottom: '8px' }}>Account</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <EmployeeSidebarItem itemKey="changePassword" icon={<IconPassword size={16} />} text="Change Password" />
          </ul>
        </div>
        <div>
          <div style={{ padding: '12px 14px', backgroundColor: theme.cardBg, borderRadius: '12px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: '10px', color: theme.textSecondary || theme.textMuted, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Logged in as</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>{user.username}</div>
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
            {activeTab === 'overview' && 'Dashboard'}
            {activeTab === 'profile' && 'My Profile'}
            {activeTab === 'leaves' && 'Leave Requests'}
            {activeTab === 'attendance' && 'Attendance'}

            {activeTab === 'myPerformance' && 'Performance Reviews'}
            {activeTab === 'mySkills' && 'My Skills'}
            {activeTab === 'changePassword' && 'Change Password'}
          </h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {activeTab === 'leaves' && (
              <button 
                onClick={() => { setActionError(''); setShowLeaveModal(true); }} 
                style={{ padding: '9px 16px', cursor: 'pointer', backgroundColor: theme.primary, color: theme.primaryText, border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
              >
                + Request Leave
              </button>
            )}
            {activeTab === 'profile' && (
              <button onClick={() => window.print()} style={{ padding: '9px 14px', backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print
              </button>
            )}
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowNotifDropdown(!showNotifDropdown); if (!showNotifDropdown) loadNotifications(); }} style={{ padding: '9px 12px', backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '14px', position: 'relative', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unreadCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '17px', height: '17px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{unreadCount}</span>}
              </button>
              {showNotifDropdown && (
                <div style={{ position: 'absolute', right: 0, top: '44px', width: '320px', maxHeight: '400px', overflowY: 'auto', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '14px', boxShadow: '0 16px 48px rgba(0,0,0,0.3)', zIndex: 1000 }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px', color: theme.text }}>Notifications</strong>
                    {unreadCount > 0 && <button onClick={async () => { await markAllNotificationsRead(); loadNotifications(); }} style={{ fontSize: '12px', color: theme.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Mark all read</button>}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: theme.textMuted, fontSize: '13px' }}>No notifications yet</div>
                  ) : notifications.slice(0, 20).map(n => (
                    <div key={n.notificationId} onClick={async () => { if (!n.isRead) { await markNotificationRead(n.notificationId); loadNotifications(); } }} style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', backgroundColor: n.isRead ? 'transparent' : theme.accentBg, fontSize: '13px', transition: 'background-color 0.15s ease' }}>
                      {n.type === 'leave_rejected' ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: theme.text }}>
                            <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>✕</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500' }}>
                                {n.message.includes(' Reason: ') ? n.message.substring(0, n.message.indexOf(' Reason: ')) : n.message}
                              </div>
                              {n.message.includes(' Reason: ') && (
                                <div style={{ marginTop: '6px', padding: '6px 10px', backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #ef4444', fontSize: '12px', color: isDarkMode ? '#fca5a5' : '#991b1b' }}>
                                  <span style={{ fontWeight: '600' }}>Reason: </span>
                                  {n.message.substring(n.message.indexOf(' Reason: ') + 9)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', paddingLeft: '22px' }}>{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ color: theme.text }}>{n.type === 'leave_approved' ? '✓' : '●'} {n.message}</div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              style={{ padding: '9px 14px', backgroundColor: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
            >
              {isDarkMode ? <><IconSun size={14} /> Light</> : <><IconMoon size={14} /> Dark</>}
            </button>
          </div>
        </div>

        {error && <div style={errorBoxStyle}>{error}</div>}
        {actionError && <div style={errorBoxStyle}>{actionError}</div>}

        {/* Leave Request Modal */}
        {showLeaveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: theme.cardBg, color: theme.text, padding: '32px', borderRadius: '16px', width: '420px', border: `1px solid ${theme.border}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Submit Leave Request</h3>
              <form onSubmit={handleSubmitLeave}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Leave Type</label>
                  <select name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveInputChange} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none' }}>
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick</option>
                    <option value="emergency">Emergency</option>
                    <option value="maternity">Maternity</option>
                    <option value="paternity">Paternity</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                  {selectedBalance && leaveForm.leaveType !== 'unpaid' && (
                    <div style={{ fontSize: '12px', marginTop: '6px', color: theme.textMuted, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Remaining ({currentLeaveYear}):</span>
                      <strong style={{ color: (selectedBalance.remainingDays ?? 0) > 0 ? theme.primary : theme.dangerText }}>
                        {selectedBalance.remainingDays ?? 0} day(s)
                      </strong>
                    </div>
                  )}
                  {leaveForm.leaveType === 'unpaid' && (
                    <div style={{ fontSize: '12px', marginTop: '6px', color: theme.textMuted }}>
                      Unpaid leave is exempt from allotment limits.
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Start Date</label>
                  <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>End Date</label>
                  <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none' }} />
                  {modalDaysCount !== null && (
                    <div style={{ fontSize: '12px', marginTop: '6px' }}>
                      {modalDaysCount === -1 ? (
                        <span style={{ color: theme.dangerText }}>⚠️ End date cannot be earlier than start date</span>
                      ) : (
                        <span style={{ color: theme.textMuted }}>Duration: <strong style={{ color: theme.text }}>{modalDaysCount} day(s)</strong></span>
                      )}
                    </div>
                  )}
                  {isOverBalance && (
                    <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '8px', backgroundColor: theme.dangerBg, color: theme.dangerText, border: `1px solid ${theme.dangerBorder}`, fontSize: '12px', lineHeight: '1.4' }}>
                      ⚠️ Limit warning: This request needs {modalDaysCount} day(s), but only {selectedBalance.remainingDays ?? 0} remain for {currentLeaveYear}.
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Reason</label>
                  <textarea name="reason" value={leaveForm.reason} onChange={handleLeaveInputChange} rows="3" placeholder="Brief explanation..." style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text, outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setShowLeaveModal(false)} style={{ padding: '9px 18px', backgroundColor: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Cancel</button>
                  <button type="submit" disabled={submittingLeave || modalDaysCount === -1} style={{ padding: '9px 20px', backgroundColor: submittingLeave ? '#6c757d' : theme.primary, color: theme.primaryText, border: 'none', borderRadius: '8px', cursor: (submittingLeave || modalDaysCount === -1) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    {submittingLeave ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Message Dialog (Popup alert dialog for limit reached, errors, or success) */}
        {messageDialog && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000
            }}
            onClick={() => setMessageDialog(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: theme.cardBg,
                color: theme.text,
                padding: '32px',
                borderRadius: '16px',
                width: '420px',
                maxWidth: '90vw',
                border: `1px solid ${messageDialog.type === 'error' ? theme.dangerBorder : theme.border}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: messageDialog.type === 'error' ? theme.dangerBg : theme.accentBg,
                  color: messageDialog.type === 'error' ? theme.dangerText : theme.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '26px'
                }}
              >
                {messageDialog.type === 'error' ? '⚠️' : '✓'}
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>
                {messageDialog.title}
              </h3>
              <p style={{ margin: '0 0 24px 0', color: theme.textMuted, fontSize: '14px', lineHeight: '1.5' }}>
                {messageDialog.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setMessageDialog(null)}
                  style={{
                    padding: '10px 32px',
                    backgroundColor: theme.primary,
                    color: theme.primaryText,
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Tab Views */}
        {activeTab === 'leaves' && employeeProfile && (
          <MyLeaveBalances key={leaveBalancesKey} employeeId={employeeProfile.employeeId} />
        )}

        {activeTab === 'myPerformance' && employeeProfile && (
          <MyPerformanceReviews employeeId={employeeProfile.employeeId} />
        )}

        {activeTab === 'mySkills' && employeeProfile && (
          <MySkills employeeId={employeeProfile.employeeId} />
        )}

        {activeTab === 'profile' && employeeProfile && (
          <div id="profile-printable" style={{ backgroundColor: theme.cardBg, color: theme.text, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', padding: '24px', maxWidth: '600px', border: `1px solid ${theme.border}` }}>
            {!editingProfile ? (
              <>
                {/* Profile Photo */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 10px', overflow: 'hidden', border: `2px solid ${theme.border}`, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {employeeProfile.profilePhoto ? (
                      <img src={employeeProfile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '32px' }}>👤</span>
                    )}
                  </div>
                  <label style={{ fontSize: '12px', color: theme.primary, cursor: 'pointer' }}>
                    {uploadingPhoto ? 'Uploading...' : '📷 Change Photo'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                </div>
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
                        backgroundColor: req.status === 'approved' ? (isDarkMode ? '#064e3b' : '#d4edda') : req.status === 'rejected' ? (isDarkMode ? '#7f1d1d' : '#f8d7da') : (isDarkMode ? '#78350f' : '#fff3cd'), 
                        color: req.status === 'approved' ? (isDarkMode ? '#6ee7b7' : '#155724') : req.status === 'rejected' ? (isDarkMode ? '#fca5a5' : '#721c24') : (isDarkMode ? '#fbbf24' : '#856404') 
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

        {/* ---------------- Overview Tab ---------------- */}
        {activeTab === 'overview' && employeeProfile && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Leaves', count: leaveRequests.length, color: isDarkMode ? '#93c5fd' : '#1e40af', bg: isDarkMode ? '#1e3a5f' : '#dbeafe', icon: '📝' },
                { label: 'Approved', count: leaveRequests.filter(l => l.status === 'approved').length, color: isDarkMode ? '#6ee7b7' : '#065f46', bg: isDarkMode ? '#064e3b' : '#d1fae5', icon: '✅' },
                { label: 'Pending', count: leaveRequests.filter(l => l.status === 'pending').length, color: isDarkMode ? '#fbbf24' : '#92400e', bg: isDarkMode ? '#78350f' : '#fef3c7', icon: '⏳' },
                { label: 'Attendance Records', count: attendance.length, color: isDarkMode ? '#c4b5fd' : '#5b21b6', bg: isDarkMode ? '#4c1d95' : '#ede9fe', icon: '🕒' },
              ].map(c => (
                <div key={c.label} style={{ backgroundColor: c.bg, padding: '24px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{c.icon}</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: c.color }}>{c.count}</div>
                  <div style={{ fontSize: '13px', color: c.color, opacity: 0.8, marginTop: '4px' }}>{c.label}</div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: theme.text, marginTop: 0, marginBottom: '16px' }}>👋 Welcome, {employeeProfile.firstName}!</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', color: theme.text }}>
                <div><strong>Position:</strong> {employeeProfile.position || 'N/A'}</div>
                <div><strong>Department:</strong> {employeeProfile.department?.departmentName || 'N/A'}</div>
                <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{employeeProfile.status}</span></div>
                <div><strong>Hire Date:</strong> {employeeProfile.hireDate}</div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Change Password Tab ---------------- */}
        {activeTab === 'changePassword' && (
          <div style={{ maxWidth: '480px' }}>
            <div style={{ backgroundColor: theme.cardBg, padding: '32px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
              {passwordMsg.text && (
                <div style={{
                  padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px',
                  backgroundColor: passwordMsg.type === 'success' ? (isDarkMode ? '#064e3b' : '#d1fae5') : (isDarkMode ? '#450a0a' : '#fee2e2'),
                  color: passwordMsg.type === 'success' ? (isDarkMode ? '#6ee7b7' : '#065f46') : (isDarkMode ? '#fca5a5' : '#b91c1c'),
                  border: `1px solid ${passwordMsg.type === 'success' ? (isDarkMode ? '#065f46' : '#6ee7b7') : (isDarkMode ? '#991b1b' : '#fecaca')}`
                }}>
                  {passwordMsg.text}
                </div>
              )}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPasswordMsg({ type: '', text: '' });
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
                  return;
                }
                if (passwordForm.newPassword.length < 6) {
                  setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
                  return;
                }
                setPasswordLoading(true);
                try {
                  await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
                  setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                } catch (err) {
                  setPasswordMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to change password' });
                } finally {
                  setPasswordLoading(false);
                }
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: theme.text }}>Current Password</label>
                  <input type="password" required value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: theme.text }}>New Password</label>
                  <input type="password" required minLength={6} value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: theme.text }}>Confirm New Password</label>
                  <input type="password" required minLength={6} value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none' }}
                  />
                </div>
                <button type="submit" disabled={passwordLoading}
                  style={{ padding: '12px 24px', backgroundColor: theme.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: passwordLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}