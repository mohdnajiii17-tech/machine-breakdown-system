import express from 'express';
import { fallbackStore, isMongoActive } from '../config/db.js';
import SparePart from '../models/SparePart.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all spare parts
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (isMongoActive()) {
      const parts = await SparePart.find().lean();
      return res.json(parts);
    }
    return res.json(fallbackStore.spareParts);
  } catch (err) {
    return res.json(fallbackStore.spareParts);
  }
});

export default router;
