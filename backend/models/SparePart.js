import mongoose from 'mongoose';

const sparePartSchema = new mongoose.Schema({
  partId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // Bearings, Hydraulic Seals, Electrical Fuses, PLC Modules, Belts
  currentStock: { type: Number, required: true, default: 0 },
  minStockThreshold: { type: Number, default: 2 },
  unitCost: { type: Number, default: 0 },
  compatibleMachineCategories: [{ type: String }],
  binLocation: { type: String, default: 'Warehouse A - Shelf 3' }
}, { timestamps: true });

export default mongoose.models.SparePart || mongoose.model('SparePart', sparePartSchema);
