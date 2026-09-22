import React from 'react';
import { Search, Bell, FileText, RotateCcw } from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

interface HeaderProps {
  onOpenWriteup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWriteup }) => {
  const { searchQuery, setSearchQuery, stock, handleResetData } = useKitchen();

  const lowStockCount = stock.filter((i) => i.qty < i.par).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ingredients, dishes, stock levels..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick action buttons on mobile/tablet */}
        <button
          onClick={onOpenWriteup}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>Write-up</span>
        </button>

        <button
          onClick={handleResetData}
          title="Reset to initial data"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title={`${lowStockCount} low stock alerts`}
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D6D] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            SR
          </div>
        </div>
      </div>
    </header>
  );
};
