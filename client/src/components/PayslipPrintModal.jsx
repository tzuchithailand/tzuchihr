import React from 'react';
import { X, Printer, Stethoscope, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PayslipPrintModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const getCategoryTitle = (cat) => {
    if (cat === 'medical_clinic') return 'ค่าตอบแทนเมดิคอลทีม (คลินิก)';
    if (cat === 'interpreter_clinic') return 'ค่าตอบแทนล่ามประจำคลินิก';
    if (cat === 'interpreter_hospital') return 'ค่าตอบแทนล่ามปฏิบัติงานโรงพยาบาล';
    return 'ใบสำคัญจ่ายค่าตอบแทน';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-[500px] rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:m-0 print:w-full print:max-w-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between print:hidden">
          <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-emerald-600" />
            ใบสำคัญจ่ายค่าตอบแทน (Payment Voucher)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์เอกสาร
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Voucher Sheet */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-800 bg-white">
          {/* Header */}
          <div className="text-center border-b border-slate-300 pb-3 space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 tracking-wide">
              TZUCHI MEDICAL & CLINIC FOUNDATION
            </h2>
            <p className="text-xs text-slate-600">
              ศูนย์บริการทางการแพทย์และบริการล่ามโรงพยาบาลมาตรฐานสากล
            </p>
            <div className="pt-1">
              <span className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                ใบสำคัญจ่ายค่าตอบแทน / COMPENSATION VOUCHER
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px]">
            <div>
              <span className="text-slate-500 block">เลขที่เอกสาร:</span>
              <span className="font-mono font-bold text-slate-900">{record.payroll_no}</span>
            </div>
            <div>
              <span className="text-slate-500 block">วันที่ปฏิบัติงาน:</span>
              <span className="font-semibold text-slate-900">{record.work_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">หมวดหมู่งาน:</span>
              <span className="font-semibold text-teal-800">{getCategoryTitle(record.category)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">สถานะการจ่าย:</span>
              <span
                className={`font-bold ${
                  record.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {record.payment_status === 'paid' ? '✓ ชำระเงินเรียบร้อยแล้ว' : '⏳ รออนุมัติการจ่าย'}
              </span>
            </div>
          </div>

          {/* Payee Info */}
          <div className="border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              ข้อมูลผู้รับเงิน (PAYEE)
            </span>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 text-sm">{record.person_name}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                {record.role_or_language}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-200 p-2 text-left">รายการคำนวณ</th>
                <th className="border border-slate-200 p-2 text-center w-16">จำนวน</th>
                <th className="border border-slate-200 p-2 text-right w-20">อัตรา</th>
                <th className="border border-slate-200 p-2 text-right w-24">รวม (บาท)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 p-2">
                  ค่าตอบแทนการปฏิบัติงาน ({record.role_or_language})
                </td>
                <td className="border border-slate-200 p-2 text-center font-mono">
                  {record.hours_worked > 0 ? `${record.hours_worked} ชม.` : '1 กะ'}
                </td>
                <td className="border border-slate-200 p-2 text-right font-mono">
                  ฿{record.rate_per_unit.toLocaleString()}
                </td>
                <td className="border border-slate-200 p-2 text-right font-mono font-bold">
                  ฿
                  {(record.hours_worked > 0
                    ? record.hours_worked * record.rate_per_unit
                    : record.rate_per_unit
                  ).toLocaleString()}
                </td>
              </tr>
              {record.travel_allowance > 0 && (
                <tr>
                  <td className="border border-slate-200 p-2">ค่าพาหนะ / เดินทางไปปฏิบัติงาน รพ.</td>
                  <td className="border border-slate-200 p-2 text-center font-mono">1 เคส</td>
                  <td className="border border-slate-200 p-2 text-right font-mono">
                    ฿{record.travel_allowance.toLocaleString()}
                  </td>
                  <td className="border border-slate-200 p-2 text-right font-mono font-bold">
                    ฿{record.travel_allowance.toLocaleString()}
                  </td>
                </tr>
              )}
              {record.special_bonus > 0 && (
                <tr>
                  <td className="border border-slate-200 p-2">ค่าทำงานล่วงเวลา (OT) / เบี้ยเลี้ยงพิเศษ</td>
                  <td className="border border-slate-200 p-2 text-center font-mono">-</td>
                  <td className="border border-slate-200 p-2 text-right font-mono">
                    ฿{record.special_bonus.toLocaleString()}
                  </td>
                  <td className="border border-slate-200 p-2 text-right font-mono font-bold">
                    ฿{record.special_bonus.toLocaleString()}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-50 font-extrabold">
                <td colSpan={3} className="border border-slate-200 p-2.5 text-right">
                  ยอดสุทธิที่ต้องจ่าย (NET PAYABLE):
                </td>
                <td className="border border-slate-200 p-2.5 text-right text-sm text-emerald-800 font-mono">
                  ฿{record.total_amount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {record.notes && (
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
              หมายเหตุ: {record.notes}
            </p>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-300 text-center text-[11px]">
            <div className="space-y-6">
              <div className="h-8 border-b border-dashed border-slate-400"></div>
              <span>(ลงชื่อ)....................................................</span>
              <span className="block text-slate-500">ผู้รับเงิน / บุคลากร</span>
            </div>
            <div className="space-y-6">
              <div className="h-8 border-b border-dashed border-slate-400"></div>
              <span>(ลงชื่อ)....................................................</span>
              <span className="block text-slate-500">ผู้อนุมัติจ่าย / ฝ่ายการเงินและบัญชี</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
