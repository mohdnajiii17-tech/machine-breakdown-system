import express from 'express';
import { fallbackStore, isMongoActive } from '../config/db.js';
import JobCard from '../models/JobCard.js';
import Breakdown from '../models/Breakdown.js';
import Machine from '../models/Machine.js';
import SparePart from '../models/SparePart.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { surfaceMachineHistory } from '../services/historyRetriever.js';
import { isValidStateTransition, MACHINE_STATES } from '../services/stateMachineGuard.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all job cards
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (isMongoActive()) {
      const cards = await JobCard.find().sort({ createdAt: -1 }).lean();
      return res.json(cards);
    }
    return res.json(fallbackStore.jobCards);
  } catch (err) {
    return res.json(fallbackStore.jobCards);
  }
});

// Assign Technician & Create Ready-Made Job Card (Supervisor)
router.post('/assign', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN']), async (req, res) => {
  const { breakdownId, technicianId } = req.body;

  if (!breakdownId || !technicianId) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Breakdown ID and Technician ID are required.' });
  }

  let breakdown = null;
  let machine = null;
  let breakdownList = fallbackStore.breakdowns;
  let jobCardsList = fallbackStore.jobCards;
  let sparePartsList = fallbackStore.spareParts;

  if (isMongoActive()) {
    breakdown = await Breakdown.findOne({ breakdownId });
    if (breakdown) machine = await Machine.findOne({ machineId: breakdown.machineId });
  } else {
    breakdown = fallbackStore.breakdowns.find(b => b.breakdownId === breakdownId);
    if (breakdown) machine = fallbackStore.machines.find(m => m.machineId === breakdown.machineId);
  }

  if (!breakdown || !machine) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Breakdown or machine not found.' });
  }

  // Validate state transition: MAINTENANCE_LOCKED -> TECHNICIAN_ASSIGNED
  if (!isValidStateTransition(machine.status, MACHINE_STATES.TECHNICIAN_ASSIGNED)) {
    return res.status(400).json({
      error: 'INVALID_STATE_TRANSITION',
      message: `Cannot assign technician while machine is in status '${machine.status}'.`
    });
  }

  // Retrieve auto-surfaced history for ready-made job card
  const history = surfaceMachineHistory(machine.machineId, breakdownList, jobCardsList, sparePartsList);

  const jobId = `JOB-${Date.now().toString().slice(-6)}`;

  // Default suggested checklist items
  const defaultChecklist = [
    { checkId: 'CHK-01', label: 'Inspect physical & electrical safety isolation tags', passed: false },
    { checkId: 'CHK-02', label: 'Perform diagnostic check for reported symptom', passed: false },
    { checkId: 'CHK-03', label: 'Verify spare component compatibility & fitment', passed: false },
    { checkId: 'CHK-04', label: 'Execute repair / part replacement procedure', passed: false },
    { checkId: 'CHK-05', label: 'Conduct manual spindle/drive turn test', passed: false }
  ];

  const newJobCard = {
    jobId,
    breakdownId,
    machineId: machine.machineId,
    assignedTechnicianId: technicianId,
    assignedBySupervisorId: req.user.userId,
    jobStage: 'START',
    surfacedHistory: history,
    checklist: defaultChecklist,
    findingsText: '',
    actionTakenText: '',
    partsUsed: [],
    partUnavailableFlag: false,
    partUnavailableNotes: '',
    supervisorInspection: {
      conductedBy: null,
      passed: false,
      inspectionDate: null,
      notes: '',
      checklistResults: []
    },
    startTime: null,
    completionTime: null,
    createdAt: new Date()
  };

  // Update Machine and Breakdown statuses
  const oldStatus = machine.status;
  machine.status = 'TECHNICIAN_ASSIGNED';
  machine.activeLockTechnicianId = technicianId;
  breakdown.status = 'ASSIGNED';
  breakdown.assignedTechnicianId = technicianId;

  // Increment technician active workload count
  if (!isMongoActive()) {
    const tech = fallbackStore.users.find(u => u.userId === technicianId);
    if (tech) tech.activeWorkloadCount = (tech.activeWorkloadCount || 0) + 1;
  }

  const auditEntry = {
    logId: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date(),
    actorUserId: req.user.userId,
    actorName: req.user.name || 'Supervisor',
    actorRole: req.user.role,
    actionType: 'TECHNICIAN_ASSIGNED',
    machineId: machine.machineId,
    breakdownId,
    previousState: oldStatus,
    newState: 'TECHNICIAN_ASSIGNED',
    details: `Assigned Technician '${technicianId}' to Job Card '${jobId}'.`
  };

  if (isMongoActive()) {
    await JobCard.create(newJobCard);
    await machine.save();
    await breakdown.save();
    await User.updateOne({ userId: technicianId }, { $inc: { activeWorkloadCount: 1 } });
    await AuditLog.create(auditEntry);
  } else {
    fallbackStore.jobCards.unshift(newJobCard);
    fallbackStore.auditLogs.unshift(auditEntry);
  }

  return res.status(201).json({
    message: 'Technician assigned successfully. Job card generated.',
    jobCard: newJobCard,
    machineStatus: machine.status
  });
});

