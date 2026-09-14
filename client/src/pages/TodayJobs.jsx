import React from 'react';
import { 
  Building2, User, Clock, CheckCircle2, AlertCircle, ChevronRight, 
  MapPin, PlusCircle, FileText, Globe
} from 'lucide-react';

export default function TodayJobs({ jobs, onSelectJob, onOpenNewJobModal, loading }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'assigned':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> รอเช็คอินหน้างาน
          </span>
        );
      case 'checked_in':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3" /> เช็คอินแล้ว
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-full flex items-center gap-1">
            <FileText className="w-3 h-3" /> กำลังแปล / มีเอกสาร
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> เสร็จสิ้นภารกิจ
          </span>
        );
      default:
        return null;
    }
  };

  const assignedCount = jobs.filter((j) => j.status === 'assigned').length;
  const inProgressCount = jobs.filter((j) => ['checked_in', 'in_progress'].includes(j.status)).length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner / Today Summary */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-100">
              ตารางงานล่ามพยาบาลวันนี้
            </span>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              {new Date().toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
          <h2 className="text-xl font-bold">ภารกิจล่ามประจำวัน</h2>
          <p className="text-xs text-emerald-100 mt-1">
            ระบบเช็คอิน GPS และส่งรูปใบรับรองแพทย์คนไข้ทันทีจากมือถือ
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20">
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
              <span className="text-xs text-emerald-100 block">รอเช็คอิน</span>
              <span className="text-lg font-bold text-amber-300">{assignedCount}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
              <span className="text-xs text-emerald-100 block">กำลังทำ</span>
              <span className="text-lg font-bold text-cyan-300">{inProgressCount}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-xs">
              <span className="text-xs text-emerald-100 block">เสร็จแล้ว</span>
              <span className="text-lg font-bold text-emerald-200">{completedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <span>รายการงาน ({jobs.length})</span>
        </h3>

        <button
          onClick={onOpenNewJobModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition"
        >
          <PlusCircle className="w-4 h-4" />
          เปิดเคสงานใหม่
        </button>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          กำลังโหลดรายการงาน...
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium text-sm">ยังไม่มีงานในวันนี้</p>
          <p className="text-xs text-slate-400">กดปุ่มด้านบนเพื่อเพิ่มงานล่ามใหม่ได้ทันที</p>
          <button
            onClick={onOpenNewJobModal}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-xl hover:bg-emerald-100 transition"
          >
            + เพิ่มเคสโรงพยาบาลแรก
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 active:scale-[0.99] transition cursor-pointer relative overflow-hidden group"
            >
              {/* Left Color Indicator */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  job.status === 'completed'
                    ? 'bg-slate-300'
                    : job.status === 'checked_in' || job.status === 'in_progress'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />

              <div className="flex items-start justify-between gap-2 mb-2 pl-1">
                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  {job.job_no}
                </span>
                {getStatusBadge(job.status)}
              </div>

              {/* Hospital & Department */}
              <div className="pl-1 mb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 leading-snug">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{job.hospital_name}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 ml-5.5">
                  {job.department || 'แผนกทั่วไป'}
                </p>
              </div>

              {/* Patient Info & Language */}
              <div className="bg-slate-50 rounded-xl p-2.5 pl-3 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2 truncate">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{job.patient_name}</span>
                  {job.patient_hn && (
                    <span className="text-[11px] text-slate-400 truncate font-mono">({job.patient_hn})</span>
                  )}
                </div>

                <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200/60 font-medium text-emerald-700 shrink-0 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  {job.language.split(' ')[0]}
                </span>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs pl-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" /> นัด {job.appointment_time}
                </span>

                <div className="flex items-center gap-2">
                  {job.doc_count > 0 && (
                    <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium">
                      {job.doc_count} เอกสาร
                    </span>
                  )}
                  <span className="text-emerald-600 font-semibold flex items-center text-xs group-hover:translate-x-0.5 transition">
                    เข้าทำงาน <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
