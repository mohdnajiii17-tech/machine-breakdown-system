import React, { useState } from 'react';
import SoftwareLotoBanner from './SoftwareLotoBanner';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../api/client';
import { 
  Wrench, History, PackageCheck, CheckSquare, Play, Search, AlertTriangle, 
  CheckCircle2, Send, Clock, ShieldAlert, AlertOctagon 
} from 'lucide-react';

export default function TechnicianJobCard({ jobCard, machine, breakdown }) {
  const { spareParts, refreshData } = useAuth();
  const [activeStage, setActiveStage] = useState(jobCard?.jobStage || 'START');
  const [findingsText, setFindingsText] = useState(jobCard?.findingsText || '');
  const [actionTakenText, setActionTakenText] = useState(jobCard?.actionTakenText || '');
  const [checklist, setChecklist] = useState(jobCard?.checklist || []);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleToggleChecklist = (checkId) => {
    setChecklist(prev => prev.map(c => c.checkId === checkId ? { ...c, passed: !c.passed } : c));
  };

  const handleUpdateStage = async (newStage) => {
    setIsUpdating(true);
    setStatusMsg('');

    try {
      await fetchApi(`/job-cards/${jobCard.jobId}/stage`, {
        method: 'PUT',
        body: JSON.stringify({
          stage: newStage,
          findingsText,
          actionTakenText,
          checklistResults: checklist
        })
      });

      setActiveStage(newStage);
      setStatusMsg(`Job Card moved to stage '${newStage}'.`);
      await refreshData();
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogSparePart = async (e) => {
    e.preventDefault();
    if (!selectedPartId) return;
    setIsUpdating(true);
    setStatusMsg('');

    try {
      await fetchApi(`/job-cards/${jobCard.jobId}/spare-part`, {
        method: 'POST',
        body: JSON.stringify({
          partId: selectedPartId,
          quantity: Number(partQuantity)
        })
      });

      setStatusMsg('Spare part deducted and logged on Job Card.');
      setSelectedPartId('');
      setPartQuantity(1);
      await refreshData();
    } catch (err) {
      setStatusMsg(`Part Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFlagMissingPart = async () => {
    const reason = prompt('Enter notes for missing spare part delay:');
    if (!reason) return;

    try {
      await fetchApi(`/job-cards/${jobCard.jobId}/flag-unavailable-part`, {
        method: 'POST',
        body: JSON.stringify({ notes: reason })
      });
      setStatusMsg('Missing part flagged. Supervisor alerted on Exception Dashboard.');
      await refreshData();
    } catch (err) {
      setStatusMsg(`Flag Error: ${err.message}`);
    }
  };

  const STAGES = [
    { id: 'START', label: '1. Start Job' },
    { id: 'FINDING', label: '2. Findings' },
    { id: 'ACTION', label: '3. Action' },
    { id: 'PARTS_USED', label: '4. Parts Log' },
    { id: 'COMPLETED', label: '5. Submit Completion' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Job Card Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800/50">
              JOB CARD #{jobCard.jobId}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Breakdown: {jobCard.breakdownId}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-100 mt-1 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            {machine?.name || jobCard.machineId}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Location: {machine?.lineLocation} • Symptom: <strong className="text-amber-300">{breakdown?.symptomLabel || breakdown?.reportedSymptom}</strong>
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-mono">PRIORITY TIER</span>
          <span className={`inline-block px-3 py-1 rounded text-xs font-extrabold font-mono uppercase ${
            breakdown?.priorityTier === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
          }`}>
            {breakdown?.priorityTier || 'HIGH'} ({breakdown?.calculatedPriorityScore}/100)
          </span>
        </div>
      </div>

      {/* Software Maintenance Lock Disclaimer */}
      <SoftwareLotoBanner isLocked={true} lockId={machine?.activeLockId} />

      {/* Structured Job Stage Progress Bar */}
      <div>
        <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
          Structured Repair Progress Steps:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {STAGES.map((s, idx) => {
            const isActive = activeStage === s.id;
            const isPast = STAGES.findIndex(x => x.id === activeStage) > idx;

            return (
              <button
                key={s.id}
                onClick={() => handleUpdateStage(s.id)}
                disabled={isUpdating}
                className={`py-2 px-3 rounded-lg text-xs font-bold text-center border transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold scale-[1.02]'
                    : isPast
                    ? 'bg-slate-800 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 rounded-lg">
          {statusMsg}
        </div>
      )}

      {/* 2-Column Grid: Left (Ready-Made History & Intelligence) | Right (Technician Work Log & Parts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Auto-Surfaced Machine History & Suggested Checklist */}
        <div className="space-y-4">
          
          {/* Auto Surfaced History Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <History className="w-4 h-4 text-cyan-400" />
              Auto-Surfaced Machine History
            </h4>

            {jobCard.surfacedHistory ? (
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Past Incidents:</span>
                  <span className="font-bold text-cyan-300">{jobCard.surfacedHistory.totalIncidentsCount} logged</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Most Common Symptom:</span>
                  <span className="font-bold text-amber-300">{jobCard.surfacedHistory.mostFrequentSymptom}</span>
                </div>
                <div className="col-span-2 bg-slate-900 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Avg Repair Duration (MTTR):</span>
                  <span className="font-bold text-emerald-400">{jobCard.surfacedHistory.averageRepairTimeMinutes} minutes</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No prior incidents recorded for this equipment.</p>
            )}
          </div>

          {/* Suggested Safety & Technical Checklist */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              Suggested Inspection & Safety Checklist
            </h4>

            <div className="space-y-2">
              {checklist.map(item => (
                <label
                  key={item.checkId}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    item.passed
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.passed}
                    onChange={() => handleToggleChecklist(item.checkId)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Technician Findings, Actions, & Spare Parts Stock */}
        <div className="space-y-4">
          
          {/* Findings & Action Taken Form */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Diagnostic Findings & Action Log
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Root Cause Finding:
              </label>
              <input
                type="text"
                placeholder="E.g. Spindle bearing ball worn, thermal sensor failure..."
                value={findingsText}
                onChange={(e) => setFindingsText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Action Taken / Repair Executed:
              </label>
              <textarea
                rows="2"
                placeholder="E.g. Replaced bearing 6205, lubricated housing, calibrated 0-axis..."
                value={actionTakenText}
                onChange={(e) => setActionTakenText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              ></textarea>
            </div>
          </div>

          {/* Spare Parts Stock Checker & Usage Logger */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <PackageCheck className="w-4 h-4 text-cyan-400" />
                Spare Parts Stock & Usage
              </h4>

              <button
                type="button"
                onClick={handleFlagMissingPart}
                className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/30 hover:bg-amber-900/60"
              >
                Flag Missing Part Delay
              </button>
            </div>

            {/* Deduct Spare Part Form */}
            <form onSubmit={handleLogSparePart} className="flex gap-2">
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Spare Part from Stock...</option>
                {spareParts.map(p => (
                  <option key={p.partId} value={p.partId}>
                    {p.name} (Stock: {p.currentStock})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                max="10"
                value={partQuantity}
                onChange={(e) => setPartQuantity(e.target.value)}
                className="w-16 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 text-center"
              />

              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs transition-all"
              >
                Deduct
              </button>
            </form>

            {/* List of Spare Parts Used on this Job */}
            {jobCard.partsUsed && jobCard.partsUsed.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Parts Used on Job Card:</span>
                <div className="space-y-1 font-mono text-xs">
                  {jobCard.partsUsed.map((pu, idx) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded flex justify-between text-slate-300 border border-slate-850">
                      <span>{pu.partName}</span>
                      <strong className="text-cyan-400">{pu.quantity}x</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Completion & Submit for Supervisor Inspection */}
      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Once complete, submit job card for Supervisor 5-point safety inspection & machine unlock.
        </p>

        <button
          onClick={() => handleUpdateStage('COMPLETED')}
          disabled={isUpdating || activeStage === 'COMPLETED'}
          className={`py-3 px-6 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg ${
            activeStage === 'COMPLETED'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {activeStage === 'COMPLETED' ? 'Submitted for Supervisor Inspection' : 'Complete Repair & Request Supervisor Release'}
        </button>
      </div>
    </div>
  );
}
