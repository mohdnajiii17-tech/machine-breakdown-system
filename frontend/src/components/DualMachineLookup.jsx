import React, { useState } from 'react';
import { QrCode, Search, Cpu, ArrowRight, ShieldCheck, Camera } from 'lucide-react';
import { fetchApi } from '../api/client';

export default function DualMachineLookup({ machines = [], onSelectMachine }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setErrorMsg('');

    try {
      const res = await fetchApi(`/machines/lookup/${encodeURIComponent(searchQuery.trim())}`);
      onSelectMachine(res);
    } catch (err) {
      setErrorMsg(`No machine found for '${searchQuery}'. Please check Machine ID.`);
    }
  };

  const handleSelectFromList = (machine) => {
    setErrorMsg('');
    onSelectMachine(machine);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            Machine Identification & Selection
          </h2>
          <p className="text-xs text-slate-400">Scan QR Code tag on equipment or enter visible Machine ID</p>
        </div>

        <span className="text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50 px-2 py-1 rounded">
          Dual Lookup Mode
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dual Mode Option A: QR Camera / Scan Trigger */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Camera className="w-4 h-4 text-cyan-400" />
              Option A: Scan QR Tag
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Use camera or click preset scanner to automatically pull telemetry for target machine.
            </p>
          </div>

          <button
            onClick={() => {
              // Quick demo scanner picker fallback: pick CNC-07 by default
              const sample = machines.find(m => m.machineId === 'CNC-07') || machines[0];
              if (sample) onSelectMachine(sample);
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <QrCode className="w-4 h-4" />
            Launch QR Scanner (Simulated / Camera)
          </button>
        </div>

        {/* Dual Mode Option B: Visible Machine ID Manual Search Fallback */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Search className="w-4 h-4 text-amber-400" />
            Option B: Manual Machine ID Search
          </div>
          <p className="text-xs text-slate-400 mb-3">
            For operators without smartphones/camera access. Type visible ID (e.g. <code>CNC-07</code>).
          </p>

          <form onSubmit={handleManualSearch} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Enter Machine ID (e.g. CNC-07)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
            >
              Search
            </button>
          </form>

          {errorMsg && (
            <p className="text-[11px] text-red-400 mt-1">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Quick Select Buttons from Active Machines list */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 block mb-2 font-medium">Quick Select Factory Equipment:</span>
        <div className="flex flex-wrap gap-2">
          {machines.map(m => (
            <button
              key={m.machineId}
              onClick={() => handleSelectFromList(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                m.status === 'AVAILABLE'
                  ? 'bg-slate-800/80 text-emerald-300 border-emerald-500/30 hover:bg-slate-800'
                  : 'bg-red-950/40 text-red-300 border-red-500/30 hover:bg-red-900/40'
              }`}
            >
              <span className="font-bold">{m.machineId}</span>
              <span className="text-[10px] text-slate-400">({m.category})</span>
              <span className={`w-2 h-2 rounded-full ${m.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-red-500 animate-ping'}`}></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