// Progress Job Card Stage (Technician)
// Stages: START -> FINDING -> ACTION -> PARTS_USED -> COMPLETED
router.put('/:jobId/stage', authenticateToken, requireRole(['TECHNICIAN', 'SUPERVISOR', 'ADMIN']), async (req, res) => {
  const { jobId } = req.params;
  const { stage, findingsText, actionTakenText, checklistResults } = req.body;

  let jobCard = null;
  let machine = null;
  let breakdown = null;

  if (isMongoActive()) {
    jobCard = await JobCard.findOne({ jobId });
    if (jobCard) {
      machine = await Machine.findOne({ machineId: jobCard.machineId });
      breakdown = await Breakdown.findOne({ breakdownId: jobCard.breakdownId });
    }
  } else {
    jobCard = fallbackStore.jobCards.find(j => j.jobId === jobId);
    if (jobCard) {
      machine = fallbackStore.machines.find(m => m.machineId === jobCard.machineId);
      breakdown = fallbackStore.breakdowns.find(b => b.breakdownId === jobCard.breakdownId);
    }
  }

  if (!jobCard || !machine) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Job card or machine not found.' });
  }

  const validStages = ['START', 'FINDING', 'ACTION', 'PARTS_USED', 'COMPLETED'];
  if (!validStages.includes(stage)) {
    return res.status(400).json({ error: 'INVALID_STAGE', message: `Invalid stage '${stage}'.` });
  }

  // Update text findings & checklists if provided
  if (findingsText !== undefined) jobCard.findingsText = findingsText;
  if (actionTakenText !== undefined) jobCard.actionTakenText = actionTakenText;
  if (Array.isArray(checklistResults)) {
    jobCard.checklist = checklistResults;
  }

  const oldMachineStatus = machine.status;
  jobCard.jobStage = stage;

  // Handle Machine state transitions based on stage
  if (stage === 'START' || stage === 'FINDING' || stage === 'ACTION' || stage === 'PARTS_USED') {
    if (machine.status === 'TECHNICIAN_ASSIGNED') {
      machine.status = 'UNDER_MAINTENANCE';
      jobCard.startTime = jobCard.startTime || new Date();
      if (breakdown) breakdown.status = 'IN_PROGRESS';
    }
  } else if (stage === 'COMPLETED') {
    machine.status = 'INSPECTION_REQUIRED'; // Ready for Supervisor 5-point inspection
    jobCard.completionTime = new Date();
    if (breakdown) breakdown.status = 'PENDING_INSPECTION';
  }

  const auditEntry = {
    logId: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date(),
    actorUserId: req.user.userId,
    actorName: req.user.name || 'Technician',
    actorRole: req.user.role,
    actionType: stage === 'COMPLETED' ? 'JOB_STAGE_UPDATED' : 'JOB_STAGE_UPDATED',
    machineId: machine.machineId,
    breakdownId: jobCard.breakdownId,
    previousState: oldMachineStatus,
    newState: machine.status,
    details: `Job Card '${jobId}' moved to stage '${stage}'. Machine status set to '${machine.status}'.`
  };

  if (isMongoActive()) {
    await jobCard.save();
    await machine.save();
    if (breakdown) await breakdown.save();
    await AuditLog.create(auditEntry);
  } else {
    fallbackStore.auditLogs.unshift(auditEntry);
  }

  return res.json({
    message: `Job stage updated to '${stage}'.`,
    jobCard,
    machineStatus: machine.status
  });
});

