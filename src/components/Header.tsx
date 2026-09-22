import React from 'react';
import { UtensilsCrossed, RotateCcw, FileText } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

interface HeaderProps {
  onOpenWriteup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWriteup }) => {
  const { handleResetData } = useKitchen();

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/30">
            <UtensilsCrossed className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Palyt <span className="text-amber-400 font-semibold">Kitchen Ops</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live System
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time inventory deduction & menu availability engine</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenWriteup}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Engineering Write-up</span>
          </button>

          <button
            onClick={handleResetData}
            title="Reset to default assignment stock data"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
