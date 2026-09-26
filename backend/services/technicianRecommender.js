/**
 * Rule-Based Technician Recommendation Engine
 * Scores available technicians based on machine expertise match, required skills, current workload, and availability.
 */

export function recommendTechnicians(techniciansList = [], machine = {}, requiredSkillCategory = 'MECHANICAL') {
  if (!Array.isArray(techniciansList) || techniciansList.length === 0) {
    return [];
  }

  // Filter only active/registered technicians
  const eligibleTechs = techniciansList.filter(t => t.role === 'TECHNICIAN');

  const scoredTechs = eligibleTechs.map(tech => {
    let score = 0;
    const reasons = [];

    // 1. Skill Match (+40 points)
    const hasSkillMatch = Array.isArray(tech.skills) && tech.skills.includes(requiredSkillCategory);
    if (hasSkillMatch) {
      score += 40;
      reasons.push(`Specialist in ${requiredSkillCategory}`);
    } else {
      reasons.push(`Generalist (no primary ${requiredSkillCategory} tag)`);
    }

    // 2. Machine Expertise (+30 points)
    const hasMachineExperience = Array.isArray(tech.assignedMachines) && tech.assignedMachines.includes(machine.machineId);
    if (hasMachineExperience) {
      score += 30;
      reasons.push(`Previous repair history on ${machine.machineId}`);
    }

    // 3. Availability (+20 points)
    if (tech.isAvailable) {
      score += 20;
      reasons.push('Currently Available');
    } else {
      reasons.push('Currently Busy/Off-Shift');
    }

    // 4. Workload Penalty (-15 points per active job)
    const activeJobs = tech.activeWorkloadCount || 0;
    const workloadDeduction = activeJobs * 15;
    score = Math.max(0, score - workloadDeduction);
    if (activeJobs === 0) {
      reasons.push('Zero active workload');
    } else {
      reasons.push(`${activeJobs} active job(s) in progress`);
    }

    return {
      technicianId: tech.userId,
      name: tech.name,
      skills: tech.skills || [],
      matchScore: score,
      isAvailable: tech.isAvailable,
      activeWorkloadCount: activeJobs,
      recommendationReasons: reasons
    };
  });

  // Sort descending by match score
  scoredTechs.sort((a, b) => b.matchScore - a.matchScore);

  return scoredTechs;
}
