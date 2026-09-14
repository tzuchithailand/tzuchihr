import React, { useState, useEffect } from 'react';
import { 
  Building2, User, Clock, MapPin, FileText, CheckCircle2, 
  ExternalLink, Search, PlusCircle, Globe, ChevronRight, Eye
} from 'lucide-react';
import { fetchJobs, fetchJobById } from '../services/api';
import MedicalDocViewer from '../components/MedicalDocViewer';
import NewJobModal from '../components/NewJobModal';

export default function DesktopHospitalJobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetchJobs('all');
      if (res.success) {
        setJobs(res.data);
        if (res.data.length > 0 && !selectedJob) {
          loadJobDetails(res.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadJobDetails = async (id) => {
    try {
      const res = await fetchJobById(id);
      if (res.success) setSelectedJob(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchStatus = statusFilter === 'all' ? true : j.status === statusFilter;
    const matchSearch =
      j.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.interpreter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.job_no.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-teal-300 uppercase block mb-1">
            ศูนย์ประสานงานล่ามโรงพยาบาล (Hospital Interpreter Dispatch)
          </span>
          <h2 className="text-2xl font-black tracking-tight">ติดตามภารกิจงานล่าม รพ. ทั้งหมด</h2>
          <p className="text-xs text-teal-100 mt-1">
            ตรวจสอบตำแหน่งเช็คอิน GPS, รูปถ่ายหน้างาน, ใบรับรองแพทย์ และสถานะงานภาคสนาม
          </p>
        </div>

        <button
          onClick={() => setIsNewJobOpen(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg active:scale-95 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          เปิดเคสงานล่ามใหม่
        </button>
      </div>

      {/* 2-Column Desktop Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Jobs Master List (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาตาม รพ., ล่าม, คนไข้..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
              {['all', 'assigned', 'checked_in', 'in_progress', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                    statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {st === 'all'
                    ? 'ทั้งหมด'
                    : st === 'assigned'
                    ? 'รอเช็คอิน'
                    : st === 'checked_in'
                    ? 'เช็คอินแล้ว'
                    : st === 'in_progress'
                    ? 'กำลังแปล'
                    : 'เสร็จสิ้น'}
                </button>
              ))}
            </div>
          </div>

          {/* Job Items List */}
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดเคสงาน...</div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => loadJobDetails(job.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-slate-400">{job.job_no}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          job.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.status === 'checked_in' || job.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {job.status === 'completed'
                          ? '✓ เสร็จสิ้น'
                          : job.status === 'checked_in'
                          ? 'เช็คอินแล้ว'
                          : job.status === 'in_progress'
                          ? 'กำลังแปล'
                          : 'รอเช็คอิน'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{job.hospital_name}</span>
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>คนไข้: {job.patient_name}</span>
                      <span className="text-emerald-700 font-semibold">{job.language}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>ล่าม: {job.interpreter_name}</span>
                      <span>นัด {job.appointment_time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Job Details & Certificates (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          {selectedJob ? (
            <>
              {/* Top Header of Selected Job */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {selectedJob.job_no}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    <span>{selectedJob.hospital_name}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{selectedJob.department || 'แผนกทั่วไป'}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-700 inline-block mb-1">
                    นัดหมาย: {selectedJob.appointment_time}
                  </span>
                  <p className="text-xs text-emerald-700 font-bold">
                    ล่าม: {selectedJob.interpreter_name} ({selectedJob.language})
                  </p>
                </div>
              </div>

              {/* Patient Info Card */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">ชื่อผู้ป่วย</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedJob.patient_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">เลขประจำตัว (HN)</span>
                  <span className="font-mono font-bold text-slate-900">{selectedJob.patient_hn || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">สถานะงาน</span>
                  <span className="font-bold text-teal-700">{selectedJob.status}</span>
                </div>
              </div>

              {/* GPS Check-in & Photo Inspection */}
              <div className="border border-slate-200 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  การเช็คอิน GPS และภาพถ่ายหน้างาน รพ.
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p>
                      <strong>เวลาเช็คอิน:</strong>{' '}
                      {selectedJob.checkin_time
                        ? new Date(selectedJob.checkin_time).toLocaleString('th-TH')
                        : 'ยังไม่เช็คอิน'}
                    </p>
                    <p>
                      <strong>พิกัด GPS:</strong>{' '}
                      {selectedJob.checkin_lat
                        ? `${selectedJob.checkin_lat}, ${selectedJob.checkin_lng} (±${selectedJob.checkin_accuracy || 10}m)`
                        : 'ไม่มีพิกัด'}
                    </p>
                    {selectedJob.checkin_lat && (
                      <a
                        href={`https://maps.google.com/?q=${selectedJob.checkin_lat},${selectedJob.checkin_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        เปิดดูพิกัดบน Google Maps
                      </a>
                    )}
                  </div>

                  {selectedJob.checkin_photo ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200">
                      <img
                        src={selectedJob.checkin_photo}
                        alt="Checkin"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                        ภาพถ่ายเช็คอินหน้างาน
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                      ยังไม่มีรูปถ่ายเช็คอิน
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Medical Certificates Section */}
              <div className="border border-slate-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    รูปใบรับรองแพทย์และเอกสารผู้ป่วย ({selectedJob.docs?.length || 0})
                  </h4>
                </div>

                {selectedJob.docs && selectedJob.docs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedJob.docs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setViewingDoc(doc)}
                        className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer hover:border-teal-400 transition"
                      >
                        <div className="aspect-4/3 bg-slate-900 relative">
                          <img
                            src={doc.file_path}
                            alt={doc.doc_type}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="p-2 space-y-0.5">
                          <span className="font-bold text-slate-800 text-[11px] block truncate">
                            {doc.doc_type.split(' (')[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {doc.original_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    ยังไม่มีรูปใบรับรองแพทย์แนบในเคสนี้
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs">
              กรุณาเลือกเคสงานจากรายการทางซ้ายเพื่อตรวจสอบรายละเอียด
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewingDoc && (
        <MedicalDocViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        onCreated={() => {
          loadJobs();
        }}
        interpreterName="สมชาย ล่ามมือโปร"
      />
    </div>
  );
}
