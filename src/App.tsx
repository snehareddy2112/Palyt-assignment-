import React, { useState } from 'react';
import { KitchenProvider } from './context/KitchenContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardMetrics } from './components/DashboardMetrics';
import { InventoryView } from './components/InventoryView';
import { MenuView } from './components/MenuView';
import { EngineeringWriteupModal } from './components/EngineeringWriteupModal';
import { ToastContainer } from './components/Toast';

const DashboardContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'inventory' | 'menu'>('dashboard');
  const [writeupOpen, setWriteupOpen] = useState(false);

  const handleNavigate = (section: 'dashboard' | 'inventory' | 'menu') => {
    setActiveSection(section);
    if (section === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'inventory') {
      const el = document.getElementById('section-inventory');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'menu') {
      const el = document.getElementById('section-menu');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <div className="hidden md:block">
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onOpenWriteup={() => setWriteupOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onOpenWriteup={() => setWriteupOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col">
          <div id="section-dashboard">
            <DashboardMetrics />
          </div>

          {/* Side-by-side Dual View on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* Inventory Section (Part 1) */}
            <div className="lg:col-span-7 flex flex-col min-h-[580px]">
              <InventoryView isHighlighted={activeSection === 'inventory'} />
            </div>

            {/* Menu & Availability Section (Part 2 & 3) */}
            <div className="lg:col-span-5 flex flex-col min-h-[580px]">
              <MenuView isHighlighted={activeSection === 'menu'} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-3.5 px-6 text-center text-xs text-slate-400 font-medium">
          <p>Palyt Kitchen Operations Platform • Production Ready • React + TypeScript + Vite</p>
        </footer>
      </div>

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
