import React, { useState } from 'react';
import FloatingCyberRail from './components/FloatingCyberRail';
import QuickCmdHub from './components/QuickCmdHub';
import PersonnelDirectory from './pages/PersonnelDirectory';
import ShiftManagement from './pages/ShiftManagement';
import HipAttendancePage from './pages/HipAttendancePage';
import AccountingPayrollPage from './pages/AccountingPayrollPage';
import ReportsDashboard from './pages/ReportsDashboard';
import DesktopHospitalJobs from './pages/DesktopHospitalJobs';
import InterpreterPortal from './pages/InterpreterPortal';

export default function App() {
  // Top-Level Portal Mode: 'desktop' (ระบบคลินิกจอคอม) vs 'interpreter' (โหมดล่าม รพ. บนมือถือ)
  const [portalMode, setPortalMode] = useState('desktop');

  // Active module in Desktop system
  const [activeModule, setActiveModule] = useState('personnel');

  // 1. If in Hospital Interpreter Mode -> Render dedicated Mobile Portal directly!
  if (portalMode === 'interpreter') {
    return <InterpreterPortal onSwitchToDesktop={() => setPortalMode('desktop')} />;
  }

  // 2. Otherwise -> Full Modern Responsive Desktop Layout (NO TOP MENU! Uses Floating Cyber Rail)
  return (
    <div className="flex min-h-screen bg-slate-100/90 text-slate-800 antialiased font-sans relative overflow-x-hidden">
      {/* 🛸 UNORTHODOX NAVIGATION: Floating Cyber Rail on Left Edge (No top menu!) */}
      <FloatingCyberRail
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onSwitchToInterpreterPortal={() => setPortalMode('interpreter')}
      />

      {/* Main Responsive Canvas across ALL Computer Screen Sizes (Laptops to 4K Ultrawide) */}
      <div className="flex-1 w-full pl-0 md:pl-24 pr-4 sm:pr-6 md:pr-8 py-6 max-w-[1680px] mx-auto transition-all pb-24 md:pb-6">
        {/* Floating Futuristic HUD Header */}
        <QuickCmdHub onSwitchToInterpreterPortal={() => setPortalMode('interpreter')} />

        {/* Dynamic Main Body Content */}
        <main className="w-full">
          {activeModule === 'personnel' && <PersonnelDirectory />}
          {activeModule === 'shifts' && <ShiftManagement />}
          {activeModule === 'attendance' && <HipAttendancePage />}
          {activeModule === 'payroll' && <AccountingPayrollPage />}
          {activeModule === 'reports' && <ReportsDashboard />}
          {activeModule === 'jobs' && <DesktopHospitalJobs />}
        </main>
      </div>
    </div>
  );
}
