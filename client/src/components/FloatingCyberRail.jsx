import React, { useState } from 'react';
import { 
  Users, CalendarClock, Fingerprint, Coins, BarChart3, 
  Building2, Smartphone, Stethoscope, ChevronRight, Sparkles,
  Zap, ShieldCheck, Activity
} from 'lucide-react';

export default function FloatingCyberRail({ activeModule, onSelectModule, onSwitchToInterpreterPortal }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: 'personnel', label: 'บุคลากรคลินิก', sub: 'แพทย์/พยาบาล/ล่าม', icon: Users, glow: 'group-hover:shadow-teal-500/50', activeBg: 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' },
    { id: 'shifts', label: 'จัดกะทำงาน 2 ทีม', sub: 'เมดิคอล vs ล่าม', icon: CalendarClock, glow: 'group-hover:shadow-cyan-500/50', activeBg: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' },
    { id: 'attendance', label: 'สแกนเวลา HIP', sub: 'CiF93s-VL TCP:4370', icon: Fingerprint, glow: 'group-hover:shadow-indigo-500/50', activeBg: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' },
    { id: 'payroll', label: 'งานบัญชีค่าจ้าง', sub: '3 หมวดค่าตอบแทน', icon: Coins, glow: 'group-hover:shadow-amber-500/50', activeBg: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' },
    { id: 'reports', label: 'รายงานผู้บริหาร', sub: 'Executive KPI & CSV', icon: BarChart3, glow: 'group-hover:shadow-rose-500/50', activeBg: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' },
    { id: 'jobs', label: 'ติดตามงานล่าม รพ.', sub: 'GPS & ใบรับรองแพทย์', icon: Building2, glow: 'group-hover:shadow-emerald-500/50', activeBg: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' },
  ];

  return (
    <>
      {/* FLOATING CYBER RAIL (No top menu! Floating glass dock on left edge) */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-out hidden md:flex flex-col justify-between py-4 px-2.5 bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl text-white ${
          isExpanded ? 'w-64' : 'w-18'
        }`}
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 30px rgba(15, 118, 110, 0.2)',
        }}
      >
        {/* Brand Icon Header */}
        <div className="flex items-center gap-3 px-1.5 pb-4 border-b border-white/10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/30 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-teal-400">
              <Stethoscope className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          {isExpanded && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">TZUCHI HR</span>
                <span className="text-[9px] bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded">
                  PRO MAX
                </span>
              </div>
              <p className="text-[10px] text-slate-400">ระบบคลินิกไร้เมนูบน</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="my-auto py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 relative group active:scale-95 ${
                  isActive
                    ? item.activeBg
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>

                {isExpanded ? (
                  <div className="text-left overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                    <span className="font-bold text-xs block leading-tight">{item.label}</span>
                    <span className={`text-[10px] block leading-tight ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {item.sub}
                    </span>
                  </div>
                ) : (
                  /* Micro tooltip when collapsed */
                  <div className="absolute left-16 bg-slate-900/95 text-white px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap pointer-events-none shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5">
                    <span>{item.label}</span>
                    <ChevronRight className="w-3 h-3 text-teal-400" />
                  </div>
                )}

                {/* Active Glowing Dot */}
                {isActive && (
                  <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-full shadow-lg shadow-white animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Switch to Mobile Interpreter Portal */}
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={onSwitchToInterpreterPortal}
            className={`w-full py-2.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 active:scale-95 transition ${
              isExpanded ? 'px-3' : 'justify-center'
            }`}
            title="เปิดพอร์ทัลล่าม รพ. บนมือถือ"
          >
            <Smartphone className="w-5 h-5 shrink-0 text-emerald-200" />
            {isExpanded && (
              <div className="text-left whitespace-nowrap animate-in fade-in duration-200">
                <span className="text-[10px] text-emerald-200 block leading-none">เปิดโหมดล่าม</span>
                <span className="font-extrabold text-xs block leading-tight">พอร์ทัลงานล่าม รพ.</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM DOCK (For small tablets & mobile when in desktop mode) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl p-1.5 flex items-center justify-around text-white">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`p-2.5 rounded-2xl transition active:scale-90 ${
                isActive ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
        <button
          onClick={onSwitchToInterpreterPortal}
          className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg active:scale-90 transition"
          title="สลับไปโหมดล่าม รพ."
        >
          <Smartphone className="w-5 h-5" />
        </button>
      </nav>
    </>
  );
}
