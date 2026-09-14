import React, { useState, useEffect } from 'react';
import { X, Coins, Stethoscope, Globe, Building2, Check, Calculator } from 'lucide-react';
import { createPayroll, fetchStaff, fetchInterpreters } from '../services/api';

export default function PayrollModal({ isOpen, onClose, onSaved, defaultCategory = 'medical_clinic' }) {
  const [category, setCategory] = useState(defaultCategory);
  const [staffList, setStaffList] = useState([]);
  const [interpList, setInterpList] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [formData, setFormData] = useState({
    work_date: new Date().toISOString().slice(0, 10),
    hours_worked: 8,
    rate_per_unit: 1600,
    travel_allowance: 0,
    special_bonus: 0,
    payment_method: 'โอนผ่านธนาคาร',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      loadPeople();
      updateDefaultsByCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  const loadPeople = async () => {
    try {
      const [sRes, iRes] = await Promise.all([fetchStaff(), fetchInterpreters()]);
      if (sRes.success) setStaffList(sRes.data);
      if (iRes.success) setInterpList(iRes.data);
      if (defaultCategory === 'medical_clinic' && sRes.data?.length > 0) {
        setSelectedPersonId(sRes.data[0].id);
      } else if (iRes.data?.length > 0) {
        setSelectedPersonId(iRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateDefaultsByCategory = (cat) => {
    if (cat === 'medical_clinic') {
      setFormData((prev) => ({ ...prev, hours_worked: 8, rate_per_unit: 1600, travel_allowance: 0 }));
    } else if (cat === 'interpreter_clinic') {
      setFormData((prev) => ({ ...prev, hours_worked: 8, rate_per_unit: 500, travel_allowance: 0 }));
    } else if (cat === 'interpreter_hospital') {
      setFormData((prev) => ({ ...prev, hours_worked: 3, rate_per_unit: 800, travel_allowance: 350 }));
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    updateDefaultsByCategory(cat);
    if (cat === 'medical_clinic') {
      if (staffList.length > 0) setSelectedPersonId(staffList[0].id);
    } else {
      if (interpList.length > 0) setSelectedPersonId(interpList[0].id);
    }
  };

  const calculatedTotal =
    (parseFloat(formData.hours_worked || 0) > 0
      ? parseFloat(formData.hours_worked || 0) * parseFloat(formData.rate_per_unit || 0)
      : parseFloat(formData.rate_per_unit || 0)) +
    parseFloat(formData.travel_allowance || 0) +
    parseFloat(formData.special_bonus || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeList = category === 'medical_clinic' ? staffList : interpList;
    const person = activeList.find((p) => p.id === selectedPersonId);

    if (!person) {
      alert('กรุณาเลือกผู้รับเงิน');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category,
        person_id: person.id,
        person_name: person.name,
        role_or_language: category === 'medical_clinic' ? person.role : person.languages,
        work_date: formData.work_date,
        hours_worked: formData.hours_worked,
        rate_per_unit: formData.rate_per_unit,
        travel_allowance: formData.travel_allowance,
        special_bonus: formData.special_bonus,
        payment_method: formData.payment_method,
        notes: formData.notes,
      };

      const res = await createPayroll(payload);
      if (res.success) {
        onSaved();
        onClose();
      } else {
        alert(res.message || 'บันทึกไม่สำเร็จ');
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
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">บันทึกรายการค่าจ้าง / ค่าตอบแทน</h3>
              <p className="text-xs text-slate-500">ระบบบัญชีคลินิกและงานล่าม</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          {/* Category Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">เลือกหมวดหมู่ค่าจ้าง:</label>
            <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => handleCategoryChange('medical_clinic')}
                className={`py-2 px-1 rounded-xl font-bold transition text-center truncate ${
                  category === 'medical_clinic' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                🩺 เมดิคอลคลินิก
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('interpreter_clinic')}
                className={`py-2 px-1 rounded-xl font-bold transition text-center truncate ${
                  category === 'interpreter_clinic' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                🌐 ล่ามคลินิก
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('interpreter_hospital')}
                className={`py-2 px-1 rounded-xl font-bold transition text-center truncate ${
                  category === 'interpreter_hospital' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                🏥 ล่ามออก รพ.
              </button>
            </div>
          </div>

          {/* Person Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {category === 'medical_clinic' ? 'เลือกแพทย์/พยาบาล/เจ้าหน้าที่:' : 'เลือกล่ามแปลภาษา:'}
            </label>
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
            >
              {category === 'medical_clinic'
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

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">วันที่ปฏิบัติงาน</label>
              <input
                type="date"
                value={formData.work_date}
                onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">จำนวนชั่วโมง / หน่วย</label>
              <input
                type="number"
                step="0.5"
                value={formData.hours_worked}
                onChange={(e) => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">อัตรา (บาท/ชม.)</label>
              <input
                type="number"
                value={formData.rate_per_unit}
                onChange={(e) => setFormData({ ...formData, rate_per_unit: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ค่าเดินทาง (บาท)</label>
              <input
                type="number"
                value={formData.travel_allowance}
                onChange={(e) => setFormData({ ...formData, travel_allowance: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เบี้ยเลี้ยง/OT</label>
              <input
                type="number"
                value={formData.special_bonus}
                onChange={(e) => setFormData({ ...formData, special_bonus: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Calculated Total Card */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-600" />
              ยอดเงินคำนวณสุทธิ:
            </span>
            <span className="text-base font-extrabold font-mono text-amber-900">
              ฿{calculatedTotal.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ / รายละเอียดเคส</label>
            <textarea
              rows={2}
              placeholder="เช่น ค่าเวรตรวจคลินิกพิเศษ หรือ แปลเคสฉุกเฉิน"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-700/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? 'กำลังบันทึก...' : 'ยืนยันสร้างรายการค่าจ้าง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
