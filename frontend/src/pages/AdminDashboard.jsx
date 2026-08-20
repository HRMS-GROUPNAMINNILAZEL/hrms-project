import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getEmployees, 
  getUsers, 
  getDepartments, 
  createEmployee, 
  getLeaveRequests, 
  approveLeaveRequest, 
  rejectLeaveRequest 
} from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('employees');

  // Modal / Form state for Employee
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    position: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    contactNumber: '',
    address: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'employees') {
        const empData = await getEmployees();
        setEmployees(empData);
        const usrData = await getUsers();
        setUsers(usrData);
        const deptData = await getDepartments();
        setDepartments(deptData);
      } else if (activeTab === 'users') {
        const usrData = await getUsers();
        setUsers(usrData);
      } else if (activeTab === 'leaveRequests') {
        const leaveData = await getLeaveRequests();
        setLeaveRequests(leaveData);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data from backend');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      user: { userId: Number(formData.userId) },
      firstName: formData.firstName,
      lastName: formData.lastName,
      department: formData.departmentId ? { departmentId: Number(formData.departmentId) } : null,
      position: formData.position,
      hireDate: formData.hireDate,
      status: formData.status,
      contactNumber: formData.contactNumber,
      address: formData.address
    };

    try {
      await createEmployee(payload);
      setShowModal(false);
      setFormData({
        userId: '',
        firstName: '',
        lastName: '',
        departmentId: '',
        position: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        contactNumber: '',
        address: ''
      });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create employee');
    }
  };

  // Handle Leave Approvals
  const handleApprove = async (id) => {
    try {
      // Backend requires approverId in the body
      await approveLeaveRequest(id, user.userId);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to approve leave request');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeaveRequest(id, user.userId);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to reject leave request');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#343a40', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '30px', textAlign: 'center', color: '#17a2b8' }}>HRMS Admin</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li 
              onClick={() => setActiveTab('employees')} 
              style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: activeTab === 'employees' ? '#495057' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
            >
              👥 Employees
            </li>
            <li 
              onClick={() => setActiveTab('users')} 
              style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: activeTab === 'users' ? '#495057' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
            >
              🔐 System Users
            </li>
            <li 
              onClick={() => setActiveTab('leaveRequests')} 
              style={{ padding: '10px 15px', cursor: 'pointer', backgroundColor: activeTab === 'leaveRequests' ? '#495057' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}
            >
              📝 Leave Requests
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
            {activeTab === 'employees' && 'Employee Directory'}
            {activeTab === 'users' && 'System Users'}
            {activeTab === 'leaveRequests' && 'Leave Requests Management'}
          </h1>
          <div>
            {activeTab === 'employees' && (
              <button 
                onClick={() => setShowModal(true)} 
                style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px', fontWeight: 'bold' }}
              >
                + Add Employee
              </button>
            )}
            <button onClick={loadData} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>Refresh</button>
          </div>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '20px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}

        {/* Modal for Creating Employee */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3>Add New Employee</h3>
              <form onSubmit={handleCreateEmployee}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Link User Account *</label>
                  <select name="userId" value={formData.userId} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">Select User...</option>
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Department</label>
                    <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Select Department...</option>
                      {departments.map(d => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Position</label>
                    <input type="text" name="position" value={formData.position} onChange={handleInputChange} placeholder="e.g. Software Engineer" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Hire Date *</label>
                    <input type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="active">Active</option>
                      <option value="resigned">Resigned</option>
                      <option value="terminated">Terminated</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Contact Number</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="09171234567" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="City, Province" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Employee</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading data from MySQL / Spring Boot...</p>
        ) : (
          <div>
            {activeTab === 'employees' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Position</th>
                    <th style={{ padding: '12px' }}>Department</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No employees found.</td></tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.employeeId} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{emp.employeeId}</td>
                        <td style={{ padding: '12px' }}>{emp.firstName} {emp.lastName}</td>
                        <td style={{ padding: '12px' }}>{emp.position || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{emp.department?.departmentName || 'None'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: emp.status === 'active' ? '#d4edda' : '#f8d7da', color: emp.status === 'active' ? '#155724' : '#721c24' }}>
                            {emp.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{emp.contactNumber || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'users' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px' }}>User ID</th>
                    <th style={{ padding: '12px' }}>Username</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Role</th>
                    <th style={{ padding: '12px' }}>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.userId} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>{u.userId}</td>
                      <td style={{ padding: '12px' }}>{u.username}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}><strong>{u.role}</strong></td>
                      <td style={{ padding: '12px' }}>{u.isActive ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'leaveRequests' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Employee</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Dates</th>
                    <th style={{ padding: '12px' }}>Reason</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No leave requests found.</td></tr>
                  ) : (
                    leaveRequests.map((req) => (
                      <tr key={req.leaveRequestId} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>{req.leaveRequestId}</td>
                        <td style={{ padding: '12px' }}>{req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{req.leaveType}</td>
                        <td style={{ padding: '12px' }}>{req.startDate} to {req.endDate}</td>
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
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleApprove(req.leaveRequestId)} style={{ padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                              <button onClick={() => handleReject(req.leaveRequestId)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#6c757d' }}>Processed</span>
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