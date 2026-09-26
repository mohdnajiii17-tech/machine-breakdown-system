import React from 'react';
import { Lock, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function SoftwareLotoBanner({ lockId, timestamp, isLocked = true }) {
  if (!isLocked) return null;

  return (
    <div className="bg-amber-950/80 border-y border-amber-500/40 px-4 py-2.5 text-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm shadow-lg">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded bg-amber-500/20 text-amber-400 animate-pulse">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold tracking-wide uppercase text-amber-400">Software Maintenance Lock Active</span>
          {lockId && <span className="ml-2 font-mono text-xs bg-amber-900/60 px-2 py-0.5 rounded border border-amber-600/40">{lockId}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-amber-300/90 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-amber-200">Safety Notice:</strong> Digital lock manages software workflow state. Physical Lockout/Tagout (LOTO) energy isolation procedures remain separate and mandatory.
        </span>
      </div>
    </div>
  );
}