// Log Spare Part Usage on Job Card
router.post('/:jobId/spare-part', authenticateToken, requireRole(['TECHNICIAN', 'SUPERVISOR', 'ADMIN']), async (req, res) => {
  const { jobId } = req.params;
  const { partId, quantity = 1 } = req.body;

  let jobCard = null;
  let part = null;

  if (isMongoActive()) {
    jobCard = await JobCard.findOne({ jobId });
    part = await SparePart.findOne({ partId });
  } else {
    jobCard = fallbackStore.jobCards.find(j => j.jobId === jobId);
    part = fallbackStore.spareParts.find(p => p.partId === partId);
  }

  if (!jobCard || !part) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Job card or spare part not found.' });
  }

  if (part.currentStock < quantity) {
    return res.status(400).json({
      error: 'INSUFFICIENT_STOCK',
      message: `Requested quantity (${quantity}) exceeds current warehouse stock (${part.currentStock}).`
    });
  }

  // Deduct stock
  part.currentStock -= quantity;

  // Add to job card parts used list
  jobCard.partsUsed.push({
    partId: part.partId,
    partName: part.name,
    quantity
  });

  const auditEntry = {
    logId: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date(),
    actorUserId: req.user.userId,
    actorName: req.user.name || 'Technician',
    actorRole: req.user.role,
    actionType: 'SPARE_PART_USED',
    machineId: jobCard.machineId,
    breakdownId: jobCard.breakdownId,
    details: `Deducted ${quantity}x '${part.name}' for Job '${jobId}'. Remaining stock: ${part.currentStock}.`
  };

  if (isMongoActive()) {
    await jobCard.save();
    await part.save();
    await AuditLog.create(auditEntry);
  } else {
    fallbackStore.auditLogs.unshift(auditEntry);
  }

  return res.json({
    message: `Used ${quantity}x ${part.name}. Stock updated.`,
    sparePart: part,
    jobCardPartsUsed: jobCard.partsUsed
  });
});

// Flag Missing/Unavailable Spare Part Delay
router.post('/:jobId/flag-unavailable-part', authenticateToken, requireRole(['TECHNICIAN', 'SUPERVISOR', 'ADMIN']), async (req, res) => {
  const { jobId } = req.params;
  const { notes } = req.body;

  let jobCard = null;
  if (isMongoActive()) {
    jobCard = await JobCard.findOne({ jobId });
  } else {
    jobCard = fallbackStore.jobCards.find(j => j.jobId === jobId);
  }

  if (!jobCard) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Job card not found.' });
  }

  jobCard.partUnavailableFlag = true;
  jobCard.partUnavailableNotes = notes || 'Required spare part out of stock in warehouse.';

  const auditEntry = {
    logId: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date(),
    actorUserId: req.user.userId,
    actorName: req.user.name,
    actorRole: req.user.role,
    actionType: 'PART_UNAVAILABLE_FLAGGED',
    machineId: jobCard.machineId,
    breakdownId: jobCard.breakdownId,
    details: `FLAGGED DELAY: Missing spare part noted on Job Card '${jobId}': ${jobCard.partUnavailableNotes}`
  };

  if (isMongoActive()) {
    await jobCard.save();
    await AuditLog.create(auditEntry);
  } else {
    fallbackStore.auditLogs.unshift(auditEntry);
  }

  return res.json({
    message: 'Part unavailability flagged. Supervisor notified on Exception Dashboard.',
    jobCard
  });
});

