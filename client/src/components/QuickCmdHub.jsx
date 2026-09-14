import React, { useState, useEffect } from 'react';
import { 
  Wifi, ShieldCheck, Clock, Smartphone, Sparkles, 
  Activity, Fingerprint, Stethoscope
} from 'lucide-react';

export default function QuickCmdHub({ onSwitchToInterpreterPortal }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {/* Left Capsule: Clinic Live Status */}
      <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs px-4 py-2 rounded-2xl">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-extrabold text-slate-800">TZUCHI CLINIC HUD</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Fingerprint className="w-3.5 h-3.5" />
            HIP CiF93s-VL (TCP:4370) พร้อมใช้งาน
          </span>
        </div>
      </div>

      {/* Right Capsule: Time & Fast Portal Shifter */}
      <div className="flex items-center gap-2.5">
        {/* Time Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs px-4 py-2 rounded-2xl text-xs font-mono font-bold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>{time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.</span>
        </div>

        {/* Portal Switch Button */}
        <button
          onClick={onSwitchToInterpreterPortal}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-700/20 active:scale-95 transition flex items-center gap-2 group"
        >
          <Smartphone className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
          <span>เปิดโหมดล่าม รพ. (Mobile Portal)</span>
        </button>
      </div>
    </div>
  );
}
