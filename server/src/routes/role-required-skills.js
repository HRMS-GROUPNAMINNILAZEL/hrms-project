const express = require('express');
const { RoleRequiredSkill, Skill, Department, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

async function populateRoleSkill(rs) {
  const obj = rs.toObject ? rs.toObject() : rs;
  const skill = await Skill.findOne({ skillId: rs.skillId });
  const dept = rs.departmentId ? await Department.findOne({ departmentId: rs.departmentId }) : null;
  return {
    ...obj,
    skill: skill ? {
      skillId: skill.skillId,
      skillName: skill.skillName,
      category: skill.category
    } : null,
    department: dept ? {
      departmentId: dept.departmentId,
      departmentName: dept.departmentName
    } : null,
    skillName: skill ? skill.skillName : `Skill #${rs.skillId}`,
    departmentName: dept ? dept.departmentName : 'All Departments'
  };
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const roleSkills = await RoleRequiredSkill.find().sort({ id: 1 });
    const populated = await Promise.all(roleSkills.map(populateRoleSkill));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const position = req.body.position;
    const rawDeptId = req.body.departmentId !== undefined && req.body.departmentId !== ''
      ? req.body.departmentId
      : req.body.department?.departmentId;
    const rawSkillId = req.body.skillId !== undefined && req.body.skillId !== ''
      ? req.body.skillId
      : req.body.skill?.skillId;
    const requiredLevel = req.body.requiredLevel || 'intermediate';

    if (!position || !rawSkillId) {
      return res.status(400).json({ message: 'position and skillId are required' });
    }

    const id = await getNextSequence('roleRequiredSkillId');
    const newRs = new RoleRequiredSkill({
      id,
      position: position.trim(),
      departmentId: rawDeptId ? parseInt(rawDeptId) : null,
      skillId: parseInt(rawSkillId),
      requiredLevel
    });

    await newRs.save();
    const populated = await populateRoleSkill(newRs);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating role required skill:', err);
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { position, requiredLevel } = req.body;
    const rawDeptId = req.body.departmentId !== undefined
      ? req.body.departmentId
      : req.body.department?.departmentId;
    const rawSkillId = req.body.skillId !== undefined
      ? req.body.skillId
      : req.body.skill?.skillId;

    const rs = await RoleRequiredSkill.findOne({ id });
    if (!rs) return res.status(404).json({ message: 'Role required skill not found' });

    if (position !== undefined) rs.position = position.trim();
    if (rawDeptId !== undefined) rs.departmentId = rawDeptId ? parseInt(rawDeptId) : null;
    if (rawSkillId !== undefined) rs.skillId = parseInt(rawSkillId);
    if (requiredLevel !== undefined) rs.requiredLevel = requiredLevel;

    await rs.save();
    const populated = await populateRoleSkill(rs);
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await RoleRequiredSkill.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ message: 'Role required skill not found' });
    res.json({ message: 'Role required skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
