import React, { useState, useEffect } from 'react';
import { 
  X, CalendarClock, Stethoscope, Globe, Building2, 
  Check, Search, Plus, Trash2, MapPin, Sparkles, Clock
} from 'lucide-react';
import { 
  createShift, fetchStaff, fetchInterpreters, 
  fetchWorkplaces, createWorkplace, deleteWorkplace 
} from '../services/api';

export default function ShiftModal({ isOpen, onClose, onSaved, defaultTeamType = 'medical' }) {
  const [teamType, setTeamType] = useState(defaultTeamType);
  const [staffList, setStaffList] = useState([]);
  const [interpList, setInterpList] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  
  // Search filter for Person by ID or Name
  const [personSearch, setPersonSearch] = useState('');

  // Workplaces list and management
  const [workplaces, setWorkplaces] = useState([]);
  const [isAddingWorkplace, setIsAddingWorkplace] = useState(false);
  const [newWorkplaceName, setNewWorkplaceName] = useState('');
  const [newWorkplaceType, setNewWorkplaceType] = useState('clinic');

  // Form data: Standard single shift default is 07:00 - 16:30
  const [formData, setFormData] = useState({
    shift_name: 'กะมาตรฐาน (07:00 - 16:30 น.)',
    shift_date: new Date().toISOString().slice(0, 10),
    start_time: '07:00',
    end_time: '16:30',
    workplace: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeamType(defaultTeamType);
      setPersonSearch('');
      setIsAddingWorkplace(false);
      loadAllData();
    }
  }, [isOpen, defaultTeamType]);

  const loadAllData = async () => {
    try {
      const [sRes, iRes, wRes] = await Promise.all([
        fetchStaff(),
        fetchInterpreters(),
        fetchWorkplaces(),
      ]);
      if (sRes.success) setStaffList(sRes.data);
      if (iRes.success) setInterpList(iRes.data);
      if (wRes.success && wRes.data?.length > 0) {
        setWorkplaces(wRes.data);
        setFormData((prev) => ({
          ...prev,
          workplace: prev.workplace || wRes.data[0].name,
        }));
      }

      if (defaultTeamType === 'medical' && sRes.data?.length > 0) {
        setSelectedPersonId(sRes.data[0].id);
      } else if (iRes.data?.length > 0) {
        setSelectedPersonId(iRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset to single standard shift preset: 07:00 - 16:30
  const handleApplyStandardShift = () => {
    setFormData((prev) => ({
      ...prev,
      shift_name: 'กะมาตรฐาน (07:00 - 16:30 น.)',
      start_time: '07:00',
      end_time: '16:30',
    }));
  };

  // Filter people list by ID or Name
  const activeList = teamType === 'medical' ? staffList : interpList;
  const filteredPeople = activeList.filter((p) => {
    const code = teamType === 'medical' ? (p.staff_code || '') : (p.interpreter_code || '');
    const name = p.name || '';
    const query = personSearch.toLowerCase().trim();
    return (
      name.toLowerCase().includes(query) ||
      code.toLowerCase().includes(query)
    );
  });

  // Handle adding new workplace by Admin
  const handleCreateWorkplace = async () => {
    if (!newWorkplaceName.trim()) {
      alert('กรุณากรอกชื่อสถานที่/จุดปฏิบัติงาน');
      return;
    }
    try {
      const res = await createWorkplace({
        name: newWorkplaceName.trim(),
        type: newWorkplaceType,
        description: 'กำหนดโดยผู้ดูแลระบบ',
      });
      if (res.success) {
        const wRes = await fetchWorkplaces();
        if (wRes.success) setWorkplaces(wRes.data);
        setFormData((prev) => ({ ...prev, workplace: newWorkplaceName.trim() }));
        setNewWorkplaceName('');
        setIsAddingWorkplace(false);
      } else {
        alert(res.message || 'บันทึกไม่สำเร็จ');
      }
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการเพิ่มสถานที่');
    }
  };

  const handleDeleteWorkplace = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`ต้องการลบจุดปฏิบัติงาน "${name}" หรือไม่?`)) {
      await deleteWorkplace(id);
      const wRes = await fetchWorkplaces();
      if (wRes.success) {
        setWorkplaces(wRes.data);
        if (formData.workplace === name) {
          setFormData((prev) => ({ ...prev, workplace: wRes.data[0]?.name || '' }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const person = activeList.find((p) => p.id === selectedPersonId);

    if (!person) {
      alert('กรุณาเลือกผู้ปฏิบัติงาน');
      return;
    }

    if (!formData.workplace) {
      alert('กรุณาเลือกหรือกำหนดสถานที่ประจำ / จุดปฏิบัติงาน');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        team_type: teamType,
        person_id: person.id,
        person_name: person.name,
        role_or_language: teamType === 'medical' ? person.role : person.languages,
        shift_name: formData.shift_name,
        shift_date: formData.shift_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        workplace: formData.workplace,
        notes: formData.notes,
      };

      const res = await createShift(payload);
      if (res.success) {
        onSaved();
        onClose();
      } else {
        alert(res.message || 'บันทึกกะไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[540px] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">จัดกะการทำงาน (Shift Schedule)</h3>
              <p className="text-xs text-slate-500">กะมาตรฐาน 07:00 - 16:30 น. • กำหนดจุดปฏิบัติงาน</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. Team Switcher Segmented Control */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">เลือกทีมที่ต้องการจัดกะ:</label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setTeamType('medical');
                  setPersonSearch('');
                  if (staffList.length > 0) setSelectedPersonId(staffList[0].id);
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  teamType === 'medical'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                เมดิคอลทีม ({staffList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeamType('interpreter');
                  setPersonSearch('');
                  if (interpList.length > 0) setSelectedPersonId(interpList[0].id);
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  teamType === 'interpreter'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-4 h-4" />
                ทีมล่ามแปลภาษา ({interpList.length})
              </button>
            </div>
          </div>

          {/* 2. Person Selector with ID or Name Search Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                {teamType === 'medical' ? 'เลือกแพทย์ / พยาบาล / เจ้าหน้าที่:' : 'เลือกล่ามแปลภาษา:'}
              </label>
              <span className="text-[11px] text-cyan-700 font-bold">
                (พบ {filteredPeople.length} ท่าน)
              </span>
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  teamType === 'medical'
                    ? '🔍 ค้นหาด้วยรหัส (เช่น MED-101, NUR-201) หรือชื่อ-นามสกุล...'
                    : '🔍 ค้นหาด้วยรหัส (เช่น INT-01) หรือชื่อล่าม...'
                }
                value={personSearch}
                onChange={(e) => setPersonSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
              />
              {personSearch && (
                <button
                  type="button"
                  onClick={() => setPersonSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Person Dropdown / Selection List */}
            {filteredPeople.length > 0 ? (
              <select
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                size={filteredPeople.length > 3 ? 4 : filteredPeople.length + 1}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 font-medium text-xs space-y-1"
                required
              >
                {filteredPeople.map((p) => {
                  const code = teamType === 'medical' ? p.staff_code : p.interpreter_code;
                  const detail = teamType === 'medical' ? `${p.role} - ${p.department}` : p.languages;
                  return (
                    <option key={p.id} value={p.id} className="py-1 px-2 rounded hover:bg-cyan-50 cursor-pointer">
                      [{code}] {p.name} ({detail})
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-[11px] text-amber-800">
                ไม่พบบุคลากรที่ตรงกับคำค้นหา "{personSearch}"
              </div>
            )}
          </div>

          {/* 3. Standard Shift (Single standard shift: 07:00 - 16:30) */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" />
                ช่วงเวลากะมาตรฐาน (มีกะเดียว):
              </span>
              <button
                type="button"
                onClick={handleApplyStandardShift}
                className="px-2.5 py-1 bg-cyan-600 text-white rounded-lg font-bold text-[11px] shadow-xs active:scale-95 transition"
              >
                ✓ ตั้งเป็น 07:00 - 16:30
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">วันที่เข้าเวร</label>
                <input
                  type="date"
                  value={formData.shift_date}
                  onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">เวลาเริ่ม (07:00)</label>
                <input
                  type="text"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-center outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">เวลาสิ้นสุด (16:30)</label>
                <input
                  type="text"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 text-center outline-none"
                  required
                />
              </div>
            </div>

            <p className="text-[10px] text-cyan-700 font-medium">
              * กะปฏิบัติงานมาตรฐาน: 07:00 น. ถึง 16:30 น. (รวม 9.5 ชม. รวมพัก)
            </p>
          </div>

          {/* 4. สถานที่ประจำ / จุดปฏิบัติงาน (Admin สร้างและกำหนดได้) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                สถานที่ประจำ / จุดปฏิบัติงาน:
              </label>

              <button
                type="button"
                onClick={() => setIsAddingWorkplace(!isAddingWorkplace)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
              >
                {isAddingWorkplace ? '✕ ปิดแบบฟอร์ม' : '+ Admin สร้างจุดใหม่'}
              </button>
            </div>

            {/* Quick Add Workplace Drawer for Admin */}
            {isAddingWorkplace && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
                <span className="font-bold text-emerald-950 block text-[11px]">
                  ✨ กำหนดสถานที่/จุดปฏิบัติงานใหม่ (Admin Management):
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="เช่น คลินิกหลัก ห้องผ่าตัดย่อย, ศูนย์ไตเทียม..."
                    value={newWorkplaceName}
                    onChange={(e) => setNewWorkplaceName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs outline-none"
                  />
                  <select
                    value={newWorkplaceType}
                    onChange={(e) => setNewWorkplaceType(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs"
                  >
                    <option value="clinic">ในคลินิก</option>
                    <option value="hospital">โรงพยาบาล</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleCreateWorkplace}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs active:scale-95 transition shrink-0"
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            )}

            {/* Workplace Selector */}
            <select
              value={formData.workplace}
              onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 font-medium text-xs"
              required
            >
              <option value="" disabled>-- เลือกสถานที่ประจำ / จุดปฏิบัติงาน --</option>
              {workplaces.map((wp) => (
                <option key={wp.id} value={wp.name}>
                  {wp.type === 'hospital' ? '🏥' : '📍'} {wp.name}
                </option>
              ))}
            </select>

            {/* Quick Workplace Chips (Top 4) */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {workplaces.slice(0, 5).map((wp) => (
                <button
                  type="button"
                  key={wp.id}
                  onClick={() => setFormData({ ...formData, workplace: wp.name })}
                  className={`px-2 py-1 text-[11px] rounded-lg border transition truncate max-w-[200px] ${
                    formData.workplace === wp.name
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200'
                  }`}
                >
                  {wp.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
            <input
              type="text"
              placeholder="เช่น ประจำเคาน์เตอร์ต่างชาติ, สแตนด์บายฉุกเฉิน"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-700/20 active:scale-98 transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'กำลังบันทึก...' : 'ยืนยันจัดกะทำงาน (07:00 - 16:30 น.)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
