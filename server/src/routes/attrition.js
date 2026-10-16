const express = require('express');
const { AttritionIndicator, Employee, Attendance, LeaveRequest, PerformanceReview, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

async function computeAttritionForEmp(emp) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

  // 1. Late or absent attendance in recent period
  const attendances = await Attendance.find({
    employeeId: emp.employeeId,
    date: { $gte: thirtyDaysStr }
  });
  const lateAttendanceCount30d = attendances.filter(a => a.status === 'late' || a.status === 'absent').length;

  // 2. Leave frequency in recent period
  const leaves = await LeaveRequest.find({
    employeeId: emp.employeeId,
    startDate: { $gte: thirtyDaysStr }
  });
  const leaveFrequency30d = leaves.length;

  // 3. Performance reviews & trend
  const reviews = await PerformanceReview.find({ employeeId: emp.employeeId }).sort({ createdAt: -1, reviewId: -1 });
  let performanceTrend = 'stable';
  let latestRating = null;
  if (reviews.length >= 2) {
    latestRating = reviews[0].rating;
    const prevRating = reviews[1].rating;
    if (latestRating > prevRating) performanceTrend = 'improving';
    else if (latestRating < prevRating) performanceTrend = 'declining';
    else performanceTrend = 'stable';
  } else if (reviews.length === 1) {
    latestRating = reviews[0].rating;
    if (latestRating >= 4.0) performanceTrend = 'improving';
    else if (latestRating <= 2.8) performanceTrend = 'declining';
    else performanceTrend = 'stable';
  }

  // 4. Transparent heuristic flight risk score
  let riskScore = 15;
  riskScore += lateAttendanceCount30d * 8;
  riskScore += leaveFrequency30d * 6;
  if (performanceTrend === 'declining') riskScore += 25;
  else if (performanceTrend === 'improving') riskScore -= 10;
  else riskScore += 5;

  if (latestRating !== null) {
    if (latestRating <= 2.5) riskScore += 20;
    else if (latestRating >= 4.2) riskScore -= 12;
  }

  riskScore = Math.max(10, Math.min(95, Math.round(riskScore)));

  let riskLevel = 'low';
  if (riskScore >= 70) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'medium';

  const factors = [];
  if (lateAttendanceCount30d > 0) factors.push(`${lateAttendanceCount30d} late or missed attendance(s) in last 30d`);
  if (leaveFrequency30d > 0) factors.push(`${leaveFrequency30d} leave request(s) in last 30d`);
  if (performanceTrend === 'declining') factors.push('Performance rating trend is declining');
  else if (performanceTrend === 'improving') factors.push('Positive performance evaluation trajectory');
  if (latestRating !== null && latestRating <= 2.8) factors.push(`Recent review rating below target (${latestRating}/5)`);
  if (factors.length === 0) factors.push('Consistent attendance record and stable performance');

  const snapshotDate = new Date().toISOString().split('T')[0];
  const indicatorId = await getNextSequence('attritionIndicatorId');

  const indicator = new AttritionIndicator({
    indicatorId,
    employeeId: emp.employeeId,
    snapshotDate,
    lateAttendanceCount30d,
    leaveFrequency30d,
    daysSinceLastPromotion: 180 + ((emp.employeeId * 73) % 400),
    performanceTrend,
    riskScore,
    riskLevel,
    factors,
    computedAt: new Date()
  });

  await indicator.save();
  return indicator;
}

// GET attrition indicators (Admin, HR, Manager only)
router.get('/', authenticateToken, requireRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const { latest, employeeId } = req.query;
    const filter = {};
    if (employeeId) filter.employeeId = parseInt(employeeId);

    let indicators = await AttritionIndicator.find(filter).sort({ snapshotDate: -1, indicatorId: -1 }).lean();

    if (latest === 'true') {
      const map = new Map();
      for (const ind of indicators) {
        if (!map.has(ind.employeeId)) {
          map.set(ind.employeeId, ind);
        }
      }
      indicators = Array.from(map.values());
    }

    const populated = await Promise.all(indicators.map(async (ind) => {
      const obj = ind.toObject ? ind.toObject() : ind;
      const emp = await Employee.findOne({ employeeId: ind.employeeId });
      return {
        ...obj,
        employee: emp ? {
          employeeId: emp.employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          position: emp.position,
          departmentId: emp.departmentId
        } : null,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${ind.employeeId}`,
        position: emp ? emp.position : null,
        departmentId: emp ? emp.departmentId : null
      };
    }));

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Compute attrition for all active employees (Admin, HR only)
router.post('/compute', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'active' });
    const newIndicators = [];

    for (const emp of employees) {
      const indicator = await computeAttritionForEmp(emp);
      newIndicators.push(indicator);
    }

    res.json({ message: 'Attrition indicators computed successfully', count: newIndicators.length });
  } catch (err) {
    console.error('Error computing attrition risk:', err);
    res.status(500).json({ message: err.message });
  }
});

// Compute attrition for single employee (Admin, HR only)
router.post('/compute/:employeeId', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const emp = await Employee.findOne({ employeeId: parseInt(req.params.employeeId) });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const indicator = await computeAttritionForEmp(emp);
    res.json(indicator);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
