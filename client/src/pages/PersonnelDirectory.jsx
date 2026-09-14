import React, { useState, useEffect } from 'react';
import { 
  Users, Stethoscope, Globe, Search, PlusCircle, Phone, 
  Mail, Star, ShieldCheck, Edit3, Trash2, Building2, CheckCircle2
} from 'lucide-react';
import { fetchStaff, fetchInterpreters, deleteStaff, deleteInterpreter } from '../services/api';
import StaffModal from '../components/StaffModal';
import InterpreterModal from '../components/InterpreterModal';

export default function PersonnelDirectory() {
  const [activeTab, setActiveTab] = useState('medical'); // 'medical' or 'interpreter'
  const [staffList, setStaffList] = useState([]);
  const [interpList, setInterpList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isInterpModalOpen, setIsInterpModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [interpToEdit, setInterpToEdit] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, iRes] = await Promise.all([fetchStaff(), fetchInterpreters()]);
      if (sRes.success) setStaffList(sRes.data);
      if (iRes.success) setInterpList(iRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (window.confirm(`ยืนยันการลบเจ้าหน้าที่ "${name}" หรือไม่?`)) {
      await deleteStaff(id);
      loadData();
    }
  };

  const handleDeleteInterp = async (id, name) => {
    if (window.confirm(`ยืนยันการลบล่าม "${name}" หรือไม่?`)) {
      await deleteInterpreter(id);
      loadData();
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staff_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInterpreters = interpList.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.languages.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.interpreter_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-wider text-teal-200 uppercase block mb-1">
            ฐานข้อมูลบุคลากรการแพทย์และล่าม
          </span>
          <h2 className="text-xl font-black tracking-tight">บุคลากรคลินิก (Personnel)</h2>
          <p className="text-xs text-teal-100/80 mt-1">
            แยกฐานข้อมูลแพทย์ พยาบาล และทีมล่ามเฉพาะทางอย่างเป็นระบบ
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
              <span className="text-teal-200 block text-[11px]">เมดิคอลทีม (แพทย์/พยาบาล)</span>
              <span className="text-lg font-bold text-white">{staffList.length} ท่าน</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
              <span className="text-teal-200 block text-[11px]">ทีมล่ามแปลภาษา</span>
              <span className="text-lg font-bold text-emerald-300">{interpList.length} ท่าน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Switcher */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 rounded-2xl gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('medical')}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === 'medical'
              ? 'bg-white text-teal-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-teal-600" />
          เมดิคอลทีม ({staffList.length})
        </button>

        <button
          onClick={() => setActiveTab('interpreter')}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
            activeTab === 'interpreter'
              ? 'bg-white text-emerald-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          ทีมล่าม ({interpList.length})
        </button>
      </div>

      {/* Search and Action Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'medical' ? 'ค้นหาแพทย์, พยาบาล, แผนก...' : 'ค้นหาล่าม, ภาษา...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        <button
          onClick={() => {
            if (activeTab === 'medical') {
              setStaffToEdit(null);
              setIsStaffModalOpen(true);
            } else {
              setInterpToEdit(null);
              setIsInterpModalOpen(true);
            }
          }}
          className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-700/20 active:scale-95 transition flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {activeTab === 'medical' ? 'เพิ่มเจ้าหน้าที่' : 'เพิ่มล่าม'}
        </button>
      </div>

      {/* Lists */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดข้อมูลบุคลากร...</div>
      ) : activeTab === 'medical' ? (
        /* MEDICAL STAFF LIST */
        <div className="space-y-3">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-300 transition space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{staff.name}</h4>
                    <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      {staff.role} • {staff.department}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">
                  {staff.staff_code}
                </span>
              </div>

              {staff.license_no && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                  <span>ใบประกอบวิชาชีพ: {staff.license_no}</span>
                  <span className="font-semibold text-slate-700">
                    ค่าเวร: ฿{staff.shift_rate.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Contact and Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  {staff.phone && (
                    <a
                      href={`tel:${staff.phone}`}
                      className="flex items-center gap-1 text-emerald-600 font-medium hover:underline text-[11px]"
                    >
                      <Phone className="w-3 h-3" /> {staff.phone}
                    </a>
                  )}
                  {staff.line_id && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      LINE: {staff.line_id}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setStaffToEdit(staff);
                      setIsStaffModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100 transition"
                    title="แก้ไข"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* INTERPRETER LIST */
        <div className="space-y-3">
          {filteredInterpreters.map((interp) => (
            <div
              key={interp.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{interp.name}</span>
                      <span className="text-amber-500 flex items-center text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                        {interp.rating}
                      </span>
                    </h4>
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      {interp.languages}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    interp.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : interp.status === 'on_duty'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {interp.status === 'available'
                    ? 'พร้อมรับงาน'
                    : interp.status === 'on_duty'
                    ? 'เข้าเวร/แปล'
                    : 'ไม่ว่าง'}
                </span>
              </div>

              {/* Rates breakdown */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-2xl text-center text-[10px]">
                <div>
                  <span className="text-slate-400 block">แปลคลินิก</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ฿{interp.hourly_rate_clinic}/ชม.
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">แปลออก รพ.</span>
                  <span className="font-bold text-teal-800 font-mono">
                    ฿{interp.hourly_rate_hospital}/ชม.
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">ค่าเดินทาง รพ.</span>
                  <span className="font-bold text-amber-700 font-mono">
                    ฿{interp.travel_allowance}
                  </span>
                </div>
              </div>

              {interp.certification && (
                <p className="text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded-xl">
                  🎓 {interp.certification}
                </p>
              )}

              {/* Contact and Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  {interp.phone && (
                    <a
                      href={`tel:${interp.phone}`}
                      className="flex items-center gap-1 text-emerald-600 font-bold hover:underline text-[11px]"
                    >
                      <Phone className="w-3 h-3" /> {interp.phone}
                    </a>
                  )}
                  {interp.line_id && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      LINE: {interp.line_id}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setInterpToEdit(interp);
                      setIsInterpModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                    title="แก้ไข"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteInterp(interp.id, interp.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSaved={loadData}
        staffToEdit={staffToEdit}
      />

      <InterpreterModal
        isOpen={isInterpModalOpen}
        onClose={() => setIsInterpModalOpen(false)}
        onSaved={loadData}
        interpToEdit={interpToEdit}
      />
    </div>
  );
}
