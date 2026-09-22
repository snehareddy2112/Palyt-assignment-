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
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-white/95 border-emerald-300 text-slate-900 shadow-emerald-500/10'
                : isError
                ? 'bg-white/95 border-rose-300 text-slate-900 shadow-rose-500/10'
                : 'bg-white/95 border-blue-300 text-slate-900 shadow-blue-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-[#FF4D6D]" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed font-medium">{toast.message}</p>

                {toast.deductions && toast.deductions.length > 0 && (
                  <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                    <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-[#FF7A00]" /> Stock Deducted:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {toast.deductions.map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-100 text-[11px]">
                          <span className="text-slate-700 font-semibold truncate">{d.name}</span>
                          <span className="text-[#FF7A00] font-mono font-bold">
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
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
