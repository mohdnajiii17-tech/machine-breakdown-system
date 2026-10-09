import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, Clock, AlertTriangle, CheckCircle2, TrendingUp, Cpu } from 'lucide-react';

export default function MachineHealthSummary() {
  const { machines, breakdowns, jobCards } = useAuth();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
          Equipment Intelligence
        </span>
        <h1 className="text-lg font-bold text-slate-100 mt-0.5">
          Machine Health Summaries & Reliability Telemetry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated MTTR (Mean Time To Repair), breakdown frequency, repeated-failure alerts, and health scores across factory lines.
        </p>
      </div>

      {/* Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {machines.map(machine => {
          const machineBreakdowns = breakdowns.filter(b => b.machineId === machine.machineId);
          const hasRepeatedFailure = machineBreakdowns.length >= 3;

          return (
            <div
              key={machine.machineId}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{machine.machineId}</span>
                    <h3 className="font-bold text-base text-slate-100">{machine.name}</h3>
                    <p className="text-xs text-slate-400">{machine.lineLocation}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">HEALTH SCORE</span>
                    <span className={`text-lg font-extrabold font-mono ${
                      machine.healthScore >= 80 ? 'text-emerald-400' : machine.healthScore >= 65 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {machine.healthScore}/100
                    </span>
                  </div>
                </div>

                {/* Repeated Failure Alert */}
                {hasRepeatedFailure && (
                  <div className="bg-red-950/80 border border-red-500/40 rounded-lg p-2.5 mb-3 text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span><strong>REPEATED FAILURE DETECTED:</strong> {machineBreakdowns.length} incidents logged in past 90 days.</span>
                  </div>
                )}

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">Total Breakdowns:</span>
                    <strong className="text-slate-200">{machine.totalBreakdownsCount || machineBreakdowns.length} logged</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">Criticality Rating:</span>
                    <strong className="text-amber-400">{machine.criticality}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">Est. MTTR:</span>
                    <strong className="text-emerald-400">45 minutes</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">Current Status:</span>
                    <strong className={machine.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-red-400'}>
                      {machine.status}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
                <span>Last Maintenance:</span>
                <span className="font-mono text-slate-300">
                  {new Date(machine.lastMaintenanceDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
