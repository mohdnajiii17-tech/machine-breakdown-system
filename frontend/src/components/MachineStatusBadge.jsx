import React from 'react';
import { CheckCircle2, Lock, Wrench, ShieldAlert, FileCheck, ShieldCheck } from 'lucide-react';

export const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Operational',
    badgeText: 'OPERATIONAL (AVAILABLE)',
    description: 'Safe for production operation.',
    icon: CheckCircle2,
    colorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 glow-emerald',
    dotClass: 'bg-emerald-400 animate-ping'
  },
  BREAKDOWN_REPORTED: {
    label: 'Breakdown Reported',
    badgeText: 'BREAKDOWN REPORTED',
    description: 'Fault reported. Pending digital maintenance lock.',
    icon: ShieldAlert,
    colorClass: 'bg-red-950/90 text-red-300 border-red-500/50 glow-red',
    dotClass: 'bg-red-500 animate-ping'
  },
  MAINTENANCE_LOCKED: {
    label: 'Maintenance Locked',
    badgeText: 'DANGER - SOFTWARE LOCKED',
    description: 'Software maintenance lock active. Operation prohibited.',
    icon: Lock,
    colorClass: 'bg-red-950/90 text-red-300 border-red-500/60 glow-red animate-lock-pulse',
    dotClass: 'bg-red-500 animate-ping'
  },
  TECHNICIAN_ASSIGNED: {
    label: 'Technician Assigned',
    badgeText: 'TECHNICIAN ASSIGNED',
    description: 'Technician dispatched to job card.',
    icon: Wrench,
    colorClass: 'bg-amber-950/90 text-amber-300 border-amber-500/40 glow-amber',
    dotClass: 'bg-amber-400 animate-pulse'
  },
  UNDER_MAINTENANCE: {
    label: 'Under Maintenance',
    badgeText: 'UNDER ACTIVE MAINTENANCE',
    description: 'Active repair in progress by authorized technician.',
    icon: Wrench,
    colorClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40 glow-cyan',
    dotClass: 'bg-cyan-400 animate-spin'
  },
  REPAIR_COMPLETED: {
    label: 'Repair Completed',
    badgeText: 'REPAIR COMPLETED',
    description: 'Repair completed. Pending pre-restart safety inspection.',
    icon: FileCheck,
    colorClass: 'bg-purple-950/90 text-purple-300 border-purple-500/40',
    dotClass: 'bg-purple-400 animate-pulse'
  },
  INSPECTION_REQUIRED: {
    label: 'Inspection Required',
    badgeText: 'AWAITING SAFETY INSPECTION',
    description: 'Supervisor 5-point EHS inspection required before unlock.',
    icon: ShieldAlert,
    colorClass: 'bg-purple-950/90 text-purple-300 border-purple-500/50',
    dotClass: 'bg-purple-400 animate-pulse'
  },
  INSPECTION_APPROVED: {
    label: 'Inspection Approved',
    badgeText: 'SAFETY INSPECTION PASSED',
    description: 'Safety clearance granted. Ready for production release.',
    icon: ShieldCheck,
    colorClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    dotClass: 'bg-emerald-400'
  }
};

export default function MachineStatusBadge({ status, showDescription = false, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm font-bold'
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`inline-flex items-center gap-2 rounded-lg font-mono font-bold border transition-all shadow-md ${config.colorClass} ${sizeClasses[size]}`}>
        <span className={`w-2 h-2 rounded-full ${config.dotClass}`}></span>
        <IconComponent className="w-4 h-4 shrink-0" />
        <span>{config.badgeText}</span>
      </span>

      {showDescription && (
        <span className="text-[11px] text-slate-400 font-sans">{config.description}</span>
      )}
    </div>
  );
}
