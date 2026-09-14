import React, { useState, useEffect } from 'react';
import { 
  Coins, Stethoscope, Globe, Building2, PlusCircle, 
  CheckCircle2, Clock, Printer, Check, Calculator, ArrowUpRight
} from 'lucide-react';
import { fetchPayroll, updatePayrollStatus } from '../services/api';
import PayrollModal from '../components/PayrollModal';
import PayslipPrintModal from '../components/PayslipPrintModal';

export default function AccountingPayrollPage() {
  const [activeCategory, setActiveCategory] = useState('medical_clinic'); // 'medical_clinic', 'interpreter_clinic', 'interpreter_hospital'
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, pendingAmount: 0, paidAmount: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [printingRecord, setPrintingRecord] = useState(null);

  useEffect(() => {
    loadPayroll();
  }, [activeCategory, statusFilter]);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetchPayroll(activeCategory, statusFilter);
      if (res.success) {
        setRecords(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    await updatePayrollStatus(id, newStatus);
    loadPayroll();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[11px] font-bold tracking-wider text-amber-200 uppercase block mb-1">
            ส่วนงานบัญชีและค่าตอบแทน (Payroll & Accounting)
          </span>
          <h2 className="text-xl font-black tracking-tight">ระบบบัญชีค่าจ้าง 3 หมวด</h2>
          <p className="text-xs text-amber-100/80 mt-0.5">
            ค่าจ้างเมดิคอลคลินิก • ล่ามคลินิก • ล่ามปฏิบัติงาน รพ.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-xs text-center">
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-xs">
              <span className="text-amber-200 block text-[10px]">ยอดรวมทั้งหมด</span>
              <span className="text-sm font-extrabold font-mono text-white">
                ฿{summary.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-xs">
              <span className="text-amber-200 block text-[10px]">รออนุมัติ</span>
              <span className="text-sm font-extrabold font-mono text-amber-300">
                ฿{summary.pendingAmount.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-xs">
              <span className="text-amber-200 block text-[10px]">จ่ายเรียบร้อย</span>
              <span className="text-sm font-extrabold font-mono text-emerald-300">
                ฿{summary.paidAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Categories Segmented Control */}
      <div className="grid grid-cols-3 p-1.5 bg-slate-200/70 rounded-2xl gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveCategory('medical_clinic')}
          className={`py-2 rounded-xl transition text-center truncate ${
            activeCategory === 'medical_clinic'
              ? 'bg-white text-teal-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🩺 เมดิคอลคลินิก
        </button>
        <button
          onClick={() => setActiveCategory('interpreter_clinic')}
          className={`py-2 rounded-xl transition text-center truncate ${
            activeCategory === 'interpreter_clinic'
              ? 'bg-white text-emerald-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🌐 ล่ามคลินิก
        </button>
        <button
          onClick={() => setActiveCategory('interpreter_hospital')}
          className={`py-2 rounded-xl transition text-center truncate ${
            activeCategory === 'interpreter_hospital'
              ? 'bg-white text-amber-900 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏥 ล่ามออก รพ.
        </button>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            รออนุมัติ
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              statusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            จ่ายแล้ว
          </button>
        </div>

        <button
          onClick={() => setIsPayrollModalOpen(true)}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-700/20 active:scale-95 transition flex items-center gap-1 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          สร้างรายการค่าจ้าง
        </button>
      </div>

      {/* Payroll Records List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดรายการบัญชี...</div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
          <Coins className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-xs">ยังไม่มีรายการค่าจ้างในหมวดนี้</p>
          <p className="text-[11px] text-slate-400">กดปุ่ม "สร้างรายการค่าจ้าง" เพื่อบันทึกค่าตอบแทน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-amber-300 transition space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold block">
                    {rec.payroll_no} • {rec.work_date}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{rec.person_name}</h4>
                  <p className="text-xs text-slate-500">{rec.role_or_language}</p>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold font-mono text-slate-900 block">
                    ฿{rec.total_amount.toLocaleString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block mt-0.5 ${
                      rec.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.payment_status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.payment_status === 'paid'
                      ? '✓ จ่ายแล้ว'
                      : rec.payment_status === 'approved'
                      ? 'อนุมัติแล้ว'
                      : '⏳ รออนุมัติ'}
                  </span>
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-2xl text-[10px] text-center">
                <div>
                  <span className="text-slate-400 block">เวลาทำงาน</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {rec.hours_worked > 0 ? `${rec.hours_worked} ชม.` : '1 กะ'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">อัตราค่าจ้าง</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ฿{rec.rate_per_unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">ค่าเดินทาง/OT</span>
                  <span className="font-bold text-amber-700 font-mono">
                    ฿{(rec.travel_allowance + rec.special_bonus).toLocaleString()}
                  </span>
                </div>
              </div>

              {rec.notes && (
                <p className="text-[11px] text-slate-500 bg-slate-50/60 p-2 rounded-xl italic">
                  "{rec.notes}"
                </p>
              )}

              {/* Status Action Buttons & Print Payslip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setPrintingRecord(rec)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] flex items-center gap-1 active:scale-95 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  พิมพ์สลิป/ใบสำคัญจ่าย
                </button>

                <div className="flex items-center gap-1.5">
                  {rec.payment_status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'approved')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px] active:scale-95 transition"
                    >
                      อนุมัติยอด
                    </button>
                  )}
                  {rec.payment_status !== 'paid' && (
                    <button
                      onClick={() => handleUpdateStatus(rec.id, 'paid')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[11px] active:scale-95 transition flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      จ่ายเงินแล้ว
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payroll Modal */}
      <PayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        onSaved={loadPayroll}
        defaultCategory={activeCategory}
      />

      {/* Printable Payslip Modal */}
      <PayslipPrintModal
        isOpen={!!printingRecord}
        onClose={() => setPrintingRecord(null)}
        record={printingRecord}
      />
    </div>
  );
}
