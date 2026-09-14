import React from 'react';
import { 
  Building2, Users, CalendarClock, Fingerprint, 
  Coins, BarChart3, Stethoscope
} from 'lucide-react';

export default function ProMaxNavBar({ activeModule, onSelectModule }) {
  const navItems = [
    { id: 'jobs', label: 'งานล่าม รพ.', icon: Building2, color: 'text-emerald-600' },
    { id: 'personnel', label: 'บุคลากร', icon: Users, color: 'text-teal-600' },
    { id: 'shifts', label: 'จัดกะทำงาน', icon: CalendarClock, color: 'text-cyan-600' },
    { id: 'attendance', label: 'สแกนเวลา HIP', icon: Fingerprint, color: 'text-indigo-600' },
    { id: 'payroll', label: 'งานบัญชี', icon: Coins, color: 'text-amber-600' },
    { id: 'reports', label: 'รายงาน', icon: BarChart3, color: 'text-rose-600' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 max-w-[540px] mx-auto shadow-2xl safe-area-pb">
      <div className="grid grid-cols-6 h-17 px-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 transition-all active:scale-90 ${
                isActive
                  ? `${item.color} font-bold`
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-slate-100 shadow-xs scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[9.5px] truncate w-full text-center leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
