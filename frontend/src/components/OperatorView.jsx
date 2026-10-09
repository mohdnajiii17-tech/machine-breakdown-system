import React, { useState } from 'react';
import DualMachineLookup from './DualMachineLookup';
import SymptomPicker from './SymptomPicker';
import SoftwareLotoBanner from './SoftwareLotoBanner';
import MachineStatusBadge from './MachineStatusBadge';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api/client';
import { AlertOctagon, CheckCircle2, ShieldAlert, Cpu, ArrowRight, RefreshCw, FileText } from 'lucide-react';

export default function OperatorView() {
  const { machines, breakdowns, refreshData } = useAuth();
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [symptom, setSymptom] = useState('STOPPED');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTriggerConfirmModal = (e) => {
    e.preventDefault();
    if (!selectedMachine) return;
    setShowConfirmModal(true);
  };

  const handleReportBreakdown = async () => {
    if (!selectedMachine) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setShowConfirmModal(false);

    try {
      const res = await fetchApi('/breakdowns', {
        method: 'POST',
        body: JSON.stringify({
          machineId: selectedMachine.machineId,
          reportedSymptom: symptom,
          notes
        })
      });

      setSuccessResult(res);
      await refreshData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to report breakdown.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSuccessResult(null);
    setSelectedMachine(null);
    setNotes('');
    setSymptom('STOPPED');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
            Machine Operator Workspace
          </span>
          <h1 className="text-lg font-bold text-slate-100 mt-0.5">
            Quick Symptom Breakdown Reporting & Digital Lock Activation
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Report machine symptoms in 1 tap. Submitting immediately engages the digital maintenance lock and calculates rule-based priority.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 focus:ring-2 focus:ring-cyan-500"
          aria-label="Refresh Machine Telemetry Data"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </button>
      </header>

      {/* Step 1: Machine Selection (Dual Lookup) */}
      {!successResult && (
        <>
          <DualMachineLookup
            machines={machines}
            onSelectMachine={(m) => setSelectedMachine(m)}
          />

          {/* Selected Machine Card & Symptom Form */}
          {selectedMachine && (
            <form onSubmit={handleTriggerConfirmModal} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800/50">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedMachine.machineId}</span>
                    <h2 className="font-bold text-base text-slate-100">{selectedMachine.name}</h2>
                    <p className="text-xs text-slate-400">{selectedMachine.lineLocation} • Criticality: <strong className="text-amber-400">{selectedMachine.criticality}</strong></p>
                  </div>
                </div>

                <div className="text-right">
                  <MachineStatusBadge status={selectedMachine.status} />
                </div>
              </div>

              {/* Software Lock Disclaimer Banner */}
              <SoftwareLotoBanner isLocked={selectedMachine.status !== 'AVAILABLE'} lockId={selectedMachine.activeLockId} />

              {/* Step 2: 1-Tap Symptom Selection */}
              <SymptomPicker selectedSymptom={symptom} onSelectSymptom={setSymptom} />

              {/* Optional Operator Notes */}
              <div>
                <label htmlFor="operator-notes" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Optional Observations / Notes
                </label>
                <textarea
                  id="operator-notes"
                  rows="2"
                  placeholder="E.g. Heavy grinding noise from spindle gear, line halted at 14:20..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-500/40 rounded-lg text-xs text-red-300" role="alert">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedMachine(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel Selection
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedMachine.status !== 'AVAILABLE'}
                  className={`py-3 px-6 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${
                    selectedMachine.status === 'AVAILABLE'
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-slate-950 shadow-red-950/50 focus:ring-2 focus:ring-red-500'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {isSubmitting ? 'Engaging Software Lock...' : 'Report Breakdown & Engage Software Lock'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Safety Confirmation Modal Before Submitting Breakdown */}
      {selectedMachine && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          title="Confirm Breakdown & Lockout"
          message={`Are you sure you want to report a breakdown for '${selectedMachine.name} (${selectedMachine.machineId})'? This action will immediately engage the Digital Maintenance Software Lock and flag the equipment as UNAVAILABLE.`}
          machineId={selectedMachine.machineId}
          actionType="DANGER"
          confirmText="Yes, Engage Software Lock"
          cancelText="Go Back"
          onConfirm={handleReportBreakdown}
          onCancel={() => setShowConfirmModal(false)}
          isProcessing={isSubmitting}
        />
      )}

      {/* Success Modal / Card after reporting breakdown */}
      {successResult && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-6 shadow-2xl space-y-6 text-slate-200 animate-fadeIn">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Breakdown Ticket Generated</span>
              <h2 className="text-xl font-extrabold text-slate-100">{successResult.breakdown?.breakdownId}</h2>
              <p className="text-xs text-slate-400">Software Maintenance Lock successfully engaged for <strong className="text-cyan-400">{successResult.breakdown?.machineId}</strong>.</p>
            </div>
          </div>

          <SoftwareLotoBanner isLocked={true} lockId={successResult.digitalLock?.lockId} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Calculated Priority:</span>
              <span className="font-bold text-red-400 text-sm">{successResult.breakdown?.priorityTier} ({successResult.breakdown?.calculatedPriorityScore}/100)</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Machine State:</span>
              <span className="font-bold text-amber-400 text-sm">{successResult.machineStatus}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Digital Lock Key:</span>
              <span className="font-bold text-cyan-400 text-sm">{successResult.digitalLock?.lockId}</span>
            </div>
          </div>

          <button
            onClick={handleResetForm}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 transition-all focus:ring-2 focus:ring-cyan-500"
          >
            Report Another Breakdown
          </button>
        </div>
      )}
    </div>
  );
}
