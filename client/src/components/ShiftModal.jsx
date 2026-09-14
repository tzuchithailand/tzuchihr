import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Stethoscope, Globe, Building2, Check } from 'lucide-react';
import { createShift, fetchStaff, fetchInterpreters } from '../services/api';

export default function ShiftModal({ isOpen, onClose, onSaved, defaultTeamType = 'medical' }) {
  const [teamType, setTeamType] = useState(defaultTeamType);
  const [staffList, setStaffList] = useState([]);
  const [interpList, setInterpList] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [formData, setFormData] = useState({
    shift_name: 'กะเช้า (08:00 - 16:00)',
    shift_date: new Date().toISOString().slice(0, 10),
    start_time: '08:00',
    end_time: '16:00',
    workplace: 'คลินิกหลัก',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeamType(defaultTeamType);
      loadPeople();
    }
  }, [isOpen, defaultTeamType]);

  const loadPeople = async () => {
    try {
      const [sRes, iRes] = await Promise.all([fetchStaff(), fetchInterpreters()]);
      if (sRes.success) setStaffList(sRes.data);
      if (iRes.success) setInterpList(iRes.data);
      if (defaultTeamType === 'medical' && sRes.data?.length > 0) {
        setSelectedPersonId(sRes.data[0].id);
      } else if (iRes.data?.length > 0) {
        setSelectedPersonId(iRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShiftPreset = (preset) => {
    if (preset === 'morning') {
      setFormData({ ...formData, shift_name: 'กะเช้า (08:00 - 16:00)', start_time: '08:00', end_time: '16:00' });
    } else if (preset === 'afternoon') {
      setFormData({ ...formData, shift_name: 'กะบ่าย (14:00 - 22:00)', start_time: '14:00', end_time: '22:00' });
    } else if (preset === 'night') {
      setFormData({ ...formData, shift_name: 'กะดึก/On-Call (22:00 - 08:00)', start_time: '22:00', end_time: '08:00' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeList = teamType === 'medical' ? staffList : interpList;
    const person = activeList.find((p) => p.id === selectedPersonId);

    if (!person) {
      alert('กรุณาเลือกผู้ปฏิบัติงาน');
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
      <div className="bg-white w-full max-w-[500px] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">จัดกะการทำงาน (Shift Schedule)</h3>
              <p className="text-xs text-slate-500">เลือกทีมและกำหนดเวลาเข้าเวร</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          {/* Team Switcher Segmented Control */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">เลือกทีมที่ต้องการจัดกะ:</label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setTeamType('medical');
                  if (staffList.length > 0) setSelectedPersonId(staffList[0].id);
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  teamType === 'medical'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                เมดิคอลทีม (แพทย์/พยาบาล)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeamType('interpreter');
                  if (interpList.length > 0) setSelectedPersonId(interpList[0].id);
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  teamType === 'interpreter'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-4 h-4" />
                ทีมล่ามแปลภาษา
              </button>
            </div>
          </div>

          {/* Person Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {teamType === 'medical' ? 'เลือกแพทย์/พยาบาล/เจ้าหน้าที่:' : 'เลือกล่ามแปลภาษา:'}
            </label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 font-medium"
            >
              {teamType === 'medical'
                ? staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role} - {s.department})
                    </option>
                  ))
                : interpList.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.languages})
                    </option>
                  ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ช่วงเวลากะมาตรฐาน:</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleShiftPreset('morning')}
                className="p-1.5 text-center bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg border border-slate-200/60 font-medium"
              >
                กะเช้า (08-16)
              </button>
              <button
                type="button"
                onClick={() => handleShiftPreset('afternoon')}
                className="p-1.5 text-center bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg border border-slate-200/60 font-medium"
              >
                กะบ่าย (14-22)
              </button>
              <button
                type="button"
                onClick={() => handleShiftPreset('night')}
                className="p-1.5 text-center bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg border border-slate-200/60 font-medium"
              >
                กะดึก/On-Call
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">วันที่เข้าเวร</label>
              <input
                type="date"
                value={formData.shift_date}
                onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เวลาเริ่ม</label>
              <input
                type="text"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เวลาสิ้นสุด</label>
              <input
                type="text"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">สถานที่ประจำ / จุดปฏิบัติงาน</label>
            <input
              type="text"
              placeholder="เช่น คลินิกหลัก ห้องตรวจ 1 หรือ รพ.บำรุงราษฎร์"
              value={formData.workplace}
              onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุกะงาน</label>
            <input
              type="text"
              placeholder="เช่น ประจำเคาน์เตอร์ต่างชาติ, สแตนด์บายฉุกเฉิน"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-700/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? 'กำลังบันทึก...' : 'ยืนยันจัดกะทำงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
