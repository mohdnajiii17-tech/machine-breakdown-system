import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Cpu, UserCheck, Clock, Activity, AlertOctagon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, switchRole, DEFAULT_DEMO_USERS, breakdowns } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeLocksCount = breakdowns.filter(b => b.status === 'LOCKED' || b.status === 'IN_PROGRESS').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      {/* Top Telemetry & Role Switcher Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Smart LOTO Coordination System
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            {time.toLocaleTimeString()}
          </span>
        </div>

        {/* 1-Click Role Switcher Dropdown & Badges */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Demo Switcher:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
            {DEFAULT_DEMO_USERS.map(user => {
              const isActive = currentUser.userId === user.userId;
              return (
                <button
                  key={user.userId}
                  onClick={() => switchRole(user)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {user.role}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Navbar Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg text-slate-950">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-2">
              Industrial Breakdown & Maintenance Lock
            </span>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Active User: <strong className="text-cyan-400">{currentUser.name}</strong></span>
              <span className="text-slate-600" aria-hidden="true">•</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                {currentUser.role}
              </span>
            </p>
          </div>
        </div>

        {/* Status Indicators & Main Navigation Tabs */}
        <div className="flex items-center gap-4">
          {activeLocksCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold animate-pulse">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>{activeLocksCount} Machine(s) Locked</span>
            </div>
          )}

          {/* Navigation Tab Links */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('WORKFLOW')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'WORKFLOW'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Main Dashboard
            </button>
            <button
              onClick={() => setActiveTab('HEALTH')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'HEALTH'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Machine Health
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'AUDIT'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit Trail
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
