// Priority Calculation Configuration
// Modular, configurable weights and severity scores so rules can be tuned without changing app logic.

export const PRIORITY_CONFIG = {
  // Weights (must sum to 1.0)
  weights: {
    criticality: 0.40,
    safetyImpact: 0.40,
    historicalFrequency: 0.20
  },
  
  // Criticality scores by machine rating
  criticalityScores: {
    HIGH: 100,
    MEDIUM: 60,
    LOW: 30
  },

  // Safety/Symptom impact scores
  symptomImpactScores: {
    STOPPED: 100,         // Machine Completely Stopped / Line Halt
    ELECTRICAL: 90,       // Electrical / Spark / Circuit Hazard
    OVERHEATING: 85,      // Overheating / Thermal Runaway
    LEAKAGE: 75,          // Hydraulic / Fluid Leakage
    VIBRATION: 65,        // Excessive Vibration / Mechanical Strain
    NOISE: 50,            // Unusual Noise / Bearing Grinding
    OTHER: 40
  },

  // Priority Thresholds for Final Score (0 - 100)
  thresholds: {
    CRITICAL: 80, // Score >= 80 -> CRITICAL
    HIGH: 60,     // Score >= 60 -> HIGH
    MEDIUM: 40,   // Score >= 40 -> MEDIUM
    LOW: 0        // Score < 40  -> LOW
  }
};
