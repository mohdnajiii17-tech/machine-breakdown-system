import React from 'react';
import { AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  machineId,
  actionType = 'DANGER',
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isProcessing = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${actionType === 'DANGER' ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">SAFETY CONFIRMATION</span>
              <h3 className="font-bold text-sm text-slate-100">{title}</h3>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {message}
        </p>

        {machineId && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono flex justify-between items-center">
            <span className="text-slate-400">Target Equipment:</span>
            <strong className="text-cyan-400">{machineId}</strong>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-5 py-2 font-bold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5 ${
              actionType === 'DANGER'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-slate-950'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
            }`}
          >
            <Check className="w-4 h-4" />
            {isProcessing ? 'Executing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
