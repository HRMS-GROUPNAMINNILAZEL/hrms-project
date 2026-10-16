const express = require('express');
const { Employee, Department, LeaveRequest, AttritionIndicator } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/summary', authenticateToken, requireRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const [employees, departments, leaveRequests, attritionIndicators] = await Promise.all([
      Employee.find().lean(),
      Department.find().lean(),
      LeaveRequest.find().lean(),
      AttritionIndicator.find().sort({ snapshotDate: -1, indicatorId: -1 }).lean()
    ]);

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const onLeaveEmployees = employees.filter(e => e.status === 'on_leave').length;
    const pendingLeaveRequests = leaveRequests.filter(lr => lr.status === 'pending').length;

    // Latest attrition indicator per employee
    const latestAttritionMap = new Map();
    for (const ind of attritionIndicators) {
      if (!latestAttritionMap.has(ind.employeeId)) {
        latestAttritionMap.set(ind.employeeId, ind);
      }
    }
    const latestAttrition = Array.from(latestAttritionMap.values());
    const highAttritionRiskCount = latestAttrition.filter(a => a.riskLevel === 'high').length;
    const mediumAttritionRiskCount = latestAttrition.filter(a => a.riskLevel === 'medium').length;
    const lowAttritionRiskCount = latestAttrition.filter(a => a.riskLevel === 'low').length;

    // Headcount by Department
    const deptMap = {};
    for (const d of departments) {
      deptMap[d.departmentId] = d.departmentName;
    }
    const headcountByDepartment = {};
    for (const d of departments) {
      headcountByDepartment[d.departmentName] = 0;
    }
    for (const emp of employees) {
      const deptName = deptMap[emp.departmentId] || 'Unassigned';
      headcountByDepartment[deptName] = (headcountByDepartment[deptName] || 0) + 1;
    }

    // Employees by Status
    const employeesByStatus = {};
    for (const emp of employees) {
      const st = emp.status || 'active';
      employeesByStatus[st] = (employeesByStatus[st] || 0) + 1;
    }

    // Leave Requests by Status
    const leaveRequestsByStatus = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    for (const lr of leaveRequests) {
      const st = lr.status ? lr.status.toLowerCase() : 'pending';
      leaveRequestsByStatus[st] = (leaveRequestsByStatus[st] || 0) + 1;
    }

    // Leave Requests by Type
    const leaveRequestsByType = {};
    for (const lr of leaveRequests) {
      const lt = lr.leaveType ? lr.leaveType.toLowerCase() : 'other';
      leaveRequestsByType[lt] = (leaveRequestsByType[lt] || 0) + 1;
    }

    res.json({
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      pendingLeaveRequests,
      pendingLeaves: pendingLeaveRequests, // backwards-compatibility
      departments: departments.length,
      highAttritionRiskCount,
      mediumAttritionRiskCount,
      lowAttritionRiskCount,
      headcountByDepartment,
      employeesByStatus,
      leaveRequestsByStatus,
      leaveRequestsByType
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
