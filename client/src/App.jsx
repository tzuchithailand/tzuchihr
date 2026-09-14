import React, { useState } from 'react';
import DesktopHeader from './components/DesktopHeader';
import PersonnelDirectory from './pages/PersonnelDirectory';
import ShiftManagement from './pages/ShiftManagement';
import HipAttendancePage from './pages/HipAttendancePage';
import AccountingPayrollPage from './pages/AccountingPayrollPage';
import ReportsDashboard from './pages/ReportsDashboard';
import DesktopHospitalJobs from './pages/DesktopHospitalJobs';
import InterpreterPortal from './pages/InterpreterPortal';

export default function App() {
  // Top-Level Portal Mode: 'desktop' (ระบบคลินิกเต็มจอ) vs 'interpreter' (โหมดล่าม รพ. บนมือถือ)
  const [portalMode, setPortalMode] = useState('desktop');

  // Desktop active module: 'personnel' | 'shifts' | 'attendance' | 'payroll' | 'reports' | 'jobs'
  const [activeModule, setActiveModule] = useState('personnel');

  // 1. If user is in Hospital Interpreter Mode -> Render dedicated Mobile Portal directly!
  if (portalMode === 'interpreter') {
    return <InterpreterPortal onSwitchToDesktop={() => setPortalMode('desktop')} />;
  }

  // 2. Otherwise -> Render Full Desktop Clinic & Management Layout
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Full Desktop Header */}
      <DesktopHeader
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onSwitchToInterpreterPortal={() => setPortalMode('interpreter')}
      />

      {/* Main Desktop Container (max-w-7xl) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 'personnel' && <PersonnelDirectory />}
        {activeModule === 'shifts' && <ShiftManagement />}
        {activeModule === 'attendance' && <HipAttendancePage />}
        {activeModule === 'payroll' && <AccountingPayrollPage />}
        {activeModule === 'reports' && <ReportsDashboard />}
        {activeModule === 'jobs' && <DesktopHospitalJobs />}
      </main>

      {/* Desktop Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Tzuchi Clinic & Medical Interpreter Foundation. All rights reserved.</span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>HIP CiF93s-VL Biometrics</span>
            <span>•</span>
            <span>GPS Tracking Ready</span>
            <span>•</span>
            <span>3-Tier Payroll</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
