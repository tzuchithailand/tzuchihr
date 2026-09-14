import React, { useState, useEffect } from 'react';
import ProMaxHeader from './components/ProMaxHeader';
import ProMaxNavBar from './components/ProMaxNavBar';
import TodayJobs from './pages/TodayJobs';
import ActiveJob from './pages/ActiveJob';
import UploadDocPage from './pages/UploadDocPage';
import PersonnelDirectory from './pages/PersonnelDirectory';
import ShiftManagement from './pages/ShiftManagement';
import HipAttendancePage from './pages/HipAttendancePage';
import AccountingPayrollPage from './pages/AccountingPayrollPage';
import ReportsDashboard from './pages/ReportsDashboard';
import NewJobModal from './components/NewJobModal';
import { fetchJobs, fetchJobById } from './services/api';

export default function App() {
  // Main Module: 'jobs' | 'personnel' | 'shifts' | 'attendance' | 'payroll' | 'reports'
  const [activeModule, setActiveModule] = useState('jobs');

  // Sub-navigation inside 'jobs' module
  const [jobSubView, setJobSubView] = useState('list'); // 'list' | 'active_job' | 'upload_doc'
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetchJobs('all');
      if (res.success) {
        setJobs(res.data);
        if (!selectedJob && res.data.length > 0) {
          const defaultActive = res.data.find((j) => j.status !== 'completed') || res.data[0];
          setSelectedJob(defaultActive);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJobs(false);
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
    setJobSubView('active_job');
  };

  const handleJobUpdated = (updatedJob) => {
    if (updatedJob) setSelectedJob(updatedJob);
    loadJobs();
  };

  const handleNewJobCreated = (newJob) => {
    setSelectedJob(newJob);
    loadJobs();
    setJobSubView('active_job');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800 antialiased font-sans">
      {/* iPhone Pro Max Optimized Container (max-w-[540px]) */}
      <div className="w-full max-w-[540px] mx-auto min-h-screen flex flex-col bg-white shadow-2xl relative border-x border-slate-200/60">
        {/* Top Header */}
        <ProMaxHeader
          activeModule={activeModule}
          onSelectModule={setActiveModule}
        />

        {/* Dynamic Body Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* MODULE 1: HOSPITAL JOBS */}
          {activeModule === 'jobs' && (
            <>
              {jobSubView === 'list' && (
                <TodayJobs
                  jobs={jobs}
                  onSelectJob={handleSelectJob}
                  onOpenNewJobModal={() => setIsNewJobOpen(true)}
                  loading={loadingJobs}
                />
              )}

              {jobSubView === 'active_job' && (
                selectedJob ? (
                  <ActiveJob
                    job={selectedJob}
                    onBack={() => setJobSubView('list')}
                    onNavigateToDocs={() => setJobSubView('upload_doc')}
                    onJobUpdated={handleJobUpdated}
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <p className="text-xs text-slate-500">กรุณาเลือกเคสงานจากรายการ</p>
                    <button
                      onClick={() => setJobSubView('list')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      กลับไปรายการงาน
                    </button>
                  </div>
                )
              )}

              {jobSubView === 'upload_doc' && (
                selectedJob ? (
                  <UploadDocPage
                    jobId={selectedJob.id}
                    onBack={() => setJobSubView('active_job')}
                    onJobUpdated={loadJobs}
                  />
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <button
                      onClick={() => setJobSubView('list')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      กลับไปรายการงาน
                    </button>
                  </div>
                )
              )}
            </>
          )}

          {/* MODULE 2: CLINIC PERSONNEL (STAFF & INTERPRETERS) */}
          {activeModule === 'personnel' && <PersonnelDirectory />}

          {/* MODULE 3: SHIFTS MANAGEMENT */}
          {activeModule === 'shifts' && <ShiftManagement />}

          {/* MODULE 4: HIP CiF93s-VL ATTENDANCE */}
          {activeModule === 'attendance' && <HipAttendancePage />}

          {/* MODULE 5: ACCOUNTING & PAYROLL */}
          {activeModule === 'payroll' && <AccountingPayrollPage />}

          {/* MODULE 6: EXECUTIVE REPORTS */}
          {activeModule === 'reports' && <ReportsDashboard />}
        </main>

        {/* Bottom Navigation Bar */}
        <ProMaxNavBar
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            if (mod === 'jobs') setJobSubView('list');
          }}
        />

        {/* New Job Modal */}
        <NewJobModal
          isOpen={isNewJobOpen}
          onClose={() => setIsNewJobOpen(false)}
          onCreated={handleNewJobCreated}
          interpreterName="สมชาย ล่ามมือโปร"
        />
      </div>
    </div>
  );
}
