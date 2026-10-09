import React, { useState } from 'react';
import TechnicianJobCard from './TechnicianJobCard';
import { useAuth } from '../context/AuthContext';
import { Wrench, CheckCircle2, Clock, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';

export default function TechnicianView() {
  const { currentUser, jobCards, machines, breakdowns, refreshData } = useAuth();
  
  // Filter jobs assigned to active technician (or show all if admin/supervisor testing)
  const assignedJobs = jobCards.filter(j => 
    currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR' || j.assignedTechnicianId === currentUser.userId
  );

  const [selectedJobId, setSelectedJobId] = useState(assignedJobs[0]?.jobId || null);

  const selectedJobCard = jobCards.find(j => j.jobId === selectedJobId) || assignedJobs[0];
  const selectedMachine = selectedJobCard ? machines.find(m => m.machineId === selectedJobCard.machineId) : null;
  const selectedBreakdown = selectedJobCard ? breakdowns.find(b => b.breakdownId === selectedJobCard.breakdownId) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
            Technician Job Portal
          </span>
          <h1 className="text-lg font-bold text-slate-100 mt-0.5">
            Ready-Made Technician Job Cards & Repair Execution
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            View pre-surfaced machine history, spare parts stock, suggested safety checklists, and update repair progress through structured stages.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Work Orders
        </button>
      </div>

      {/* Assigned Work Orders List */}
      {assignedJobs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-200">No Active Work Orders Assigned</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You currently have zero active breakdown assignments. Switch to the <strong>Supervisor</strong> role to confirm technician recommendations and assign job cards.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Work Orders Selection Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {assignedJobs.map(job => {
              const machine = machines.find(m => m.machineId === job.machineId);
              const isSelected = selectedJobCard?.jobId === job.jobId;

              return (
                <button
                  key={job.jobId}
                  onClick={() => setSelectedJobId(job.jobId)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all border text-left shrink-0 ${
                    isSelected
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-md font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{machine?.machineId || job.machineId}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      {job.jobStage}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px] block mt-0.5">
                    {machine?.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Ready-Made Job Card Component */}
          {selectedJobCard && (
            <TechnicianJobCard
              jobCard={selectedJobCard}
              machine={selectedMachine}
              breakdown={selectedBreakdown}
            />
          )}
        </div>
      )}
    </div>
  );
}
