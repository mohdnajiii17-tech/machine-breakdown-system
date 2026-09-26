import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import machineRoutes from './routes/machineRoutes.js';
import breakdownRoutes from './routes/breakdownRoutes.js';
import jobCardRoutes from './routes/jobCardRoutes.js';
import sparePartRoutes from './routes/sparePartRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database connection (with automatic fallback)
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/breakdowns', breakdownRoutes);
app.use('/api/job-cards', jobCardRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/audit', auditRoutes);

// System Health Status API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Smart Machine Breakdown & Maintenance Coordination API',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[Server] Maintenance Coordination API active on port ${PORT}`);
  console.log(`=======================================================`);
});
