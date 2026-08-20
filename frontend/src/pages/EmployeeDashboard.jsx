import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getEmployees, 
  getLeaveRequests, 
  createLeaveRequest, 
  getAttendance, 
  getPayroll 
} from '../services/api';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  
  const [activeTab, setActiveTab] = useState('leaves');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for new leave request
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });

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

      // 2. Fetch specific records using this employee's employeeId
      const empId = currentEmp.employeeId;
      const leaves = await getLeaveRequests({ employeeId: empId });
      setLeaveRequests(leaves);

      const att = await getAttendance({ employeeId: empId });
      setAttendance(att);

      const pay = await getPayroll({ employeeId: empId });
      setPayroll(pay);

    } catch (err) {
      setError(err.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveInputChange = (e) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');

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
      // Reload leave requests
      const leaves = await getLeaveRequests({ employeeId: employeeProfile.employeeId });
      setLeaveRequests(leaves);
    } catch (err) {
      setError(err.message || 'Failed to submit leave request');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading your dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#343a40', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '10px', textAlign: 'center', color: '#28a745' }}>Employee Portal</h2>
          {employeeProfile && (
            <p style={{ fontSize: '13px', textAlign: 'center', color: '#adb5bd', marginBottom: '30px' }}>
              {employeeProfile.firstName} {employeeProfile.lastName}<br />
              <span style={{ color: '#17a2b8' }}>{employeeProfile.position}</span>
            </p>
          )}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li 
              onClick={() => setActiveTab('leaves')} 
              style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: activeTab === 'leaves' ? '#495057' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
            >
              📝 My Leave Requests
            </li>
            <li 
              onClick={() => setActiveTab('attendance')} 
              style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: activeTab === 'attendance' ? '#495057' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
            >
              🕒 My Attendance
            </li>
            <li 
              onClick={() => setActiveTab('payroll')} 
              style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: activeTab === 'payroll' ? '#495057' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
            >
              💰 My Payroll History
            </li>
          </ul>
        </div>
        <div>
          <p style={{ fontSize: '13px', color: '#adb5bd', marginBottom: '10px' }}>Logged in as: <strong>{user.username}</strong></p>
          <button 
            onClick={logout}
            style={{ width: '100%', padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>
            {activeTab === 'leaves' && 'My Leave Requests'}
            {activeTab === 'attendance' && 'My Attendance Logs'}
            {activeTab === 'payroll' && 'My Payroll History'}
          </h1>
          <div>
            {activeTab === 'leaves' && (
              <button 
                onClick={() => setShowLeaveModal(true)} 
                style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
              >
                + Request Leave
              </button>
            )}
          </div>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        {/* Leave Request Modal */}
        {showLeaveModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px' }}>
              <h3>Submit Leave Request</h3>
              <form onSubmit={handleSubmitLeave}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Leave Type</label>
                  <select name="leaveType" value={leaveForm.leaveType} onChange={handleLeaveInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
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
                  <input type="date" name="startDate" value={leaveForm.startDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>End Date</label>
                  <input type="date" name="endDate" value={leaveForm.endDate} onChange={handleLeaveInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Reason</label>
                  <textarea name="reason" value={leaveForm.reason} onChange={handleLeaveInputChange} rows="3" placeholder="Brief explanation..." style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
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
        {activeTab === 'leaves' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Start Date</th>
                <th style={{ padding: '12px' }}>End Date</th>
                <th style={{ padding: '12px' }}>Reason</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No leave requests found.</td></tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.leaveRequestId} style={{ borderBottom: '1px solid #dee2e6' }}>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'attendance' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
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
                attendance.map((att) => (
                  <tr key={att.attendanceId} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{att.date}</td>
                    <td style={{ padding: '12px' }}>{att.timeIn || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{att.timeOut || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{att.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'payroll' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
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