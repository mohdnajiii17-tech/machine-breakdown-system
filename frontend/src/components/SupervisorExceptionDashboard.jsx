import React, { useState } from 'react';
import SoftwareLotoBanner from './SoftwareLotoBanner';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api/client';
import { 
  ShieldAlert, AlertOctagon, UserCheck, CheckCircle2, ShieldCheck, 
  Sparkles, Wrench, AlertTriangle, ArrowRight, XCircle, Key, FileCheck 
} from 'lucide-react';

export default function SupervisorExceptionDashboard() {
  const { breakdowns, machines, jobCards, spareParts, refreshData } = useAuth();
  const [selectedBreakdownForAssign, setSelectedBreakdownForAssign] = useState(null);
  const [recommendedTechs, setRecommendedTechs] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Safety Inspection Modal state
  const [inspectionJobCard, setInspectionJobCard] = useState(null);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [supervisorPin, setSupervisorPin] = useState('');
  const [inspectionChecklist, setInspectionChecklist] = useState([
    { id: 'I-01', item: 'Verify all physical safety guards & electrical covers are reinstalled', verified: true },
    { id: 'I-02', item: 'Ensure all maintenance tools, meters & loose hardware are removed from area', verified: true },
    { id: 'I-03', item: 'Confirm zero-energy de-energization state is verified clear', verified: true },
    { id: 'I-04', item: 'Check work area clearance; ensure no personnel are within hazard zone', verified: true },
    { id: 'I-05', item: 'Perform low-speed manual jog / preliminary rotation test run', verified: true }
  ]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Exception Filters:
  // 1. Unassigned Breakdowns requiring technician assignment
  const unassignedBreakdowns = breakdowns.filter(b => b.status === 'LOCKED' || b.status === 'REPORTED');
  
  // 2. Pending Pre-Restart Safety Inspections
  const pendingInspections = jobCards.filter(j => j.jobStage === 'COMPLETED' && (!j.supervisorInspection?.passed));

  // 3. Flagged Missing Part Delays
  const missingPartJobs = jobCards.filter(j => j.partUnavailableFlag);

  // 4. Repeated Failure Machines
  const repeatedFailureTickets = breakdowns.filter(b => b.repeatedFailureFlag);

  // Open Assign Technician Modal & Fetch Recommendations
  const handleOpenAssignModal = async (breakdown) => {
    setSelectedBreakdownForAssign(breakdown);
    setRecommendedTechs([]);
    setStatusMsg('');

    try {
      const res = await fetchApi(`/breakdowns/${breakdown.breakdownId}/recommended-technicians`);
      setRecommendedTechs(res.recommendations || []);
      if (res.recommendations && res.recommendations.length > 0) {
        setSelectedTechId(res.recommendations[0].technicianId);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  // Submit Technician Assignment
  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!selectedBreakdownForAssign || !selectedTechId) return;
    setIsAssigning(true);
    setStatusMsg('');

    try {
      await fetchApi('/job-cards/assign', {
        method: 'POST',
        body: JSON.stringify({
          breakdownId: selectedBreakdownForAssign.breakdownId,
          technicianId: selectedTechId
        })
      });

      setStatusMsg('Technician assigned successfully. Job card created.');
      setSelectedBreakdownForAssign(null);
      await refreshData();
    } catch (err) {
      setStatusMsg(`Assignment Error: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  // Toggle Safety Inspection Checklist Item
  const handleToggleInspectionCheck = (id) => {
    setInspectionChecklist(prev => prev.map(item => item.id === id ? { ...item, verified: !item.verified } : item));
  };

  // Submit Supervisor Pre-Restart Safety Inspection (Approve / Reject)
  const handleSubmitInspection = async (passed) => {
    if (!inspectionJobCard) return;
    setIsInspecting(true);
    setStatusMsg('');

    try {
      const res = await fetchApi(`/job-cards/${inspectionJobCard.jobId}/supervisor-inspection`, {
        method: 'POST',
        body: JSON.stringify({
          passed,
          notes: supervisorNotes,
          checklistResults: inspectionChecklist,
          supervisorPin
        })
      });

      setStatusMsg(res.message);
      setInspectionJobCard(null);
      setSupervisorNotes('');
      setSupervisorPin('');
      await refreshData();
    } catch (err) {
      setStatusMsg(`Inspection Error: ${err.message}`);
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exception Radar Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase font-medium">Unassigned Tickets</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{unassignedBreakdowns.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Require Tech Dispatch</span>
          </div>
          <div className="p-3 bg-amber-950 text-amber-400 rounded-xl border border-amber-800/40">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase font-medium">Pending Release</span>
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">{pendingInspections.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Require Safety Inspection</span>
          </div>
          <div className="p-3 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-red-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase font-medium">Repeated Failures</span>
            <span className="text-2xl font-extrabold text-red-400 font-mono">{repeatedFailureTickets.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">≥3 Incidents in 90 Days</span>
          </div>
          <div className="p-3 bg-red-950 text-red-400 rounded-xl border border-red-800/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-400 block uppercase font-medium">Missing Parts Delays</span>
            <span className="text-2xl font-extrabold text-purple-400 font-mono">{missingPartJobs.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Flagged by Technicians</span>
          </div>
          <div className="p-3 bg-purple-950 text-purple-400 rounded-xl border border-purple-800/40">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 rounded-lg">
          {statusMsg}
        </div>
      )}

      {/* Exception Section 1: Pending Pre-Restart Safety Inspections */}
      {pendingInspections.length > 0 && (
        <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Pending Pre-Restart Safety Inspections & Software Lock Release
            </h3>
            <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded border border-cyan-800/50 font-bold">
              {pendingInspections.length} ACTION REQUIRED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInspections.map(job => {
              const machine = machines.find(m => m.machineId === job.machineId);

              return (
                <div key={job.jobId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-cyan-400 font-bold">{job.machineId}</span>
                      <h4 className="font-bold text-sm text-slate-100">{machine?.name}</h4>
                      <p className="text-xs text-slate-400">Assigned Tech: {job.assignedTechnicianId}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-950 text-amber-300 rounded text-xs font-mono font-bold border border-amber-500/30">
                      REPAIR COMPLETED
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded text-xs text-slate-300 border border-slate-850">
                    <strong>Tech Finding:</strong> {job.findingsText || 'Checklist passed.'}
                  </div>

                  <button
                    onClick={() => setInspectionJobCard(job)}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <FileCheck className="w-4 h-4" />
                    Perform 5-Point Pre-Restart Safety Inspection
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exception Section 2: Unassigned Breakdown Tickets (Rule-Based Technician Recommendation) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-400" />
            Unassigned Breakdown Tickets (Rule-Based Dispatch)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {unassignedBreakdowns.length} Ticket(s) Pending Assignment
          </span>
        </div>

        {unassignedBreakdowns.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No unassigned breakdown tickets currently active.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedBreakdowns.map(ticket => {
              const machine = machines.find(m => m.machineId === ticket.machineId);

              return (
                <div key={ticket.breakdownId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{ticket.breakdownId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase ${
                        ticket.priorityTier === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                      }`}>
                        {ticket.priorityTier} ({ticket.calculatedPriorityScore})
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{machine?.name || ticket.machineId}</h4>
                    <p className="text-xs text-amber-300 mt-1 font-semibold">{ticket.symptomLabel}</p>

                    {ticket.repeatedFailureFlag && (
                      <div className="mt-2 text-[10px] bg-red-950/60 border border-red-500/30 text-red-300 p-1.5 rounded flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                        <span>REPEATED FAILURE DETECTED ({ticket.repeatedFailureDetails?.incidentCount} in 90 days)</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenAssignModal(ticket)}
                    className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Review Auto-Tech Recommendation & Assign
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Technician Assignment Modal with Rule-Based Recommendations */}
      {selectedBreakdownForAssign && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">DISPATCH ASSIGNMENT</span>
                <h3 className="font-bold text-base text-slate-100">
                  Assign Technician to {selectedBreakdownForAssign.machineId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBreakdownForAssign(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Rule-Based Technician Recommendation List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Rule-Based Technician Recommendations:
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recommendedTechs.map((tech, idx) => {
                  const isSelected = selectedTechId === tech.technicianId;

                  return (
                    <div
                      key={tech.technicianId}
                      onClick={() => setSelectedTechId(tech.technicianId)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-100 ring-2 ring-cyan-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-100">{tech.name}</strong>
                          {idx === 0 && (
                            <span className="text-[10px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-bold uppercase">
                              Best Match
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-cyan-400">{tech.matchScore} pts</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {tech.recommendationReasons?.map((r, rIdx) => (
                          <span key={rIdx} className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleConfirmAssignment} className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBreakdownForAssign(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAssigning || !selectedTechId}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                {isAssigning ? 'Confirming...' : 'Confirm Dispatch Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5-Point Pre-Restart Safety Inspection Modal */}
      {inspectionJobCard && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">SAFETY CLEARANCE & UNLOCK</span>
                <h3 className="font-bold text-base text-slate-100">
                  5-Point Pre-Restart Inspection: {inspectionJobCard.machineId}
                </h3>
              </div>
              <button
                onClick={() => setInspectionJobCard(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <SoftwareLotoBanner isLocked={true} lockId={inspectionJobCard.activeLockId || 'LOTO-KEY-ACTIVE'} />

            {/* 5-Point Inspection Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                Pre-Restart EHS Safety Verification Checklist:
              </span>

              {inspectionChecklist.map(item => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    item.verified
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.verified}
                    onChange={() => handleToggleInspectionCheck(item.id)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>{item.item}</span>
                </label>
              ))}
            </div>

            {/* Supervisor PIN & Notes */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Supervisor Inspection Notes:
                </label>
                <input
                  type="text"
                  placeholder="Guards verified, tools cleared, zero-energy test passed..."
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Supervisor Authorization PIN:
                </label>
                <input
                  type="password"
                  placeholder="Enter 4-digit EHS PIN (e.g. 1234)..."
                  value={supervisorPin}
                  onChange={(e) => setSupervisorPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono tracking-widest focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Approval / Rejection Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between gap-2">
              <button
                type="button"
                onClick={() => handleSubmitInspection(false)}
                disabled={isInspecting}
                className="px-4 py-2.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
              >
                Reject & Send for Re-work
              </button>

              <button
                type="button"
                onClick={() => handleSubmitInspection(true)}
                disabled={isInspecting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Approve Safety Clearance & Release Software Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
