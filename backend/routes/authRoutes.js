import express from 'express';
import { generateToken } from '../middleware/auth.js';
import { fallbackStore, isMongoActive } from '../config/db.js';
import User from '../models/User.js';

const router = express.Router();

// Get preset demo users for 1-click role switcher
router.get('/demo-users', async (req, res) => {
  try {
    if (isMongoActive()) {
      const users = await User.find().lean();
      return res.json(users);
    }
    return res.json(fallbackStore.users);
  } catch (err) {
    return res.json(fallbackStore.users);
  }
});

// Login endpoint (supports instant login by userId or role)
router.post('/login', async (req, res) => {
  const { userId, role } = req.body;

  let targetUser = null;
  if (isMongoActive()) {
    if (userId) targetUser = await User.findOne({ userId }).lean();
    else if (role) targetUser = await User.findOne({ role }).lean();
  }
  
  if (!targetUser) {
    targetUser = fallbackStore.users.find(u => 
      (userId && u.userId === userId) || (role && u.role === role)
    );
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found.' });
  }

  const token = generateToken(targetUser);
  return res.json({
    token,
    user: targetUser
  });
});

export default router;
