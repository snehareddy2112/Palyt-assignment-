import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, ArrowDown } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useKitchen();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/30'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/30'
                : 'bg-slate-900/95 border-sky-500/40 text-slate-100 shadow-sky-950/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{toast.message}</p>

                {toast.deductions && toast.deductions.length > 0 && (
                  <div className="mt-3 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 text-xs">
                    <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-amber-400" /> Stock Deductions Applied:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {toast.deductions.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded text-[11px]">
                          <span className="text-slate-300 font-medium truncate">{d.name}</span>
                          <span className="text-amber-400 font-mono">
                            -{d.amountDeducted} {d.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
