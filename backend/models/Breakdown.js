import mongoose from 'mongoose';

const breakdownSchema = new mongoose.Schema({
  breakdownId: { type: String, required: true, unique: true },
  machineId: { type: String, required: true, ref: 'Machine' },
  reportedBy: { type: String, required: true, ref: 'User' },
  reportedSymptom: {
    type: String,
    required: true,
    enum: ['NOISE', 'VIBRATION', 'OVERHEATING', 'LEAKAGE', 'STOPPED', 'ELECTRICAL', 'OTHER']
  },
  symptomLabel: { type: String, required: true },
  notes: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  calculatedPriorityScore: { type: Number, required: true },
  priorityTier: {
    type: String,
    required: true,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  },
  priorityFactors: {
    criticalityScore: Number,
    symptomImpactScore: Number,
    historyFrequencyScore: Number
  },
  status: {
    type: String,
    enum: [
      'REPORTED',
      'LOCKED',
      'ASSIGNED',
      'IN_PROGRESS',
      'REPAIRED',
      'PENDING_INSPECTION',
      'RELEASED',
      'CLOSED'
    ],
    default: 'REPORTED'
  },
  assignedTechnicianId: { type: String, default: null, ref: 'User' },
  repeatedFailureFlag: { type: Boolean, default: false },
  repeatedFailureDetails: {
    incidentCount: Number,
    daysWindow: Number,
    recommendation: String
  }
}, { timestamps: true });

export default mongoose.models.Breakdown || mongoose.model('Breakdown', breakdownSchema);
