import React, { useState, useEffect } from 'react';
import { X, UserPlus, Stethoscope, Phone, Mail, FileText, Check } from 'lucide-react';
import { createStaff, updateStaff } from '../services/api';

export default function StaffModal({ isOpen, onClose, onSaved, staffToEdit = null }) {
  const [formData, setFormData] = useState({
    name: '',
    role: 'แพทย์',
    department: 'แผนกอายุรกรรม',
    license_no: '',
    phone: '',
    email: '',
    line_id: '',
    shift_rate: 3500,
    status: 'active',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staffToEdit) {
      setFormData(staffToEdit);
    } else {
      setFormData({
        name: '',
        role: 'แพทย์',
        department: 'แผนกอายุรกรรม',
        license_no: '',
        phone: '',
        email: '',
        line_id: '',
        shift_rate: 3500,
        status: 'active',
        notes: '',
      });
    }
  }, [isOpen, staffToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (staffToEdit) {
        res = await updateStaff(staffToEdit.id, formData);
      } else {
        res = await createStaff(formData);
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
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {staffToEdit ? 'แก้ไขข้อมูลเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่เมดิคอลทีม'}
              </h3>
              <p className="text-xs text-slate-500">ข้อมูลแพทย์ พยาบาล บุคลากรทางการแพทย์</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล (พร้อมคำนำหน้า)</label>
            <input
              type="text"
              placeholder="เช่น นพ. เกียรติศักดิ์ เจริญดี"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งวิชาชีพ</label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  const defaultRate = newRole === 'แพทย์' ? 3500 : newRole === 'พยาบาลวิชาชีพ' ? 1600 : 1200;
                  setFormData({ ...formData, role: newRole, shift_rate: defaultRate });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              >
                <option value="แพทย์">แพทย์ (Doctor)</option>
                <option value="พยาบาลวิชาชีพ">พยาบาลวิชาชีพ (RN)</option>
                <option value="ผู้ช่วยพยาบาล">ผู้ช่วยพยาบาล (PN/NA)</option>
                <option value="ประสานงาน">เจ้าหน้าที่ประสานงาน</option>
                <option value="เภสัชกร">เภสัชกร (Pharmacist)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">แผนก/คลินิก</label>
              <input
                type="text"
                placeholder="เช่น แผนกอายุรกรรม"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">เลขที่ใบประกอบวิชาชีพ</label>
              <input
                type="text"
                placeholder="เช่น ว. 45892"
                value={formData.license_no}
                onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ค่าเวร/ค่าตอบแทนมาตรฐาน (บาท)</label>
              <input
                type="number"
                value={formData.shift_rate}
                onChange={(e) => setFormData({ ...formData, shift_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
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
                <option value="active">ปกติ (Active)</option>
                <option value="on_leave">ลางาน (On Leave)</option>
                <option value="inactive">พ้นสภาพ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ / ประวัติเฉพาะทาง</label>
            <textarea
              rows={2}
              placeholder="เช่น ความเชี่ยวชาญพิเศษ, วันสะดวกเข้าเวร"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-700/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลเจ้าหน้าที่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
