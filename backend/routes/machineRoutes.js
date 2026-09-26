import express from 'express';
import { fallbackStore, isMongoActive } from '../config/db.js';
import Machine from '../models/Machine.js';
import Breakdown from '../models/Breakdown.js';
import JobCard from '../models/JobCard.js';
import { surfaceMachineHistory } from '../services/historyRetriever.js';
import { detectRepeatedFailures } from '../services/repeatedFailureDetector.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all machines
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (isMongoActive()) {
      const machines = await Machine.find().lean();
      return res.json(machines);
    }
    return res.json(fallbackStore.machines);
  } catch (err) {
    return res.json(fallbackStore.machines);
  }
});

// Dual lookup by QR code / Machine ID / Name search
router.get('/lookup/:query', authenticateToken, async (req, res) => {
  const queryStr = (req.params.query || '').trim().toUpperCase();

  let matchedMachine = null;
  if (isMongoActive()) {
    matchedMachine = await Machine.findOne({
      $or: [
        { machineId: queryStr },
        { name: new RegExp(queryStr, 'i') }
      ]
    }).lean();
  }

  if (!matchedMachine) {
    matchedMachine = fallbackStore.machines.find(m => 
      m.machineId.toUpperCase() === queryStr || 
      m.name.toUpperCase().includes(queryStr)
    );
  }

  if (!matchedMachine) {
    return res.status(404).json({ error: 'MACHINE_NOT_FOUND', message: `No machine matching ID/QR '${queryStr}'.` });
  }

  return res.json(matchedMachine);
});

// Detailed machine view with auto-surfaced history & repeated failure check
router.get('/:machineId', authenticateToken, async (req, res) => {
  const { machineId } = req.params;

  let machine = null;
  let breakdownList = fallbackStore.breakdowns;
  let jobCardsList = fallbackStore.jobCards;
  let sparePartsList = fallbackStore.spareParts;

  if (isMongoActive()) {
    machine = await Machine.findOne({ machineId }).lean();
    breakdownList = await Breakdown.find().lean();
    jobCardsList = await JobCard.find().lean();
  } else {
    machine = fallbackStore.machines.find(m => m.machineId === machineId);
  }

  if (!machine) {
    return res.status(404).json({ error: 'MACHINE_NOT_FOUND', message: `Machine '${machineId}' not found.` });
  }

  // Auto surface machine history
  const historyIntelligence = surfaceMachineHistory(machineId, breakdownList, jobCardsList, sparePartsList);
  
  // Auto detect repeated failures (3+ in 90 days)
  const repeatedFailureAnalysis = detectRepeatedFailures(machineId, breakdownList, 90, 3);

  return res.json({
    machine,
    historyIntelligence,
    repeatedFailureAnalysis
  });
});

export default router;
