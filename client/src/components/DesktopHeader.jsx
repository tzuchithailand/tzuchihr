import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Users, CalendarClock, Fingerprint, Coins, 
  BarChart3, Building2, Smartphone, ShieldCheck, Clock, ExternalLink
} from 'lucide-react';

export default function DesktopHeader({ activeModule, onSelectModule, onSwitchToInterpreterPortal }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'personnel', label: 'ฐานข้อมูลบุคลากร', icon: Users },
    { id: 'shifts', label: 'จัดกะทำงาน (2 ทีม)', icon: CalendarClock },
    { id: 'attendance', label: 'สแกนเวลา HIP CiF93s-VL', icon: Fingerprint },
    { id: 'payroll', label: 'งานบัญชีค่าจ้าง (3 หมวด)', icon: Coins },
    { id: 'reports', label: 'รายงานผู้บริหาร', icon: BarChart3 },
    { id: 'jobs', label: 'ติดตามงานล่าม รพ.', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            เครื่องสแกน HIP CiF93s-VL (192.168.1.201:4370) เชื่อมต่อปกติ
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            ศูนย์บริการทางการแพทย์และคลินิกเวชกรรม Tzuchi
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-300">
            {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.
          </span>
          <span className="text-slate-500 hidden sm:inline">
            {time.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Desktop Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 p-0.5 shadow-md shadow-emerald-700/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-teal-600">
              <Stethoscope className="w-6 h-6 stroke-[2.3]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base text-slate-900 tracking-tight leading-none">
                Tzuchi HR Clinic
              </h1>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-md">
                DESKTOP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">ระบบบริหารจัดการคลินิกและบุคลากร</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 shadow-xs scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 stroke-[2.5]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action: Switch to Interpreter Mobile Portal */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToInterpreterPortal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition flex items-center gap-2 group"
          >
            <Smartphone className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition" />
            <div className="text-left">
              <span className="block leading-tight text-[11px] text-emerald-100">พอร์ทัลล่าม</span>
              <span className="block leading-tight font-extrabold">เข้าสู่โหมดงานล่าม รพ.</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Submenu if screen is narrow */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-100 bg-slate-50/70">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                isActive ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
