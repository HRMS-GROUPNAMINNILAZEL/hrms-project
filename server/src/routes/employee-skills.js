const express = require('express');
const { Employee, RoleRequiredSkill, EmployeeSkill, Skill, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

async function populateEmployeeSkill(es) {
  const obj = es.toObject ? es.toObject() : es;
  const emp = await Employee.findOne({ employeeId: es.employeeId });
  const skill = await Skill.findOne({ skillId: es.skillId });
  return {
    ...obj,
    employee: emp ? {
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      position: emp.position,
      departmentId: emp.departmentId
    } : null,
    skill: skill ? {
      skillId: skill.skillId,
      skillName: skill.skillName,
      category: skill.category
    } : null,
    employeeName: emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${es.employeeId}`,
    skillName: skill ? skill.skillName : `Skill #${es.skillId}`
  };
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp) return res.json([]);
      filter.employeeId = currentEmp.employeeId;
    } else if (req.query.employeeId) {
      filter.employeeId = parseInt(req.query.employeeId);
    }
    const employeeSkills = await EmployeeSkill.find(filter).lean();
    const populated = await Promise.all(employeeSkills.map(populateEmployeeSkill));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const rawEmployeeId = req.body.employeeId !== undefined && req.body.employeeId !== ''
      ? req.body.employeeId
      : req.body.employee?.employeeId;
    const rawSkillId = req.body.skillId !== undefined && req.body.skillId !== ''
      ? req.body.skillId
      : req.body.skill?.skillId;

    const { proficiencyLevel, acquiredDate } = req.body;

    if (!rawEmployeeId || !rawSkillId) {
      return res.status(400).json({ message: 'employeeId and skillId are required' });
    }

    const employeeId = parseInt(rawEmployeeId);
    const skillId = parseInt(rawSkillId);

    // If an assignment for this employee and skill already exists, update it
    let es = await EmployeeSkill.findOne({ employeeId, skillId });
    if (es) {
      es.proficiencyLevel = proficiencyLevel || es.proficiencyLevel;
      es.acquiredDate = acquiredDate || es.acquiredDate || new Date().toISOString().split('T')[0];
      await es.save();
    } else {
      const employeeSkillId = await getNextSequence('employeeSkillId');
      es = new EmployeeSkill({
        employeeSkillId,
        employeeId,
        skillId,
        proficiencyLevel: proficiencyLevel || 'beginner',
        acquiredDate: acquiredDate || new Date().toISOString().split('T')[0]
      });
      await es.save();
    }

    const populated = await populateEmployeeSkill(es);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating employee skill:', err);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const employeeSkillId = parseInt(req.params.id);
    const deleted = await EmployeeSkill.findOneAndDelete({ employeeSkillId });
    if (!deleted) return res.status(404).json({ message: 'Employee skill assignment not found' });
    res.json({ message: 'Employee skill removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/gap-analysis/:employeeId', authenticateToken, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (req.user.role === 'employee') {
      const currentEmp = await Employee.findOne({ userId: req.user.userId });
      if (!currentEmp || currentEmp.employeeId !== employeeId) {
        return res.status(403).json({ message: 'Access denied: cannot view skill gap analysis of another employee' });
      }
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    let requiredSkills = [];
    if (employee.position) {
      // Find role required skills matching position (case-insensitive)
      requiredSkills = await RoleRequiredSkill.find({
        position: new RegExp(`^${employee.position.trim()}$`, 'i')
      });
      // Fallback: match by partial position or department
      if (requiredSkills.length === 0 && employee.departmentId) {
        requiredSkills = await RoleRequiredSkill.find({
          $or: [
            { position: new RegExp(employee.position.trim(), 'i') },
            { departmentId: employee.departmentId }
          ]
        });
      }
    }

    const currentSkills = await EmployeeSkill.find({ employeeId });
    const currentSkillMap = new Map();
    for (const cs of currentSkills) {
      currentSkillMap.set(cs.skillId, cs.proficiencyLevel);
    }

    const levels = { beginner: 1, intermediate: 2, expert: 3 };

    const analysis = [];
    for (const reqSkill of requiredSkills) {
      const skillDoc = await Skill.findOne({ skillId: reqSkill.skillId });
      const skillName = skillDoc ? skillDoc.skillName : `Skill #${reqSkill.skillId}`;
      const hasSkill = currentSkillMap.has(reqSkill.skillId);
      const currentLevel = hasSkill ? currentSkillMap.get(reqSkill.skillId) : null;

      let status = 'missing';
      if (hasSkill) {
        const curScore = levels[currentLevel] || 1;
        const reqScore = levels[reqSkill.requiredLevel] || 2;
        if (curScore >= reqScore) {
          status = 'met';
        } else {
          status = 'below';
        }
      }

      analysis.push({
        skillId: reqSkill.skillId,
        skill: {
          skillId: reqSkill.skillId,
          skillName,
          category: skillDoc ? skillDoc.category : 'technical'
        },
        skillName,
        requiredLevel: reqSkill.requiredLevel,
        currentLevel: currentLevel || null,
        status
      });
    }

    // Return the array directly as expected by frontend tables
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
