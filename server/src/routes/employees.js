const express = require('express');
const { Employee, User, Department, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
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

async function resolveDepartmentId(departmentId, department) {
  if (departmentId !== undefined && departmentId !== null && departmentId !== '') {
    return parseInt(departmentId);
  }
  if (department !== undefined && department !== null && department !== '') {
    if (typeof department === 'object') {
      if (department.departmentId !== undefined) return parseInt(department.departmentId);
      if (department.id !== undefined) return parseInt(department.id);
      if (department._id !== undefined) return parseInt(department._id);
      if (department.departmentName) {
        const found = await Department.findOne({ departmentName: new RegExp(`^${department.departmentName}$`, 'i') });
        if (found) return found.departmentId;
      }
    } else if (typeof department === 'number') {
      return department;
    } else if (typeof department === 'string') {
      const parsed = parseInt(department);
      if (!isNaN(parsed)) return parsed;
      const found = await Department.findOne({ departmentName: new RegExp(`^${department}$`, 'i') });
      if (found) return found.departmentId;
    }
  }
  return null;
}

async function resolveManagerId(managerId, manager) {
  if (managerId !== undefined && managerId !== null && managerId !== '') {
    return parseInt(managerId);
  }
  if (manager !== undefined && manager !== null && manager !== '') {
    if (typeof manager === 'object') {
      if (manager.employeeId !== undefined) return parseInt(manager.employeeId);
      if (manager.id !== undefined) return parseInt(manager.id);
      if (manager._id !== undefined) return parseInt(manager._id);
    } else {
      const parsed = parseInt(manager);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return null;
}

// Get all employees (Restricted to HR, Admin, Manager)
router.get('/', authenticateToken, requireRoles('admin', 'hr', 'manager'), async (req, res) => {
  try {
    const employees = await Employee.find().lean();
    const enriched = await Promise.all(employees.map(e => enrichEmployee(e)));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user's employee record (Accessible to all authenticated users)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found for current user' });
    }
    const enriched = await enrichEmployee(employee);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update current user's own profile (/me)
// Regular employees can only update their personal contact info, address, and profile photo
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found for current user' });
    }

    const isHrOrAdmin = req.user.role === 'admin' || req.user.role === 'hr';

    const { 
      firstName, lastName, 
      departmentId, department, 
      position, 
      managerId, manager, 
      hireDate, status, contactNumber, address, profilePhoto 
    } = req.body;

    // Contact info updateable by employee
    if (contactNumber !== undefined) employee.contactNumber = contactNumber;
    if (address !== undefined) employee.address = address;
    if (profilePhoto !== undefined) employee.profilePhoto = profilePhoto;

    // Organizational/structural fields can only be changed by Admin/HR
    if (isHrOrAdmin) {
      if (firstName !== undefined) employee.firstName = firstName;
      if (lastName !== undefined) employee.lastName = lastName;
      
      const resolvedDeptId = departmentId !== undefined ? departmentId : (department !== undefined ? (department ? department.departmentId : null) : undefined);
      if (resolvedDeptId !== undefined) employee.departmentId = resolvedDeptId ? parseInt(resolvedDeptId) : null;

      if (position !== undefined) employee.position = position;

      const resolvedMgrId = managerId !== undefined ? managerId : (manager !== undefined ? (manager ? (manager.employeeId || manager.managerId) : null) : undefined);
      if (resolvedMgrId !== undefined) employee.managerId = resolvedMgrId ? parseInt(resolvedMgrId) : null;

      if (hireDate !== undefined) employee.hireDate = hireDate;
      if (status !== undefined) employee.status = status;
    }

    await employee.save();
    const enriched = await enrichEmployee(employee);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found with id: ' + employeeId });
    }

    // Regular employee can only view their own profile
    if (req.user.role === 'employee' && employee.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: cannot view another employee profile' });
    }

    const enriched = await enrichEmployee(employee);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Employee & User (supports both pre-created user/department objects and inline credentials)
router.post('/', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    let { 
      userId, user,
      username, password, email, role, 
      firstName, lastName, 
      departmentId, department, 
      position, 
      managerId, manager, 
      hireDate, status, contactNumber, address, profilePhoto 
    } = req.body;

    let resolvedUserId = userId || (user ? user.userId : null);

    if (!resolvedUserId) {
      if (!email) {
        return res.status(400).json({ message: 'Email or userId is required' });
      }
      resolvedUserId = await getNextSequence('userId');
      const pwd = password || 'password123';
      const passwordHash = await bcrypt.hash(pwd, 10);
      await User.create({
        userId: resolvedUserId,
        username: username || email,
        passwordHash,
        email,
        role: role || 'employee',
        isActive: true
      });
    }

    const employeeId = await getNextSequence('employeeId');

    const resolvedDeptId = departmentId !== undefined ? departmentId : (department ? department.departmentId : null);
    const resolvedMgrId = managerId !== undefined ? managerId : (manager ? (manager.employeeId || manager.managerId) : null);

    const newEmp = await Employee.create({
      employeeId,
      userId: resolvedUserId,
      firstName,
      lastName,
      departmentId: resolvedDeptId ? parseInt(resolvedDeptId) : null,
      position: position || null,
      managerId: resolvedMgrId ? parseInt(resolvedMgrId) : null,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      status: status || 'active',
      contactNumber: contactNumber || null,
      address: address || null,
      profilePhoto: profilePhoto || null
    });

    res.status(201).json(newEmp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Employee
router.put('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { 
      firstName, lastName, 
      departmentId, department, 
      position, 
      managerId, manager, 
      hireDate, status, contactNumber, address, profilePhoto 
    } = req.body;

    if (firstName !== undefined) employee.firstName = firstName;
    if (lastName !== undefined) employee.lastName = lastName;
    
    const resolvedDeptId = departmentId !== undefined ? departmentId : (department !== undefined ? (department ? department.departmentId : null) : undefined);
    if (resolvedDeptId !== undefined) employee.departmentId = resolvedDeptId ? parseInt(resolvedDeptId) : null;

    if (position !== undefined) employee.position = position;

    const resolvedMgrId = managerId !== undefined ? managerId : (manager !== undefined ? (manager ? (manager.employeeId || manager.managerId) : null) : undefined);
    if (resolvedMgrId !== undefined) employee.managerId = resolvedMgrId ? parseInt(resolvedMgrId) : null;

    if (hireDate !== undefined) employee.hireDate = hireDate;
    if (status !== undefined) employee.status = status;
    if (contactNumber !== undefined) employee.contactNumber = contactNumber;
    if (address !== undefined) employee.address = address;
    if (profilePhoto !== undefined) employee.profilePhoto = profilePhoto;

    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Employee
router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const employee = await Employee.findOneAndDelete({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    await User.findOneAndDelete({ userId: employee.userId });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
