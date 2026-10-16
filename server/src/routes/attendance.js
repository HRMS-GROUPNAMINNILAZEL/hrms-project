const express = require('express');
const { Attendance, Employee, Department, User, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

async function enrichEmployee(empDoc) {
  const emp = empDoc.toObject ? empDoc.toObject() : empDoc;
  let dept = null;
  if (emp.departmentId) {
    dept = await Department.findOne({ departmentId: emp.departmentId }).lean();
  }
  let mgr = null;
  if (emp.managerId) {
    mgr = await Employee.findOne({ employeeId: emp.managerId }).lean();
  }
  let usr = null;
  if (emp.userId) {
    usr = await User.findOne({ userId: emp.userId }).lean();
  }
  return {
    ...emp,
    department: dept || null,
    manager: mgr || null,
    user: usr || null
  };
}

async function enrichAttendance(attDoc) {
  const att = attDoc.toObject ? attDoc.toObject() : attDoc;
  let emp = null;
  if (att.employeeId) {
    const empDoc = await Employee.findOne({ employeeId: att.employeeId });
    if (empDoc) {
      emp = await enrichEmployee(empDoc);
    }
  }
  return {
    ...att,
    employee: emp || null
  };
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employeeId, date, startDate, endDate } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp) return res.json([]);
      query.employeeId = currentEmp.employeeId;
    } else if (employeeId) {
      query.employeeId = parseInt(employeeId);
    }

    if (date) query.date = date;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    const attendance = await Attendance.find(query).sort({ date: -1, clockIn: -1 });
    const enriched = await Promise.all(attendance.map(a => enrichAttendance(a)));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const attendanceId = parseInt(req.params.id);
    const att = await Attendance.findOne({ attendanceId });
    if (!att) return res.status(404).json({ message: 'Attendance record not found' });

    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp || currentEmp.employeeId !== att.employeeId) {
        return res.status(403).json({ message: 'Access denied: cannot view another employee\'s attendance' });
      }
    }

    const enriched = await enrichAttendance(att);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    let payload = { ...req.body };
    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      payload.employeeId = currentEmp.employeeId;
    }

    const attendanceId = await getNextSequence('attendanceId');
    const att = await Attendance.create({ ...payload, attendanceId });
    const enriched = await enrichAttendance(att);
    res.status(201).json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const attendanceId = parseInt(req.params.id);
    const existing = await Attendance.findOne({ attendanceId });
    if (!existing) return res.status(404).json({ message: 'Attendance record not found' });

    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp || currentEmp.employeeId !== existing.employeeId) {
        return res.status(403).json({ message: 'Access denied: cannot edit another employee\'s attendance' });
      }
    }

    const updated = await Attendance.findOneAndUpdate({ attendanceId }, req.body, { new: true });
    const enriched = await enrichAttendance(updated);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const attendanceId = parseInt(req.params.id);
    const deleted = await Attendance.findOneAndDelete({ attendanceId });
    if (!deleted) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
