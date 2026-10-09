import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Search, Filter, Clock, User, FileText } from 'lucide-react';

export default function AuditLogView() {
  const { auditLogs } = useAuth();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = (log.machineId || '').toLowerCase().includes(search.toLowerCase()) ||
                          (log.actorName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (log.details || '').toLowerCase().includes(search.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.actionType === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
            EHS Compliance & Security
          </span>
          <h1 className="text-lg font-bold text-slate-100 mt-0.5">
            Immutable Maintenance Lock Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete chronological record of all software lockout events, state transitions, technician work logs, and supervisor safety clearances.
          </p>
        </div>

        <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-800/50 font-bold">
          {auditLogs.length} Records Logged
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by machine ID, user, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Event Types</option>
            <option value="SOFTWARE_LOCK_ENGAGED">SOFTWARE_LOCK_ENGAGED</option>
            <option value="TECHNICIAN_ASSIGNED">TECHNICIAN_ASSIGNED</option>
            <option value="JOB_STAGE_UPDATED">JOB_STAGE_UPDATED</option>
            <option value="SPARE_PART_USED">SPARE_PART_USED</option>
            <option value="PART_UNAVAILABLE_FLAGGED">PART_UNAVAILABLE_FLAGGED</option>
            <option value="SOFTWARE_LOCK_RELEASED">SOFTWARE_LOCK_RELEASED</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor / User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 italic">
                    No audit log records match your filter query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.logId || idx} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-200">{log.actorName}</span>
                      <span className="text-[10px] text-slate-500 block font-sans">({log.actorRole})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.actionType === 'SOFTWARE_LOCK_ENGAGED'
                          ? 'bg-red-950 text-red-300 border border-red-500/30'
                          : log.actionType === 'SOFTWARE_LOCK_RELEASED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-cyan-300 border border-slate-700'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {log.machineId}
                    </td>
                    <td className="py-3 px-4">
                      {log.previousState && log.newState ? (
                        <span className="text-[11px]">
                          <span className="text-slate-400">{log.previousState}</span>
                          <span className="mx-1 text-cyan-400">→</span>
                          <span className="text-emerald-300 font-bold">{log.newState}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
