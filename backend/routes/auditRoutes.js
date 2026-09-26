import express from 'express';
import { fallbackStore, isMongoActive } from '../config/db.js';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get audit logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (isMongoActive()) {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
      return res.json(logs);
    }
    return res.json(fallbackStore.auditLogs);
  } catch (err) {
    return res.json(fallbackStore.auditLogs);
  }
});

export default router;
