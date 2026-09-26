import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  machineId: { type: String, required: true, unique: true }, // e.g. CNC-07
  name: { type: String, required: true },                    // e.g. 5-Axis CNC Milling Lathe
  category: { type: String, required: true },                // e.g. CNC, Press, Robotics, Conveyor
  lineLocation: { type: String, required: true },            // e.g. Line 2 - Bay B
  criticality: { 
    type: String, 
    required: true, 
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM' 
  },
  status: {
    type: String,
    required: true,
    enum: [
      'AVAILABLE',
      'BREAKDOWN_REPORTED',
      'MAINTENANCE_LOCKED',
      'TECHNICIAN_ASSIGNED',
      'UNDER_MAINTENANCE',
      'REPAIR_COMPLETED',
      'INSPECTION_REQUIRED',
      'INSPECTION_APPROVED'
    ],
    default: 'AVAILABLE'
  },
  digitalLockActive: { type: Boolean, default: false },
  activeLockId: { type: String, default: null },
  activeLockTimestamp: { type: Date, default: null },
  activeLockTechnicianId: { type: String, default: null },
  lastMaintenanceDate: { type: Date, default: Date.now },
  totalBreakdownsCount: { type: Number, default: 0 },
  healthScore: { type: Number, default: 100 } // 0 - 100
}, { timestamps: true });

export default mongoose.models.Machine || mongoose.model('Machine', machineSchema);
