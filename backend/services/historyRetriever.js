/**
 * Automated History Retrieval & Intelligence Surfacing Engine
 * Gathers prior incident logs, replaced spare parts, repair durations, and past symptoms for a target machine.
 */

export function surfaceMachineHistory(machineId, breakdownList = [], jobCardsList = [], sparePartsLogList = []) {
  if (!machineId) return null;

  // Filter breakdown history
  const machineBreakdowns = breakdownList
    .filter(b => b.machineId === machineId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Filter completed job cards
  const completedJobs = jobCardsList.filter(j => j.machineId === machineId && j.jobStage === 'COMPLETED');

  // Compute average repair time in minutes
  let totalRepairMinutes = 0;
  let validDurationsCount = 0;
  completedJobs.forEach(job => {
    if (job.startTime && job.completionTime) {
      const durationMs = new Date(job.completionTime) - new Date(job.startTime);
      const minutes = Math.max(1, Math.round(durationMs / (1000 * 60)));
      totalRepairMinutes += minutes;
      validDurationsCount++;
    }
  });

  const avgMTTRMinutes = validDurationsCount > 0 ? Math.round(totalRepairMinutes / validDurationsCount) : 45; // Default fallback estimate

  // Extract common symptoms
  const symptomCounts = {};
  machineBreakdowns.forEach(b => {
    const sym = b.reportedSymptom || 'UNKNOWN';
    symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
  });

  let topSymptom = 'None';
  let maxCount = 0;
  Object.entries(symptomCounts).forEach(([sym, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topSymptom = sym;
    }
  });

  // Extract recent replaced spare parts for this machine
  const replacedParts = sparePartsLogList.filter(p => p.machineId === machineId);

  return {
    machineId,
    totalIncidentsCount: machineBreakdowns.length,
    recentIncidents: machineBreakdowns.slice(0, 5),
    completedJobsCount: completedJobs.length,
    averageRepairTimeMinutes: avgMTTRMinutes,
    mostFrequentSymptom: topSymptom,
    recentlyReplacedParts: replacedParts.slice(0, 5)
  };
}