// Supervisor 5-Point Pre-Restart Safety Inspection & Software Lock Release Authorization
router.post('/:jobId/supervisor-inspection', authenticateToken, requireRole(['SUPERVISOR', 'ADMIN']), async (req, res) => {
  const { jobId } = req.params;
  const { passed, notes, checklistResults, supervisorPin } = req.body;

  let jobCard = null;
  let machine = null;
  let breakdown = null;

  if (isMongoActive()) {
    jobCard = await JobCard.findOne({ jobId });
    if (jobCard) {
      machine = await Machine.findOne({ machineId: jobCard.machineId });
      breakdown = await Breakdown.findOne({ breakdownId: jobCard.breakdownId });
    }
  } else {
    jobCard = fallbackStore.jobCards.find(j => j.jobId === jobId);
    if (jobCard) {
      machine = fallbackStore.machines.find(m => m.machineId === jobCard.machineId);
      breakdown = fallbackStore.breakdowns.find(b => b.breakdownId === jobCard.breakdownId);
    }
  }

  if (!jobCard || !machine) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Job card or machine not found.' });
  }

  // Update Inspection fields
  jobCard.supervisorInspection = {
    conductedBy: req.user.name || req.user.userId,
    passed: Boolean(passed),
    inspectionDate: new Date(),
    notes: notes || '',
    checklistResults: checklistResults || []
  };

  const oldMachineStatus = machine.status;

  if (passed) {
    // Release Software Maintenance Lock & Restore Machine to AVAILABLE
    machine.status = 'AVAILABLE';
    machine.digitalLockActive = false;
    machine.activeLockId = null;
    machine.activeLockTimestamp = null;
    machine.activeLockTechnicianId = null;
    machine.lastMaintenanceDate = new Date();
    
    if (breakdown) breakdown.status = 'CLOSED';

    // Decrement technician active workload
    if (!isMongoActive()) {
      const tech = fallbackStore.users.find(u => u.userId === jobCard.assignedTechnicianId);
      if (tech && tech.activeWorkloadCount > 0) {
        tech.activeWorkloadCount -= 1;
      }
    } else {
      await User.updateOne(
        { userId: jobCard.assignedTechnicianId, activeWorkloadCount: { $gt: 0 } }, 
        { $inc: { activeWorkloadCount: -1 } }
      );
    }

    const auditEntry = {
      logId: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date(),
      actorUserId: req.user.userId,
      actorName: req.user.name || 'Supervisor',
      actorRole: req.user.role,
      actionType: 'SOFTWARE_LOCK_RELEASED',
      machineId: machine.machineId,
      breakdownId: jobCard.breakdownId,
      previousState: oldMachineStatus,
      newState: 'AVAILABLE',
      details: `5-Point Pre-Restart Safety Inspection PASSED. Software maintenance lock released. Machine '${machine.machineId}' restored to AVAILABLE.`
    };

    if (isMongoActive()) {
      await jobCard.save();
      await machine.save();
      if (breakdown) await breakdown.save();
      await AuditLog.create(auditEntry);
    } else {
      fallbackStore.auditLogs.unshift(auditEntry);
    }

    return res.json({
      message: `Safety Inspection Passed! Software Lock released. Machine '${machine.machineId}' is now OPERATIONAL.`,
      machineStatus: 'AVAILABLE',
      digitalLockActive: false
    });
  } else {
    // Rejection / Re-work required
    machine.status = 'UNDER_MAINTENANCE';
    if (breakdown) breakdown.status = 'IN_PROGRESS';

    const auditEntry = {
      logId: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date(),
      actorUserId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      actionType: 'SAFETY_INSPECTION_REJECTED',
      machineId: machine.machineId,
      breakdownId: jobCard.breakdownId,
      previousState: oldMachineStatus,
      newState: 'UNDER_MAINTENANCE',
      details: `Safety Inspection REJECTED by Supervisor: ${notes}. Returned to UNDER_MAINTENANCE.`
    };

    if (isMongoActive()) {
      await jobCard.save();
      await machine.save();
      if (breakdown) await breakdown.save();
      await AuditLog.create(auditEntry);
    } else {
      fallbackStore.auditLogs.unshift(auditEntry);
    }

    return res.json({
      message: 'Safety Inspection Failed. Sent back for re-work.',
      machineStatus: 'UNDER_MAINTENANCE',
      digitalLockActive: true
    });
  }
});

export default router;
