import mongoose from 'mongoose';

const jobCardSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  breakdownId: { type: String, required: true, ref: 'Breakdown' },
  machineId: { type: String, required: true, ref: 'Machine' },
  assignedTechnicianId: { type: String, required: true, ref: 'User' },
  assignedBySupervisorId: { type: String, required: true, ref: 'User' },
  
  // Job Stage Progression: START -> FINDING -> ACTION -> PARTS_USED -> COMPLETE
  jobStage: {
    type: String,
    enum: ['START', 'FINDING', 'ACTION', 'PARTS_USED', 'COMPLETED'],
    default: 'START'
  },

  // Auto-surfaced Intelligence
  surfacedHistory: {
    totalIncidentsCount: Number,
    mostFrequentSymptom: String,
    averageRepairTimeMinutes: Number
  },
  
  // Pre-filled suggested safety & repair checklist
  checklist: [{
    checkId: String,
    label: String,
    passed: { type: Boolean, default: false }
  }],

  // Work Log entries recorded by technician
  findingsText: { type: String, default: '' },
  actionTakenText: { type: String, default: '' },
  
  // Parts used log
  partsUsed: [{
    partId: String,
    partName: String,
    quantity: Number
  }],

  // Part unavailable delay flag
  partUnavailableFlag: { type: Boolean, default: false },
  partUnavailableNotes: { type: String, default: '' },

  // Pre-restart safety inspection by supervisor
  supervisorInspection: {
    conductedBy: String,
    passed: { type: Boolean, default: false },
    inspectionDate: Date,
    notes: String,
    checklistResults: [{
      item: String,
      verified: Boolean
    }]
  },

  startTime: { type: Date, default: null },
  completionTime: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.JobCard || mongoose.model('JobCard', jobCardSchema);
