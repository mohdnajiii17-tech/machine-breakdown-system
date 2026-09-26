/**
 * Rule-Based Repeated Failure Detector
 * Flags machines experiencing 3 or more breakdown incidents within a 90-day window.
 */

export function detectRepeatedFailures(machineId, breakdownHistoryList = [], daysWindow = 90, thresholdCount = 3) {
  if (!machineId || !Array.isArray(breakdownHistoryList)) {
    return { isRepeatedFailure: false, incidentCount: 0, recentIncidents: [] };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysWindow);

  // Filter history for this machine within 90 days
  const recentMachineIncidents = breakdownHistoryList.filter(item => {
    if (item.machineId !== machineId) return false;
    const itemDate = new Date(item.timestamp || item.createdAt);
    return itemDate >= cutoffDate;
  });

  const incidentCount = recentMachineIncidents.length;
  const isRepeatedFailure = incidentCount >= thresholdCount;

  return {
    isRepeatedFailure,
    incidentCount,
    thresholdCount,
    daysWindow,
    recommendation: isRepeatedFailure
      ? `REPEATED FAILURE DETECTED: ${incidentCount} incidents logged in past ${daysWindow} days. Mandatory Root Cause Analysis (RCA) & Preventive Overhaul Review recommended.`
      : 'Failure frequency within normal parameters.',
    recentIncidents: recentMachineIncidents
  };
}
