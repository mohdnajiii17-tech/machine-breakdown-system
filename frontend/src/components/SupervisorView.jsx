import React, { useState } from 'react';
import SupervisorExceptionDashboard from './SupervisorExceptionDashboard';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Cpu, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SupervisorView() {
  const { machines, breakdowns, refreshData } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
            Supervisor & EHS Command Dashboard
          </span>
          <h2 className="text-lg font-bold text-slate-100 mt-0.5">
            Exception-Based Supervision & Pre-Restart Safety Clearance
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Focus attention on critical line stops, rule-based technician recommendation confirmation, missing part delays, and 5-point safety inspections.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Radar
        </button>
      </div>

      {/* Exception Dashboard Component */}
      <SupervisorExceptionDashboard />

      {/* Shop Floor Equipment Matrix Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Shop Floor Equipment Live Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map(machine => {
            const activeBreakdown = breakdowns.find(b => b.machineId === machine.machineId && b.status !== 'CLOSED');

            return (
              <div
                key={machine.machineId}
                className={`p-4 rounded-xl border transition-all ${
                  machine.status === 'AVAILABLE'
                    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                    : 'bg-slate-950 border-red-500/40 text-slate-100 ring-1 ring-red-500/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{machine.machineId}</span>
                    <h4 className="font-bold text-sm text-slate-100">{machine.name}</h4>
                    <p className="text-[11px] text-slate-400">{machine.lineLocation}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase ${
                    machine.status === 'AVAILABLE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                  }`}>
                    {machine.status}
                  </span>
                </div>

                {activeBreakdown && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Symptom:</span>
                      <strong className="text-amber-300">{activeBreakdown.symptomLabel}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Priority:</span>
                      <strong className="text-red-400">{activeBreakdown.priorityTier} ({activeBreakdown.calculatedPriorityScore})</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
