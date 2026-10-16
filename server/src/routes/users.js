const express = require('express');
const bcrypt = require('bcryptjs');
const { User, getNextSequence } = require('../models');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const router = express.Router();

// GET all users (Admin only)
router.get('/', authenticateToken, requireRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET user by id (Admin or self)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access denied: cannot view other user credentials' });
    }
    const user = await User.findOne({ userId }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create user (Admin or HR; HR cannot create Admin)
router.post('/', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const { username, password, passwordHash, email, role, isActive } = req.body;
    if (req.user.role !== 'admin' && role === 'admin') {
      return res.status(403).json({ message: 'HR users cannot create administrator accounts' });
    }
    const pwd = password || passwordHash || 'default123';
    const hash = await bcrypt.hash(pwd, 10);
    const userId = await getNextSequence('userId');

    const newUser = new User({
      userId,
      username,
      passwordHash: hash,
      email,
      role: role || 'employee',
      isActive: isActive !== undefined ? isActive : true
    });

    await newUser.save();
    const result = newUser.toObject();
    delete result.passwordHash;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update user (Admin only)
router.put('/:id', authenticateToken, requireRoles('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, email, role, isActive, password, passwordHash } = req.body;
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    const pwd = password || passwordHash;
    if (pwd && pwd.trim().length > 0) {
      user.passwordHash = await bcrypt.hash(pwd, 10);
    }

    await user.save();
    const result = user.toObject();
    delete result.passwordHash;
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE user (Admin or HR for cleanup; HR cannot delete admins)
router.delete('/:id', authenticateToken, requireRoles('admin', 'hr'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const targetUser = await User.findOne({ userId });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    if (req.user.role !== 'admin' && targetUser.role === 'admin') {
      return res.status(403).json({ message: 'HR users cannot delete administrator accounts' });
    }

    await User.findOneAndDelete({ userId });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
