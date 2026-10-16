const express = require('express');
const { Department, Employee, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

async function enrichDepartment(deptDoc) {
  const dept = deptDoc.toObject ? deptDoc.toObject() : deptDoc;
  let head = null;
  if (dept.departmentHeadId) {
    head = await Employee.findOne({ employeeId: dept.departmentHeadId }).lean();
  }
  return {
    ...dept,
    departmentHead: head || null
  };
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const departments = await Department.find();
    const enriched = await Promise.all(departments.map(d => enrichDepartment(d)));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const { departmentName, departmentHeadId, departmentHead } = req.body;
    const departmentId = await getNextSequence('departmentId');
    const headId = departmentHeadId !== undefined ? departmentHeadId : (departmentHead ? departmentHead.employeeId : null);
    
    const newDept = new Department({
      departmentId,
      departmentName,
      departmentHeadId: headId !== null && headId !== undefined && headId !== '' ? parseInt(headId) : null
    });
    
    await newDept.save();
    const enriched = await enrichDepartment(newDept);
    res.status(201).json(enriched);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    const dept = await Department.findOne({ departmentId });
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const { departmentName, departmentHeadId, departmentHead } = req.body;
    if (departmentName !== undefined) dept.departmentName = departmentName;
    const headId = departmentHeadId !== undefined ? departmentHeadId : (departmentHead ? departmentHead.employeeId : undefined);
    if (headId !== undefined) {
      dept.departmentHeadId = headId !== null && headId !== '' ? parseInt(headId) : null;
    }

    await dept.save();
    const enriched = await enrichDepartment(dept);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    const dept = await Department.findOneAndDelete({ departmentId });
    if (!dept) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await Employee.updateMany({ departmentId }, { $set: { departmentId: null } });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
