import React from 'react';
import { AlertCircle, Volume2, Activity, Thermometer, Droplet, PowerOff, Zap, Wrench } from 'lucide-react';

export const SYMPTOMS_LIST = [
  {
    id: 'STOPPED',
    label: 'Machine Stopped / Line Halt',
    icon: PowerOff,
    description: 'Equipment halted unexpectedly during operation.',
    color: 'border-red-500/50 bg-red-950/30 text-red-300 hover:bg-red-900/40'
  },
  {
    id: 'VIBRATION',
    label: 'Excessive Vibration',
    icon: Activity,
    description: 'Unusual shaking or mechanical oscillation.',
    color: 'border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40'
  },
  {
    id: 'NOISE',
    label: 'Unusual Noise / Grinding',
    icon: Volume2,
    description: 'Bearing screeching, gear grinding, or metallic knocking.',
    color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40'
  },
  {
    id: 'OVERHEATING',
    label: 'Overheating / Thermal Warning',
    icon: Thermometer,
    description: 'Motor casing hot or temperature alarm active.',
    color: 'border-orange-500/50 bg-orange-950/30 text-orange-300 hover:bg-orange-900/40'
  },
  {
    id: 'LEAKAGE',
    label: 'Fluid / Hydraulic Leakage',
    icon: Droplet,
    description: 'Oil, coolant, or hydraulic fluid dripping.',
    color: 'border-blue-500/50 bg-blue-950/30 text-blue-300 hover:bg-blue-900/40'
  },
  {
    id: 'ELECTRICAL',
    label: 'Electrical / Circuit Fault',
    icon: Zap,
    description: 'Breaker trip, spark, or PLC error code.',
    color: 'border-purple-500/50 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40'
  }
];

export default function SymptomPicker({ selectedSymptom, onSelectSymptom }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          Select Observed Symptom (1-Tap Selection)
        </label>
        <span className="text-[11px] text-slate-400">No technical diagnosis needed</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYMPTOMS_LIST.map(sym => {
          const IconComponent = sym.icon;
          const isSelected = selectedSymptom === sym.id;

          return (
            <button
              key={sym.id}
              type="button"
              onClick={() => onSelectSymptom(sym.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/80 text-cyan-100 ring-2 ring-cyan-500/40 shadow-lg scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="text-[10px] font-bold bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                    Selected
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-xs mb-0.5">{sym.label}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{sym.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
