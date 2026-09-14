import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, MapPin, UploadCloud, History, PlusCircle, 
  Stethoscope, ShieldCheck, UserCheck, Bell, ChevronDown, CheckCircle2
} from 'lucide-react';
import TodayJobs from './pages/TodayJobs';
import ActiveJob from './pages/ActiveJob';
import UploadDocPage from './pages/UploadDocPage';
import HistoryPage from './pages/HistoryPage';
import NewJobModal from './components/NewJobModal';
import { fetchJobs, fetchJobById } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'active_job' | 'upload_doc' | 'history'
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interpreterName, setInterpreterName] = useState('สมชาย ล่ามมือโปร');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await fetchJobs('all');
      if (res.success) {
        setJobs(res.data);
        // Default selected job to first uncompleted or active job
        if (!selectedJob && res.data.length > 0) {
          const defaultActive = res.data.find((j) => j.status !== 'completed') || res.data[0];
          setSelectedJob(defaultActive);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job) => {
    try {
      const res = await fetchJobById(job.id);
      if (res.success) {
        setSelectedJob(res.data);
        setActiveTab('active_job');
      } else {
        setSelectedJob(job);
        setActiveTab('active_job');
      }
    } catch (e) {
      setSelectedJob(job);
      setActiveTab('active_job');
    }
  };

  const handleJobUpdated = (updatedJob) => {
    if (updatedJob) {
      setSelectedJob(updatedJob);
    }
    loadJobs();
  };

  const handleNewJobCreated = (newJob) => {
    setSelectedJob(newJob);
    loadJobs();
    setActiveTab('active_job');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/70 text-slate-800">
      {/* Mobile Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight">
                MedTranslate
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                LINE LIFF
              </span>
            </div>
            <p className="text-[11px] text-slate-500">ระบบงานล่ามโรงพยาบาล</p>
          </div>
        </div>

        {/* Interpreter Profile Badge */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-semibold text-slate-700 max-w-[110px] truncate">
            {interpreterName}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-[540px] w-full mx-auto">
        {activeTab === 'today' && (
          <TodayJobs
            jobs={jobs}
            onSelectJob={handleSelectJob}
            onOpenNewJobModal={() => setIsNewJobOpen(true)}
            loading={loading}
          />
        )}

        {activeTab === 'active_job' && (
          selectedJob ? (
            <ActiveJob
              job={selectedJob}
              onBack={() => setActiveTab('today')}
              onNavigateToDocs={() => setActiveTab('upload_doc')}
              onJobUpdated={handleJobUpdated}
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <p className="text-sm text-slate-600">กรุณาเลือกงานจากหน้ารายการก่อน</p>
              <button
                onClick={() => setActiveTab('today')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                ไปที่รายการงานวันนี้
              </button>
            </div>
          )
        )}

        {activeTab === 'upload_doc' && (
          selectedJob ? (
            <UploadDocPage
              jobId={selectedJob.id}
              onBack={() => setActiveTab('active_job')}
              onJobUpdated={loadJobs}
            />
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <p className="text-sm text-slate-600">กรุณาเลือกงานที่ต้องการอัปโหลดใบรับรองแพทย์</p>
              <button
                onClick={() => setActiveTab('today')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                เลือกงานล่าม
              </button>
            </div>
          )
        )}

        {activeTab === 'history' && (
          <HistoryPage
            jobs={jobs}
            onSelectJob={handleSelectJob}
          />
        )}
      </main>

      {/* Bottom Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 max-w-[540px] mx-auto shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {/* Tab 1: Today Jobs */}
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
              activeTab === 'today'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <ClipboardList className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">งานวันนี้</span>
          </button>

          {/* Tab 2: GPS Check-in */}
          <button
            onClick={() => {
              if (selectedJob) setActiveTab('active_job');
              else setActiveTab('today');
            }}
            className={`flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
              activeTab === 'active_job'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'active_job' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">เช็คอิน GPS</span>
          </button>

          {/* Tab 3: Upload Medical Cert */}
          <button
            onClick={() => {
              if (selectedJob) setActiveTab('upload_doc');
              else setActiveTab('today');
            }}
            className={`flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
              activeTab === 'upload_doc'
                ? 'text-teal-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <UploadCloud className={`w-5 h-5 ${activeTab === 'upload_doc' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">ใบรับรองแพทย์</span>
          </button>

          {/* Tab 4: History */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
              activeTab === 'history'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <History className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">ประวัติงาน</span>
          </button>
        </div>
      </nav>

      {/* New Job Modal Form */}
      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        onCreated={handleNewJobCreated}
        interpreterName={interpreterName}
      />
    </div>
  );
}
