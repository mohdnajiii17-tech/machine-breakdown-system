import { PRIORITY_CONFIG } from '../config/priorityConfig.js';

/**
 * Modular Priority Calculator Engine
 * Calculates a structured, deterministic priority tier based on machine criticality, symptom safety impact, and historical failure frequency.
 */
export function calculatePriority({ machineCriticality, symptom, past90DaysFailuresCount = 0 }) {
  const { weights, criticalityScores, symptomImpactScores, thresholds } = PRIORITY_CONFIG;

  // 1. Criticality score (0 - 100)
  const cScore = criticalityScores[machineCriticality?.toUpperCase()] || criticalityScores.MEDIUM;

  // 2. Symptom impact score (0 - 100)
  const sScore = symptomImpactScores[symptom?.toUpperCase()] || symptomImpactScores.OTHER;

  // 3. Historical frequency score (0 - 100 based on incident count in last 90 days)
  // 0 failures = 20, 1 failure = 40, 2 failures = 70, >= 3 failures = 100
  let hScore = 20;
  if (past90DaysFailuresCount === 1) hScore = 40;
  else if (past90DaysFailuresCount === 2) hScore = 70;
  else if (past90DaysFailuresCount >= 3) hScore = 100;

  // Weighted total score
  const totalScore = Math.round(
    (cScore * weights.criticality) +
    (sScore * weights.safetyImpact) +
    (hScore * weights.historicalFrequency)
  );

  // Assign tier based on configurable thresholds
  let tier = 'LOW';
  if (totalScore >= thresholds.CRITICAL) tier = 'CRITICAL';
  else if (totalScore >= thresholds.HIGH) tier = 'HIGH';
  else if (totalScore >= thresholds.MEDIUM) tier = 'MEDIUM';

  return {
    priorityScore: totalScore,
    priorityTier: tier,
    breakdownFactors: {
      criticalityScore: cScore,
      symptomImpactScore: sScore,
      historyFrequencyScore: hScore
    }
  };
}
