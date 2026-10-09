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
    environment: process.env.NETLIFY ? 'Netlify Serverless Functions' : 'Node.js Express Server',
    timestamp: new Date()
  });
});

export default app;
