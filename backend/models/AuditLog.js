import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  actorUserId: { type: String, required: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  actionType: { 
    type: String, 
    required: true,
    enum: [
      'BREAKDOWN_REPORTED',
      'SOFTWARE_LOCK_ENGAGED',
      'TECHNICIAN_RECOMMENDED',
      'TECHNICIAN_ASSIGNED',
      'JOB_CARD_STARTED',
      'JOB_STAGE_UPDATED',
      'SPARE_PART_USED',
      'PART_UNAVAILABLE_FLAGGED',
      'SAFETY_INSPECTION_PASSED',
      'SAFETY_INSPECTION_REJECTED',
      'SOFTWARE_LOCK_RELEASED',
      'MACHINE_RESTORED_AVAILABLE'
    ]
  },
  machineId: { type: String, required: true },
  breakdownId: { type: String },
  previousState: { type: String },
  newState: { type: String },
  details: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
