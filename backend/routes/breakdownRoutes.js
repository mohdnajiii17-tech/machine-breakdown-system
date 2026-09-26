import express from 'express';
import { fallbackStore, isMongoActive } from '../config/db.js';
import Breakdown from '../models/Breakdown.js';
import Machine from '../models/Machine.js';
import AuditLog from '../models/AuditLog.js';
import { calculatePriority } from '../services/priorityCalculator.js';
import { detectRepeatedFailures } from '../services/repeatedFailureDetector.js';
import { recommendTechnicians } from '../services/technicianRecommender.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all breakdown tickets
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (isMongoActive()) {
      const tickets = await Breakdown.find().sort({ createdAt: -1 }).lean();
      return res.json(tickets);
    }
    return res.json(fallbackStore.breakdowns);
  } catch (err) {
    return res.json(fallbackStore.breakdowns);
  }
});

// Minimal-input Symptom Breakdown Reporting (Operator)
router.post('/', authenticateToken, requireRole(['OPERATOR', 'SUPERVISOR', 'ADMIN']), async (req, res) => {
  const { machineId, reportedSymptom, notes, photoUrl } = req.body;

  if (!machineId || !reportedSymptom) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Machine ID and Reported Symptom are required.' });
  }

  // 1. Fetch target machine
  let machine = null;
  let breakdownList = fallbackStore.breakdowns;

  if (isMongoActive()) {
    machine = await Machine.findOne({ machineId });
    breakdownList = await Breakdown.find().lean();
  } else {
    machine = fallbackStore.machines.find(m => m.machineId === machineId);
  }

  if (!machine) {
    return res.status(404).json({ error: 'MACHINE_NOT_FOUND', message: `Machine '${machineId}' not found.` });
  }

  // 2. Check repeated failures in past 90 days
  const repeatedAnalysis = detectRepeatedFailures(machineId, breakdownList, 90, 3);

  // 3. Calculate Modular Priority
  const priorityResult = calculatePriority({
    machineCriticality: machine.criticality,
    symptom: reportedSymptom,
    past90DaysFailuresCount: repeatedAnalysis.incidentCount
  });

  // 4. Generate unique IDs
  const breakdownId = `BKD-${Date.now().toString().slice(-6)}`;
  const lockId = `LOTO-KEY-${Date.now().toString().slice(-6)}`;

  const symptomLabelMap = {
    NOISE: 'Unusual Noise / Bearing Grinding',
    VIBRATION: 'Excessive Shaft Vibration',
    OVERHEATING: 'Overheating / Thermal Warning',
    LEAKAGE: 'Hydraulic / Fluid Leakage',
    STOPPED: 'Machine Completely Stopped',
    ELECTRICAL: 'Electrical / Circuit Fault',
    OTHER: 'General Mechanical Issue'
  };

  const newBreakdown = {
    breakdownId,
    machineId,
    reportedBy: req.user.userId,
    reportedSymptom,
    symptomLabel: symptomLabelMap[reportedSymptom] || reportedSymptom,
    notes: notes || '',
    photoUrl: photoUrl || '',
    calculatedPriorityScore: priorityResult.priorityScore,
    priorityTier: priorityResult.priorityTier,
    priorityFactors: priorityResult.breakdownFactors,
    status: 'LOCKED',
    repeatedFailureFlag: repeatedAnalysis.isRepeatedFailure,
    repeatedFailureDetails: repeatedAnalysis,
    createdAt: new Date()
  };

  // 5. Automatic Software Maintenance Lock Transition
  const oldMachineStatus = machine.status;
  machine.status = 'MAINTENANCE_LOCKED';
  machine.digitalLockActive = true;
  machine.activeLockId = lockId;
  machine.activeLockTimestamp = new Date();
  machine.totalBreakdownsCount = (machine.totalBreakdownsCount || 0) + 1;

  // Audit log record
  const auditEntry = {
    logId: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date(),
    actorUserId: req.user.userId,
    actorName: req.user.name || 'Operator',
    actorRole: req.user.role,
    actionType: 'SOFTWARE_LOCK_ENGAGED',
    machineId,
    breakdownId,
    previousState: oldMachineStatus,
    newState: 'MAINTENANCE_LOCKED',
    details: `Digital maintenance software lock engaged following symptom report '${newBreakdown.symptomLabel}'. Priority: ${priorityResult.priorityTier} (${priorityResult.priorityScore}).`
  };

  if (isMongoActive()) {
    await Breakdown.create(newBreakdown);
    await machine.save();
    await AuditLog.create(auditEntry);
  } else {
    fallbackStore.breakdowns.unshift(newBreakdown);
    fallbackStore.auditLogs.unshift(auditEntry);
  }

  return res.status(201).json({
    message: 'Breakdown reported successfully. Software maintenance lock engaged.',
    breakdown: newBreakdown,
    machineStatus: machine.status,
    digitalLock: {
      lockId,
      active: true,
      timestamp: machine.activeLockTimestamp
    }
  });
});

// Recommend Technicians for a breakdown ticket
router.get('/:breakdownId/recommended-technicians', authenticateToken, async (req, res) => {
  const { breakdownId } = req.params;

  let breakdown = null;
  let machine = null;
  let userList = fallbackStore.users;

  if (isMongoActive()) {
    breakdown = await Breakdown.findOne({ breakdownId }).lean();
    if (breakdown) {
      machine = await Machine.findOne({ machineId: breakdown.machineId }).lean();
    }
  } else {
    breakdown = fallbackStore.breakdowns.find(b => b.breakdownId === breakdownId);
    if (breakdown) {
      machine = fallbackStore.machines.find(m => m.machineId === breakdown.machineId);
    }
  }

  if (!breakdown || !machine) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Breakdown ticket or machine not found.' });
  }

  const categorySkillMap = {
    ELECTRICAL: 'ELECTRICAL',
    NOISE: 'MECHANICAL',
    VIBRATION: 'MECHANICAL',
    OVERHEATING: 'HYDRAULIC',
    LEAKAGE: 'HYDRAULIC',
    STOPPED: 'PLC',
    OTHER: 'MECHANICAL'
  };

  const requiredSkill = categorySkillMap[breakdown.reportedSymptom] || 'MECHANICAL';
  const recommendations = recommendTechnicians(userList, machine, requiredSkill);

  return res.json({
    breakdownId,
    machineId: machine.machineId,
    reportedSymptom: breakdown.reportedSymptom,
    requiredSkillCategory: requiredSkill,
    recommendations
  });
});

export default router;
