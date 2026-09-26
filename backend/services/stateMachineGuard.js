/**
 * State Machine Guard Middleware & Validation Engine
 * Enforces strict 8-stage state sequence for machine maintenance locks.
 * Prevents invalid state jumps (e.g. going directly from MAINTENANCE_LOCKED to AVAILABLE).
 */

export const MACHINE_STATES = {
  AVAILABLE: 'AVAILABLE',
  BREAKDOWN_REPORTED: 'BREAKDOWN_REPORTED',
  MAINTENANCE_LOCKED: 'MAINTENANCE_LOCKED',
  TECHNICIAN_ASSIGNED: 'TECHNICIAN_ASSIGNED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  REPAIR_COMPLETED: 'REPAIR_COMPLETED',
  INSPECTION_REQUIRED: 'INSPECTION_REQUIRED',
  INSPECTION_APPROVED: 'INSPECTION_APPROVED'
};

// Allowed transitions mapping: currentState -> array of valid next states
export const ALLOWED_TRANSITIONS = {
  [MACHINE_STATES.AVAILABLE]: [MACHINE_STATES.BREAKDOWN_REPORTED, MACHINE_STATES.MAINTENANCE_LOCKED],
  [MACHINE_STATES.BREAKDOWN_REPORTED]: [MACHINE_STATES.MAINTENANCE_LOCKED],
  [MACHINE_STATES.MAINTENANCE_LOCKED]: [MACHINE_STATES.TECHNICIAN_ASSIGNED],
  [MACHINE_STATES.TECHNICIAN_ASSIGNED]: [MACHINE_STATES.UNDER_MAINTENANCE],
  [MACHINE_STATES.UNDER_MAINTENANCE]: [MACHINE_STATES.REPAIR_COMPLETED],
  [MACHINE_STATES.REPAIR_COMPLETED]: [MACHINE_STATES.INSPECTION_REQUIRED],
  [MACHINE_STATES.INSPECTION_REQUIRED]: [MACHINE_STATES.INSPECTION_APPROVED, MACHINE_STATES.UNDER_MAINTENANCE], // Approve or Reject/Re-work
  [MACHINE_STATES.INSPECTION_APPROVED]: [MACHINE_STATES.AVAILABLE]
};

export function isValidStateTransition(currentState, nextState) {
  if (!currentState || !nextState) return false;
  if (currentState === nextState) return true; // Idempotent same-state updates allowed
  
  const allowed = ALLOWED_TRANSITIONS[currentState];
  return Boolean(allowed && allowed.includes(nextState));
}

export function validateStateTransitionMiddleware(req, res, next) {
  const { currentState, nextState } = req.body;
  if (!currentState || !nextState) {
    return next(); // Let specific route handler validate if parameters are missing
  }

  if (!isValidStateTransition(currentState, nextState)) {
    return res.status(400).json({
      error: 'INVALID_STATE_TRANSITION',
      message: `Forbidden machine state transition from '${currentState}' to '${nextState}'. Direct overrides are prohibited for safety compliance.`
    });
  }

  next();
}
