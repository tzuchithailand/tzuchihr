import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, UploadCloud, History, ArrowLeft, 
  Smartphone, Globe, Star, ShieldCheck, CheckCircle2, 
  User, PlusCircle, Monitor
} from 'lucide-react';
import TodayJobs from './TodayJobs';
import ActiveJob from './ActiveJob';
import UploadDocPage from './UploadDocPage';
import HistoryPage from './HistoryPage';
import NewJobModal from '../components/NewJobModal';
import { fetchJobs, fetchJobById, fetchInterpreters } from '../services/api';

export default function InterpreterPortal({ onSwitchToDesktop }) {
  const [subTab, setSubTab] = useState('jobs'); // 'jobs' | 'active_job' | 'upload_doc' | 'history'
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Current logged in interpreter
  const [interpreters, setInterpreters] = useState([]);
  const [currentInterpreter, setCurrentInterpreter] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [jRes, iRes] = await Promise.all([fetchJobs('all'), fetchInterpreters()]);
      if (jRes.success) {
        setJobs(jRes.data);
        if (jRes.data.length > 0) {
          const defaultActive = jRes.data.find((j) => j.status !== 'completed') || jRes.data[0];
          setSelectedJob(defaultActive);
        }
      }
      if (iRes.success && iRes.data.length > 0) {
        setInterpreters(iRes.data);
        setCurrentInterpreter(iRes.data[0]); // default to Somchai
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job) => {
    try {
      const res = await fetchJobById(job.id);
      if (res.success) {
        setSelectedJob(res.data);
      } else {
        setSelectedJob(job);
      }
    } catch (e) {
      setSelectedJob(job);
    }
    setSubTab('active_job');
  };

  const handleJobUpdated = (updated) => {
    if (updated) setSelectedJob(updated);
    loadInitialData();
  };

  const handleNewJobCreated = (newJob) => {
    setSelectedJob(newJob);
    loadInitialData();
    setSubTab('active_job');
  };

  return (
    <div className="min-h-screen bg-slate-900/90 py-0 sm:py-6 px-0 sm:px-4 flex items-center justify-center">
      {/* Smartphone Pro Max Container (~450px) */}
      <div className="w-full max-w-[460px] bg-slate-100 min-h-screen sm:min-h-[920px] sm:max-h-[96vh] flex flex-col sm:rounded-[40px] shadow-2xl overflow-hidden relative border-0 sm:border-4 sm:border-slate-800">
        
        {/* Mobile Status Strip & Portal Switcher */}
        <div className="bg-slate-900 text-white px-4 pt-3 pb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-emerald-300 text-[11px]">พอร์ทัลล่าม รพ. (Mobile)</span>
          </div>

          <button
            onClick={onSwitchToDesktop}
            className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 active:scale-95 transition"
            title="กลับไประบบคลินิกหน้าจอปกติ"
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-300" />
            <span>โหมดคลินิก (Desktop)</span>
          </button>
        </div>

        {/* Interpreter Profile Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm text-white">
                {currentInterpreter?.name ? currentInterpreter.name.slice(0, 2) : 'ล่าม'}
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight text-white">
                  {currentInterpreter?.name || 'สมชาย ล่ามมือโปร'}
                </h3>
                <span className="text-[11px] text-emerald-100 block">
                  {currentInterpreter?.languages || 'ภาษาญี่ปุ่น, ภาษาอังกฤษ'}
                </span>
              </div>
            </div>

            {/* Switch interpreter dropdown if testing */}
            {interpreters.length > 1 && (
              <select
                value={currentInterpreter?.id || ''}
                onChange={(e) => {
                  const found = interpreters.find((i) => i.id === e.target.value);
                  if (found) setCurrentInterpreter(found);
                }}
                className="bg-emerald-800/80 text-white text-[10px] rounded-lg px-2 py-1 outline-none border border-emerald-500/50"
              >
                {interpreters.map((i) => (
                  <option key={i.id} value={i.id}>
                    สลับ: {i.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Main Body Content */}
        <div className="flex-1 p-3.5 overflow-y-auto">
          {subTab === 'jobs' && (
            <TodayJobs
              jobs={jobs}
              onSelectJob={handleSelectJob}
              onOpenNewJobModal={() => setIsNewJobOpen(true)}
              loading={loading}
            />
          )}

          {subTab === 'active_job' && (
            selectedJob ? (
              <ActiveJob
                job={selectedJob}
                onBack={() => setSubTab('jobs')}
                onNavigateToDocs={() => setSubTab('upload_doc')}
                onJobUpdated={handleJobUpdated}
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-500">กรุณาเลือกเคสงานจากรายการ</p>
                <button
                  onClick={() => setSubTab('jobs')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  กลับไปรายการงาน
                </button>
              </div>
            )
          )}

          {subTab === 'upload_doc' && (
            selectedJob ? (
              <UploadDocPage
                jobId={selectedJob.id}
                onBack={() => setSubTab('active_job')}
                onJobUpdated={loadInitialData}
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <button
                  onClick={() => setSubTab('jobs')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  กลับไปรายการงาน
                </button>
              </div>
            )
          )}

          {subTab === 'history' && (
            <HistoryPage
              jobs={jobs}
              onSelectJob={handleSelectJob}
            />
          )}
        </div>

        {/* Bottom Mobile Tab Bar (For Interpreter) */}
        <nav className="bg-white/95 backdrop-blur-xl border-t border-slate-200 grid grid-cols-4 h-16 items-center px-1">
          <button
            onClick={() => setSubTab('jobs')}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              subTab === 'jobs' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px]">งานวันนี้</span>
          </button>

          <button
            onClick={() => {
              if (selectedJob) setSubTab('active_job');
              else setSubTab('jobs');
            }}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              subTab === 'active_job' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px]">เช็คอิน GPS</span>
          </button>

          <button
            onClick={() => {
              if (selectedJob) setSubTab('upload_doc');
              else setSubTab('jobs');
            }}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              subTab === 'upload_doc' ? 'text-teal-600 font-bold' : 'text-slate-400'
            }`}
          >
            <UploadCloud className="w-5 h-5" />
            <span className="text-[10px]">ใบรับรองแพทย์</span>
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              subTab === 'history' ? 'text-emerald-600 font-bold' : 'text-slate-400'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">ประวัติงาน</span>
          </button>
        </nav>

        {/* New Job Modal */}
        <NewJobModal
          isOpen={isNewJobOpen}
          onClose={() => setIsNewJobOpen(false)}
          onCreated={handleNewJobCreated}
          interpreterName={currentInterpreter?.name || 'สมชาย ล่ามมือโปร'}
        />
      </div>
    </div>
  );
}
