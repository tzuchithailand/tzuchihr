import React, { useState, useEffect } from 'react';
import { X, Globe, Phone, Star, FileText, Check, Car } from 'lucide-react';
import { createInterpreter, updateInterpreter } from '../services/api';

export default function InterpreterModal({ isOpen, onClose, onSaved, interpToEdit = null }) {
  const [formData, setFormData] = useState({
    name: '',
    languages: 'ภาษาญี่ปุ่น, ภาษาอังกฤษ',
    certification: 'JLPT N1 / ประกาศนียบัตรล่ามแพทย์',
    experience_years: 3,
    hourly_rate_clinic: 500,
    hourly_rate_hospital: 800,
    travel_allowance: 350,
    phone: '',
    email: '',
    line_id: '',
    status: 'available',
    preferred_hospitals: 'รพ.บำรุงราษฎร์, รพ.กรุงเทพ',
    rating: 5.0,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (interpToEdit) {
      setFormData(interpToEdit);
    } else {
      setFormData({
        name: '',
        languages: 'ภาษาญี่ปุ่น, ภาษาอังกฤษ',
        certification: 'JLPT N1 / ประกาศนียบัตรล่ามแพทย์',
        experience_years: 3,
        hourly_rate_clinic: 500,
        hourly_rate_hospital: 800,
        travel_allowance: 350,
        phone: '',
        email: '',
        line_id: '',
        status: 'available',
        preferred_hospitals: 'รพ.บำรุงราษฎร์, รพ.กรุงเทพ',
        rating: 5.0,
        notes: '',
      });
    }
  }, [isOpen, interpToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.languages) {
      alert('กรุณากรอกชื่อและภาษาที่เชี่ยวชาญ');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (interpToEdit) {
        res = await updateInterpreter(interpToEdit.id, formData);
      } else {
        res = await createInterpreter(formData);
      }
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
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {interpToEdit ? 'แก้ไขข้อมูลล่าม' : 'เพิ่มล่ามแปลภาษาใหม่'}
              </h3>
              <p className="text-xs text-slate-500">ฐานข้อมูลล่ามแพทย์และอัตราค่าบริการ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล ล่าม</label>
            <input
              type="text"
              placeholder="เช่น คุณกฤษณะ ล่ามญี่ปุ่นอาวุโส"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ภาษาที่เชี่ยวชาญ</label>
              <input
                type="text"
                placeholder="เช่น ภาษาญี่ปุ่น, ภาษาอังกฤษ"
                value={formData.languages}
                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">วุฒิบัตร / ระดับภาษา</label>
              <input
                type="text"
                placeholder="เช่น JLPT N1, HSK 6"
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">แปลในคลินิก (บ./ชม.)</label>
              <input
                type="number"
                value={formData.hourly_rate_clinic}
                onChange={(e) => setFormData({ ...formData, hourly_rate_clinic: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">แปลออก รพ. (บ./ชม.)</label>
              <input
                type="number"
                value={formData.hourly_rate_hospital}
                onChange={(e) => setFormData({ ...formData, hourly_rate_hospital: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ค่าเดินทาง รพ. (บาท)</label>
              <input
                type="number"
                value={formData.travel_allowance}
                onChange={(e) => setFormData({ ...formData, travel_allowance: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                placeholder="08x-xxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">LINE ID</label>
              <input
                type="text"
                placeholder="line_id"
                value={formData.line_id}
                onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">สถานะ</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="available">พร้อมรับงาน (Available)</option>
                <option value="on_duty">กำลังปฏิบัติงาน (On Duty)</option>
                <option value="off_duty">ไม่ว่าง (Off Duty)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">โรงพยาบาล/พื้นที่ที่สะดวกเดินทาง</label>
            <input
              type="text"
              placeholder="เช่น รพ.บำรุงราษฎร์, รพ.กรุงเทพ, โซนสุขุมวิท"
              value={formData.preferred_hospitals}
              onChange={(e) => setFormData({ ...formData, preferred_hospitals: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ / ความเชี่ยวชาญการแพทย์</label>
            <textarea
              rows={2}
              placeholder="เช่น มีความรู้ด้านศัลยกรรมกระดูก, สามารถแปลเคสฉุกเฉินตอนดึกได้"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลล่าม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
