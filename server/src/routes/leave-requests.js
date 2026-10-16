const express = require('express');
const { LeaveRequest, Employee, Notification, Counter, LeaveBalance } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

// GET leave requests (employees see only their own; admin/hr/manager see all)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp) return res.json([]);
      filter = { employeeId: currentEmp.employeeId };
    }

    const leaveRequests = await LeaveRequest.find(filter).sort({ createdAt: -1, leaveId: -1 });
    const employees = await Employee.find();
    const employeeMap = employees.reduce((map, emp) => {
      map[emp.employeeId] = emp;
      return map;
    }, {});
    
    const populatedLeaveRequests = leaveRequests.map(lr => ({
      ...lr.toObject(),
      employee: employeeMap[lr.employeeId] || null
    }));
    
    res.json(populatedLeaveRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST submit leave request (self-service for logged-in employee)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found for the logged in user' });
    }

    const lastLeave = await LeaveRequest.findOne().sort({ leaveId: -1 });
    const leaveId = lastLeave && lastLeave.leaveId ? lastLeave.leaveId + 1 : 1;

    const newLeaveRequest = new LeaveRequest({
      leaveId,
      employeeId: employee.employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });
    await newLeaveRequest.save();
    res.status(201).json(newLeaveRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH approve leave request (Admin, HR, Manager)
router.patch('/:id/approve', authenticateToken, requireRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    let leaveRequest;
    if (isNaN(req.params.id)) {
      leaveRequest = await LeaveRequest.findById(req.params.id);
    } else {
      leaveRequest = await LeaveRequest.findOne({ leaveId: parseInt(req.params.id) });
    }
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    leaveRequest.status = 'approved';
    await leaveRequest.save();

    // Update Leave Balance
    const start = new Date(leaveRequest.startDate);                
    const end = new Date(leaveRequest.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    await LeaveBalance.findOneAndUpdate(
      { employeeId: leaveRequest.employeeId, leaveType: leaveRequest.leaveType, year: new Date().getFullYear() },
      { $inc: { usedDays: diffDays } }
    );

    // Notify employee
    const employee = await Employee.findOne({ employeeId: leaveRequest.employeeId });                
    if (employee) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'notificationId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const newNotification = new Notification({
        notificationId: counter.seq,
        userId: employee.userId,
        message: `Your leave request for ${leaveRequest.leaveType} from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been approved.`,
        type: 'info'
      });
      await newNotification.save();
    }
    res.json(leaveRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH reject leave request (Admin, HR, Manager)
router.patch('/:id/reject', authenticateToken, requireRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    let leaveRequest;
    if (isNaN(req.params.id)) {
      leaveRequest = await LeaveRequest.findById(req.params.id);
    } else {
      leaveRequest = await LeaveRequest.findOne({ leaveId: parseInt(req.params.id) });
    }
    if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });
    
    leaveRequest.status = 'rejected';
    await leaveRequest.save();

    // Notify employee
    const employee = await Employee.findOne({ employeeId: leaveRequest.employeeId });                
    if (employee) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'notificationId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const newNotification = new Notification({
        notificationId: counter.seq,
        userId: employee.userId,
        message: `Your leave request for ${leaveRequest.leaveType} from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been rejected.`,
        type: 'info'
      });
      await newNotification.save();
    }

    res.json(leaveRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE leave request (HR & Admin can delete; regular employees can only delete their own pending request)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    let leaveRequest = null;
    if (isNaN(id)) {
      leaveRequest = await LeaveRequest.findById(id);
    } else {
      leaveRequest = await LeaveRequest.findOne({ leaveId: parseInt(id) });
    }
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp || currentEmp.employeeId !== leaveRequest.employeeId) {
        return res.status(403).json({ message: 'Access denied: cannot delete another employee\'s leave request' });
      }
      if (leaveRequest.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot cancel a leave request that has already been processed' });
      }
    }
    
    await LeaveRequest.findByIdAndDelete(leaveRequest._id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
