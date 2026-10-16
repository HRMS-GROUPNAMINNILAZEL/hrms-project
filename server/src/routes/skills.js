const express = require('express');
const { Skill, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ skillId: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const { skillName, category, description } = req.body;
    if (!skillName) return res.status(400).json({ message: 'skillName is required' });

    const skillId = await getNextSequence('skillId');
    const skill = new Skill({
      skillId,
      skillName: skillName.trim(),
      category: category || 'technical',
      description: description || ''
    });

    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const skillId = parseInt(req.params.id);
    const { skillName, category, description } = req.body;

    const skill = await Skill.findOne({ skillId });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    if (skillName !== undefined) skill.skillName = skillName.trim();
    if (category !== undefined) skill.category = category;
    if (description !== undefined) skill.description = description;

    await skill.save();
    res.json(skill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const skillId = parseInt(req.params.id);
    const deleted = await Skill.findOneAndDelete({ skillId });
    if (!deleted) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
