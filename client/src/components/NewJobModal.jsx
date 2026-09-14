import React, { useState, useEffect } from 'react';
import { X, Building2, User, Globe, Calendar, FileText, PlusCircle } from 'lucide-react';
import { fetchHospitals, createJob } from '../services/api';

export default function NewJobModal({ isOpen, onClose, onCreated, interpreterName }) {
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    interpreter_name: interpreterName || 'สมชาย ล่ามมือโปร',
    hospital_name: '',
    department: 'อายุรกรรม (Internal Medicine)',
    patient_name: '',
    patient_hn: '',
    language: 'ภาษาญี่ปุ่น (Japanese)',
    appointment_time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    summary_notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHospitals().then((res) => {
        if (res.success) setHospitals(res.data);
      });
      setFormData((prev) => ({
        ...prev,
        interpreter_name: interpreterName || 'สมชาย ล่ามมือโปร',
        appointment_time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }));
    }
  }, [isOpen, interpreterName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospital_name || !formData.patient_name) {
      alert('กรุณากรอกชื่อโรงพยาบาลและชื่อผู้ป่วย');
      return;
    }

    setLoading(true);
    try {
      const res = await createJob(formData);
      if (res.success) {
        onCreated(res.data);
        onClose();
      } else {
        alert(res.message || 'เกิดข้อผิดพลาดในการบันทึกงาน');
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
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">เปิดเคสงานล่ามใหม่</h3>
              <p className="text-xs text-slate-500">บันทึกข้อมูลงานไปปฏิบัติงานที่โรงพยาบาล</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Interpreter Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อล่ามผู้รับผิดชอบ
            </label>
            <input
              type="text"
              value={formData.interpreter_name}
              onChange={(e) => setFormData({ ...formData, interpreter_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
              required
            />
          </div>

          {/* Hospital Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              โรงพยาบาลปลายทาง
            </label>
            <input
              type="text"
              list="hospital-options"
              placeholder="พิมพ์ค้นหาหรือเลือกโรงพยาบาล"
              value={formData.hospital_name}
              onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
              required
            />
            <datalist id="hospital-options">
              {hospitals.map((h, i) => (
                <option key={i} value={h.name} />
              ))}
            </datalist>
            {/* Quick hospital chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hospitals.slice(0, 4).map((h, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, hospital_name: h.name })}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg border border-slate-200/60 transition truncate max-w-[200px]"
                >
                  {h.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Department & Language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                แผนก / คลินิก
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-xs"
              >
                <option value="อายุรกรรม (Internal Medicine)">อายุรกรรม (Medicine)</option>
                <option value="ศัลยกรรม (Surgery)">ศัลยกรรม (Surgery)</option>
                <option value="กระดูกและข้อ (Orthopedic)">กระดูกและข้อ (Ortho)</option>
                <option value="ศูนย์ตรวจสุขภาพ (Health Check-up)">ศูนย์ตรวจสุขภาพ (Check-up)</option>
                <option value="ฉุกเฉิน (Emergency ER)">ฉุกเฉิน (ER)</option>
                <option value="หู คอ จมูก (ENT)">หู คอ จมูก (ENT)</option>
                <option value="สูตินรีเวช (OB-GYN)">สูตินรีเวช (OB-GYN)</option>
                <option value="กุมารเวช (Pediatrics)">กุมารเวช (Pediatrics)</option>
                <option value="ทันตกรรม (Dental)">ทันตกรรม (Dental)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ภาษาที่ใช้แปล
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-xs"
              >
                <option value="ภาษาญี่ปุ่น (Japanese)">ภาษาญี่ปุ่น (Japanese)</option>
                <option value="ภาษาอังกฤษ (English)">ภาษาอังกฤษ (English)</option>
                <option value="ภาษาจีน (Chinese)">ภาษาจีน (Chinese)</option>
                <option value="ภาษาเกาหลี (Korean)">ภาษาเกาหลี (Korean)</option>
                <option value="ภาษาพม่า (Burmese)">ภาษาพม่า (Burmese)</option>
                <option value="ภาษาอาหรับ (Arabic)">ภาษาอาหรับ (Arabic)</option>
                <option value="ภาษาฝรั่งเศส (French)">ภาษาฝรั่งเศส (French)</option>
                <option value="ภาษาเยอรมัน (German)">ภาษาเยอรมัน (German)</option>
              </select>
            </div>
          </div>

          {/* Patient Name & HN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ป่วย (Patient Name)
              </label>
              <input
                type="text"
                placeholder="เช่น Mr. Tanaka"
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสคนไข้ (HN)
              </label>
              <input
                type="text"
                placeholder="เช่น HN-123456"
                value={formData.patient_hn}
                onChange={(e) => setFormData({ ...formData, patient_hn: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
              />
            </div>
          </div>

          {/* Appointment Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วัน-เวลานัดหมาย
            </label>
            <input
              type="text"
              value={formData.appointment_time}
              onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
            />
          </div>

          {/* Initial Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึก / อาการเบื้องต้น
            </label>
            <textarea
              rows={2}
              placeholder="อาการสำคัญ หรือข้อควรระวัง เช่น ประวัติแพ้ยา"
              value={formData.summary_notes}
              onChange={(e) => setFormData({ ...formData, summary_notes: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-700/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {loading ? 'กำลังบันทึก...' : 'ยืนยันสร้างเคสงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
