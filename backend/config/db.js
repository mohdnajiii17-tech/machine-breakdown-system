import mongoose from 'mongoose';
import { SEED_USERS, SEED_MACHINES, SEED_SPARE_PARTS, SEED_HISTORICAL_BREAKDOWNS } from '../data/seedData.js';

// In-Memory/JSON Isolated Fallback Store (for demo/dev execution when local Mongo is unavailable)
export const fallbackStore = {
  users: [...SEED_USERS],
  machines: [...SEED_MACHINES],
  breakdowns: [...SEED_HISTORICAL_BREAKDOWNS],
  jobCards: [],
  spareParts: [...SEED_SPARE_PARTS],
  auditLogs: []
};

let isConnectedToMongo = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/machine_breakdown_db';
  
  try {
    // Attempt Mongoose connection with a fast 500ms timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 500
    });
    isConnectedToMongo = true;
    console.log(`[Database] Connected successfully to MongoDB: ${mongoUri}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[Database] MongoDB connection not available (${err.message}).`);
    console.log(`[Database] Operating in isolated demo/development fallback store mode.`);
  }
}

export function isMongoActive() {
  return isConnectedToMongo;
}
