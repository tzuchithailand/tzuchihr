import React, { useState, useEffect } from 'react';
import { 
  Building2, Stethoscope, Sparkles, Wifi, ShieldCheck, 
  Activity, Clock, ChevronRight, UserCheck
} from 'lucide-react';

export default function ProMaxHeader({ activeModule, onSelectModule }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      {/* iOS Pro Max Dynamic Status Strip */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span className="font-semibold text-slate-900 tracking-tight">{timeStr}</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            HIP CiF93s-VL พร้อมเชื่อมต่อ
          </span>
          <span className="text-[10px] text-slate-400">{dateStr}</span>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-500 p-0.5 shadow-md shadow-emerald-800/15">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-emerald-600">
              <Stethoscope className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                Tzuchi HR Clinic
              </h1>
              <span className="text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black px-1.5 py-0.5 rounded-md shadow-xs">
                PRO MAX
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ระบบคลินิก • ล่าม รพ. • สแกนหน้า HIP • บัญชี
            </p>
          </div>
        </div>

        {/* Quick Mode Badge */}
        <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/70 px-2.5 py-1.5 rounded-2xl">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-semibold text-slate-700">ฝ่ายบุคคล</span>
        </div>
      </div>
    </header>
  );
}
