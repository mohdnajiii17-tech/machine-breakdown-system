import React from 'react';
import { AlertOctagon, ArrowLeft, Home, Cpu, Search } from 'lucide-react';

export default function NotFoundView({ onNavigateHome }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-red-950/80 border border-red-500/40 text-red-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg animate-pulse">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-widest bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
            Error 404 • Resource Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100 mt-3">
            Invalid Telemetry Route or Equipment ID
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            The requested machine identifier, breakdown ticket, or system route does not exist in the active factory database.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-left space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>HTTP Status:</span>
            <strong className="text-red-400">404 NOT_FOUND</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Suggested Action:</span>
            <span className="text-cyan-400">Return to active command dashboard</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigateHome && onNavigateHome('WORKFLOW')}
            className="py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
