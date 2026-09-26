import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['OPERATOR', 'TECHNICIAN', 'SUPERVISOR', 'ADMIN'] 
  },
  skills: [{ type: String }], // e.g. ['MECHANICAL', 'ELECTRICAL', 'HYDRAULIC', 'PLC']
  isAvailable: { type: Boolean, default: true },
  activeWorkloadCount: { type: Number, default: 0 },
  assignedMachines: [{ type: String }] // Machine IDs
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
