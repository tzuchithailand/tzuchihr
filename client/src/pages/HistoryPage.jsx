import React, { useState } from 'react';
import { 
  Building2, User, CheckCircle2, Calendar, MapPin, 
  FileText, Search, ExternalLink, ChevronRight, Clock
} from 'lucide-react';
import MedicalDocViewer from '../components/MedicalDocViewer';
import { fetchJobById } from '../services/api';

export default function HistoryPage({ jobs, onSelectJob }) {
  const [filter, setFilter] = useState('all'); // all, completed, in_progress
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'completed'
        ? job.status === 'completed'
        : job.status !== 'completed';

    const matchesSearch =
      job.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.patient_hn && job.patient_hn.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Page Title */}
      <div className="px-1">
        <h2 className="text-lg font-bold text-slate-800">ประวัติงานล่ามและเอกสาร</h2>
        <p className="text-xs text-slate-500">
          เรียกดูบันทึกงาน พิกัด GPS เช็คอิน และรูปใบรับรองแพทย์ย้อนหลัง
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตาม รพ., ชื่อคนไข้, HN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            ทั้งหมด ({jobs.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            เสร็จสิ้นแล้ว ({jobs.filter((j) => j.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === 'in_progress'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            ยังไม่เสร็จ ({jobs.filter((j) => j.status !== 'completed').length})
          </button>
        </div>
      </div>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-medium text-xs">ไม่พบประวัติงานที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 active:scale-[0.99] transition cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 font-medium text-[11px]">
                  {job.job_no}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    job.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {job.status === 'completed' ? '✓ สำเร็จ' : 'กำลังดำเนินการ'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{job.hospital_name}</span>
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {job.patient_name}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {job.language}
                  </span>
                </div>
              </div>

              {/* Checkin and Checkout details */}
              <div className="bg-slate-50 rounded-xl p-2 text-[11px] text-slate-600 flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    เช็คอิน:{' '}
                    {job.checkin_time
                      ? new Date(job.checkin_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                      : 'ยังไม่เช็คอิน'}
                  </span>
                </div>

                {job.checkin_lat && (
                  <span className="text-emerald-700 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> มีพิกัด GPS
                  </span>
                )}
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-teal-700 font-semibold text-[11px] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {job.doc_count || 0} เอกสาร/ใบรับรองแพทย์
                </span>

                <span className="text-slate-400 text-xs flex items-center gap-1 hover:text-slate-600">
                  ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <MedicalDocViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}
