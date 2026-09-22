import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWriteup: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWriteup
}) => {
  const { handleResetData } = useKitchen();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm min-h-screen">
      <div>
        {/* Brand Banner */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#FF9E40] flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <span>Palyt</span>
              <span className="text-[#FF7A00]">Kitchen Ops</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Smart Inventory. Always Ready.</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF7A00]/10 text-[#FF7A00] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF7A00]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'dashboard' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF7A00]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={onOpenWriteup}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#FF7A00]" />
          <span>Engineering Write-up</span>
        </button>

        <button
          onClick={handleResetData}
          title="Reset to default stock data"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 bg-transparent hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset Demo Data</span>
        </button>

        {/* User Card */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            SR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">Sneha Reddy</p>
            <p className="text-[10px] text-slate-400 truncate">Kitchen Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
