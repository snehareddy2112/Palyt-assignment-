import React, { useState } from 'react';
import { KitchenProvider } from './context/KitchenContext';
import { Header } from './components/Header';
import { DashboardMetrics } from './components/DashboardMetrics';
import { InventoryView } from './components/InventoryView';
import { MenuView } from './components/MenuView';
import { EngineeringWriteupModal } from './components/EngineeringWriteupModal';
import { ToastContainer } from './components/Toast';

const DashboardContent: React.FC = () => {
  const [writeupOpen, setWriteupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      <Header onOpenWriteup={() => setWriteupOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <DashboardMetrics />

        {/* Side-by-side Dual View on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Inventory Section (Part 1) */}
          <div className="lg:col-span-7 flex flex-col min-h-[560px]">
            <InventoryView />
          </div>

          {/* Menu & Availability Section (Part 2 & 3) */}
          <div className="lg:col-span-5 flex flex-col min-h-[560px]">
            <MenuView />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 mt-8 text-center text-xs text-slate-400">
        <p>Palyt Engineering Intern Task Submission • Built with React, TypeScript, Tailwind & Vitest</p>
      </footer>

      {/* Engineering Write-up Modal */}
      <EngineeringWriteupModal
        isOpen={writeupOpen}
        onClose={() => setWriteupOpen(false)}
      />

      {/* Real-time Order & Action Feedback Toasts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <KitchenProvider>
      <DashboardContent />
    </KitchenProvider>
  );
}

export default App;
