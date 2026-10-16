const express = require('express');
const { LeaveBalance, Employee } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

const DEFAULT_ALLOTMENTS = {
  vacation: 15,
  sick: 15,
  emergency: 5,
  maternity: 105,
  paternity: 7,
  unpaid: 0
};

async function ensureBalancesForYear(employeeId, year) {
  for (const [leaveType, defaultTotal] of Object.entries(DEFAULT_ALLOTMENTS)) {
    const existing = await LeaveBalance.findOne({ employeeId: parseInt(employeeId), leaveType, year: parseInt(year) });
    if (!existing) {
      const last = await LeaveBalance.findOne().sort({ balanceId: -1 });
      const balanceId = last ? last.balanceId + 1 : 1;
      await LeaveBalance.create({
        balanceId,
        employeeId: parseInt(employeeId),
        leaveType,
        totalDays: defaultTotal,
        usedDays: 0,
        year: parseInt(year)
      });
    }
  }
}

// GET leave balances (employees see only their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let { employeeId, year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp) return res.json([]);
      employeeId = currentEmp.employeeId;
    }

    if (employeeId) {
      await ensureBalancesForYear(employeeId, targetYear);
      const leaveBalances = await LeaveBalance.find({ employeeId: parseInt(employeeId), year: targetYear });
      const balancesWithRemaining = leaveBalances.map(b => ({
        ...b.toObject(),
        remainingDays: b.totalDays - b.usedDays
      }));
      return res.json(balancesWithRemaining);
    }

    const query = {};
    if (year) query.year = parseInt(year);
    const leaveBalances = await LeaveBalance.find(query);
    res.json(leaveBalances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create leave balance (Admin/HR only)
router.post('/', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const last = await LeaveBalance.findOne().sort({ balanceId: -1 });
    const balanceId = last ? last.balanceId + 1 : 1;
    const leaveBalance = await LeaveBalance.create({ ...req.body, balanceId });
    res.status(201).json(leaveBalance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update leave balance (Admin/HR only)
router.put('/:balanceId', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const balanceId = parseInt(req.params.balanceId);
    const updated = await LeaveBalance.findOneAndUpdate(
      { balanceId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Leave balance not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE leave balance (Admin/HR only)
router.delete('/:balanceId', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const balanceId = parseInt(req.params.balanceId);
    const deleted = await LeaveBalance.findOneAndDelete({ balanceId });
    if (!deleted) {
      return res.status(404).json({ message: 'Leave balance not found' });
    }
    res.json({ message: 'Leave balance deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


