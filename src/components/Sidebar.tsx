import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  UtensilsCrossed,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

interface SidebarProps {
  activeSection: 'dashboard' | 'inventory' | 'menu';
  onNavigate: (section: 'dashboard' | 'inventory' | 'menu') => void;
  onOpenWriteup: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  onOpenWriteup
}) => {
  const { handleResetData } = useKitchen();

  const navItems: Array<{ id: 'dashboard' | 'inventory' | 'menu'; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stock Inventory', icon: Boxes },
    { id: 'menu', label: 'Diner Menu', icon: UtensilsCrossed },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 shadow-lg min-h-screen text-slate-100">
      <div>
        {/* Brand Banner */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7A00] via-[#EA580C] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-bold">
            <UtensilsCrossed className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>Palyt</span>
              <span className="text-[#FF7A00]">Kitchen Ops</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Smart Inventory. Always Ready.</p>
          </div>
        </div>

        {/* In-Page Navigation */}
        <div className="p-3 space-y-1.5">
          <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40 shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF7A00]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenWriteup}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <FileText className="w-4 h-4 text-[#FF7A00]" />
          <span>Engineering Write-up</span>
        </button>

        <button
          onClick={handleResetData}
          title="Reset to default stock data"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset Demo Data</span>
        </button>

        {/* User Card */}
        <div className="pt-2.5 border-t border-slate-800/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7A00] to-[#EA580C] flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm">
            SR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Sneha Reddy</p>
            <p className="text-[10px] text-slate-400 truncate">Kitchen Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
