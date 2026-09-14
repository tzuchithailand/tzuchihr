import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Building2, Globe, Users, Coins, 
  Printer, Download, ShieldCheck, Calendar, FileText, CheckCircle2
} from 'lucide-react';
import { fetchExecutiveReport, fetchJobs } from '../services/api';

export default function ReportsDashboard() {
  const [reportData, setReportData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const [rRes, jRes] = await Promise.all([fetchExecutiveReport(), fetchJobs()]);
      if (rRes.success) setReportData(rRes.data);
      if (jRes.success) setJobs(jRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (jobs.length === 0) return;
    let csv = 'Job No,Hospital,Department,Patient Name,HN,Language,Status,Checkin Time,Checkout Time\n';
    jobs.forEach((j) => {
      csv += `"${j.job_no}","${j.hospital_name}","${j.department}","${j.patient_name}","${j.patient_hn}","${j.language}","${j.status}","${j.checkin_time || ''}","${j.checkout_time || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tzuchi_hospital_missions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !reportData) {
    return <div className="p-8 text-center text-slate-400 text-xs">กำลังประมวลผลรายงานทั้งระบบ...</div>;
  }

  const { kpi, languageStats, hospitalStats, payrollByCategory } = reportData;

  return (
    <div className="space-y-4 pb-24 print:p-4 print:pb-0">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-rose-700 via-rose-800 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden print:bg-none print:text-black print:p-0">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-rose-200 uppercase block mb-1">
              ระบบรายงานและวิเคราะห์ข้อมูล (Executive Reports)
            </span>
            <h2 className="text-xl font-black tracking-tight">รายงานภาพรวมทั้งระบบ</h2>
            <p className="text-xs text-rose-100/80 mt-0.5">
              สรุปเคสงานล่าม • สถิติบุคลากร • เวลาสแกน HIP • ค่าใช้จ่ายบัญชี
            </p>
          </div>

          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handleExportCSV}
              className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white active:scale-95 transition"
              title="ส่งออก CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white active:scale-95 transition"
              title="พิมพ์รายงาน"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">ภารกิจล่าม รพ.</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block font-mono">
            {kpi.totalJobs} <span className="text-xs font-normal text-slate-400">เคส</span>
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block">
            ✓ เสร็จสิ้นแล้ว {kpi.completedJobs} เคส
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">ยอดจ่ายค่าตอบแทน</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-black text-slate-900 block font-mono truncate">
            ฿{kpi.payrollTotal.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">
            จ่ายแล้ว ฿{kpi.payrollPaid.toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">บุคลากรทั้งหมด</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 block font-mono">
            {kpi.totalStaff + kpi.totalInterpreters}{' '}
            <span className="text-xs font-normal text-slate-400">ท่าน</span>
          </span>
          <span className="text-[10px] text-teal-700 font-semibold block">
            แพทย์/พยาบาล {kpi.totalStaff} • ล่าม {kpi.totalInterpreters}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">เข้างานตรงเวลา (HIP)</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-900 block font-mono">
            {kpi.onTimeRate}%
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold block">
            บันทึกสแกน {kpi.totalAttendanceScans} ครั้ง
          </span>
        </div>
      </div>

      {/* Language Demand Distribution */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-teal-600" />
          สัดส่วนการให้บริการล่ามตามภาษา
        </h3>
        <div className="space-y-2">
          {languageStats.map((item, idx) => {
            const total = kpi.totalJobs || 1;
            const pct = Math.round((item.count / total) * 100);
            return (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>{item.language}</span>
                  <span className="font-mono text-slate-500">
                    {item.count} เคส ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospital Frequency */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-600" />
          โรงพยาบาลที่มีการส่งล่ามไปปฏิบัติงานสูงสุด
        </h3>
        <div className="space-y-2">
          {hospitalStats.map((h, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-800 truncate">{h.hospital_name}</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 shrink-0 ml-2">
                {h.count} เคส
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payroll by Category Summary */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-600" />
          สรุปค่าใช้จ่ายตามหมวดหมู่บัญชี 3 ส่วน
        </h3>
        <div className="space-y-2 text-xs">
          {payrollByCategory.map((cat, idx) => {
            let label = 'ค่าจ้างเมดิคอลคลินิก';
            let color = 'text-teal-800';
            if (cat.category === 'interpreter_clinic') {
              label = 'ค่าจ้างล่ามประจำคลินิก';
              color = 'text-emerald-800';
            } else if (cat.category === 'interpreter_hospital') {
              label = 'ค่าจ้างล่ามปฏิบัติงาน รพ.';
              color = 'text-amber-800';
            }
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl"
              >
                <div>
                  <span className={`font-bold ${color} block`}>{label}</span>
                  <span className="text-[11px] text-slate-400">{cat.count} รายการ</span>
                </div>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  ฿{cat.total.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
