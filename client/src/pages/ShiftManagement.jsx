import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, Stethoscope, Globe, PlusCircle, Clock, 
  MapPin, CheckCircle2, UserCheck, Trash2, ChevronRight, AlertCircle,
  Search, Building2, Filter
} from 'lucide-react';
import { fetchShifts, updateShiftStatus, deleteShift, fetchWorkplaces } from '../services/api';
import ShiftModal from '../components/ShiftModal';

export default function ShiftManagement() {
  const [activeTeam, setActiveTeam] = useState('medical'); // 'medical' or 'interpreter'
  const [shifts, setShifts] = useState([]);
  const [workplaces, setWorkplaces] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [workplaceFilter, setWorkplaceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  useEffect(() => {
    loadShifts();
    loadWorkplaces();
  }, [activeTeam, selectedDate]);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await fetchShifts(activeTeam, selectedDate);
      if (res.success) setShifts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkplaces = async () => {
    try {
      const res = await fetchWorkplaces();
      if (res.success) setWorkplaces(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (shift) => {
    const nextStatus =
      shift.status === 'scheduled'
        ? 'on_duty'
        : shift.status === 'on_duty'
        ? 'completed'
        : 'scheduled';

    await updateShiftStatus(shift.id, nextStatus);
    loadShifts();
  };

  const handleDeleteShift = async (id, name) => {
    if (window.confirm(`ยืนยันการลบกะทำงานของ "${name}" หรือไม่?`)) {
      await deleteShift(id);
      loadShifts();
    }
  };

  // Filter shifts by search query (ID or Name) and workplace
  const filteredShifts = shifts.filter((shift) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (shift.person_name && shift.person_name.toLowerCase().includes(query)) ||
      (shift.person_code && shift.person_code.toLowerCase().includes(query)) ||
      (shift.person_id && shift.person_id.toLowerCase().includes(query)) ||
      (shift.role_or_language && shift.role_or_language.toLowerCase().includes(query));

    const matchesWorkplace =
      workplaceFilter === 'all' || shift.workplace === workplaceFilter;

    return matchesQuery && matchesWorkplace;
  });

  const onDutyCount = shifts.filter((s) => s.status === 'on_duty').length;
  const scheduledCount = shifts.filter((s) => s.status === 'scheduled').length;
  const completedCount = shifts.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-cyan-700 via-teal-800 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-wider text-cyan-200 uppercase block mb-1">
            ระบบจัดกะการทำงานแยกทีม (Shift Roster)
          </span>
          <h2 className="text-xl font-black tracking-tight">ตารางเวรและการปฏิบัติงาน</h2>
          <p className="text-xs text-cyan-100/80 mt-1">
            แยกกะแพทย์/พยาบาล และกะล่ามประจำคลินิก/On-Call พร้อมกำหนดจุดปฏิบัติงาน
          </p>

          {/* Standard Shift Highlight Badge */}
          <div className="inline-flex items-center gap-2 mt-2.5 px-3 py-1 bg-white/15 backdrop-blur-xs border border-white/20 rounded-full text-xs font-semibold text-cyan-100">
            <Clock className="w-3.5 h-3.5 text-cyan-300" />
            <span>กะมาตรฐานระบบ: <strong className="text-white font-mono">07:00 - 16:30 น.</strong> (มีกะเดียว)</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-xs text-center">
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-xs">
              <span className="text-cyan-200 block text-[10px]">รอเข้าเวร</span>
              <span className="text-base font-bold text-white">{scheduledCount}</span>
            </div>
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-xs">
              <span className="text-cyan-200 block text-[10px]">กำลังขึ้นเวร</span>
              <span className="text-base font-bold text-emerald-300 animate-pulse">{onDutyCount}</span>
            </div>
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-xs">
              <span className="text-cyan-200 block text-[10px]">เสร็จสิ้นกะ</span>
              <span className="text-base font-bold text-slate-300">{completedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Team Switcher */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 rounded-2xl gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTeam('medical')}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTeam === 'medical'
              ? 'bg-white text-teal-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-teal-600" />
          กะเมดิคอลทีม (แพทย์/พยาบาล)
        </button>

        <button
          onClick={() => setActiveTeam('interpreter')}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTeam === 'interpreter'
              ? 'bg-white text-cyan-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-600" />
          กะทีมล่ามแปลภาษา
        </button>
      </div>

      {/* Filters Bar: Date + Search ID/Name + Workplace Filter + Add Shift */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">วันที่:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="px-2 py-1 text-[11px] bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-semibold"
            >
              วันนี้
            </button>
          </div>

          {/* Add Shift Button */}
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-700/20 active:scale-95 transition flex items-center gap-1 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            จัดกะใหม่ (07:00-16:30)
          </button>
        </div>

        {/* Search by ID/Name & Workplace Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="🔍 ค้นหาด้วยรหัส (ID เช่น MED-101, INT-01) หรือชื่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Workplace Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              value={workplaceFilter}
              onChange={(e) => setWorkplaceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">📍 ทุกสถานที่/จุดปฏิบัติงาน ({workplaces.length})</option>
              {workplaces.map((wp) => (
                <option key={wp.id} value={wp.name}>
                  {wp.type === 'hospital' ? '🏥' : '📍'} {wp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shifts List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดตารางกะ...</div>
      ) : filteredShifts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
          <CalendarClock className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-xs">
            {searchQuery || workplaceFilter !== 'all'
              ? 'ไม่พบกะทำงานที่ตรงกับเงื่อนไขการค้นหา'
              : 'ยังไม่มีกะทำงานในวันที่เลือก'}
          </p>
          <p className="text-[11px] text-slate-400">
            {searchQuery || workplaceFilter !== 'all'
              ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองจุดปฏิบัติงาน'
              : 'กดปุ่ม "จัดกะใหม่" เพื่อมอบหมายกะให้บุคลากร'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredShifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-cyan-300 transition space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md inline-block">
                      {shift.shift_name}
                    </span>
                    {shift.person_code && (
                      <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-md border border-cyan-200">
                        {shift.person_code}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{shift.person_name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{shift.role_or_language}</p>
                </div>

                {/* Status Toggle Badge */}
                <button
                  onClick={() => handleToggleStatus(shift)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 active:scale-95 shrink-0 ${
                    shift.status === 'on_duty'
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                      : shift.status === 'completed'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                  title="คลิกเพื่อเปลี่ยนสถานะกะ"
                >
                  {shift.status === 'on_duty' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                  {shift.status === 'on_duty'
                    ? '🟢 ขึ้นเวรอยู่'
                    : shift.status === 'completed'
                    ? '✓ เสร็จสิ้นกะ'
                    : '⏳ รอเข้าเวร'}
                </button>
              </div>

              {/* Shift Timing & Workplace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span className="font-mono font-bold">
                    {shift.start_time} - {shift.end_time} น.
                  </span>
                  <span className="text-[10px] text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">กะมาตรฐาน</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 truncate">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate font-semibold text-slate-800">{shift.workplace}</span>
                </div>
              </div>

              {shift.notes && (
                <p className="text-[11px] text-slate-500 bg-slate-50/60 p-2 rounded-xl">
                  💬 {shift.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">
                  คลิกที่ปุ่มสถานะเพื่อเปลี่ยนเป็น ขึ้นเวร/ออกเวร
                </span>
                <button
                  onClick={() => handleDeleteShift(shift.id, shift.person_name)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                  title="ลบกะนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSaved={loadShifts}
        defaultTeamType={activeTeam}
      />
    </div>
  );
}
