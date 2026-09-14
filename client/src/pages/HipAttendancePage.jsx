import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, Wifi, Upload, RefreshCw, CheckCircle2, 
  AlertCircle, Clock, ShieldCheck, Settings, FileText, User
} from 'lucide-react';
import { fetchAttendanceLogs, syncHipDevice, fetchDeviceConfig } from '../services/api';
import HipSyncModal from '../components/HipSyncModal';

export default function HipAttendancePage() {
  const [logs, setLogs] = useState([]);
  const [personType, setPersonType] = useState('all'); // 'all', 'medical', 'interpreter'
  const [deviceConfig, setDeviceConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncSuccessBanner, setSyncSuccessBanner] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, [personType]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [lRes, cRes] = await Promise.all([
        fetchAttendanceLogs(personType),
        fetchDeviceConfig(),
      ]);
      if (lRes.success) setLogs(lRes.data);
      if (cRes.success) setDeviceConfig(cRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSync = async () => {
    setSyncing(true);
    setSyncSuccessBanner(null);
    try {
      const res = await syncHipDevice();
      if (res.success) {
        setSyncSuccessBanner(res.message);
        loadAttendance();
      }
    } catch (err) {
      alert('เชื่อมต่อเครื่อง HIP ไม่สำเร็จ');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Device Info Card Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold tracking-wider text-indigo-200 uppercase">
              เครื่องสแกนใบหน้าและลายนิ้วมือ
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              TCP:4370 Online
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight">HIP CiF93s-VL Attendance</h2>
          <p className="text-xs text-indigo-100/80 mt-0.5">
            IP: {deviceConfig?.ip_address || '192.168.1.201'} • บันทึกสแกนใบหน้าความเร็วสูง
          </p>

          {/* Device Actions */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              onClick={handleQuickSync}
              disabled={syncing}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 text-indigo-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-600' : ''}`} />
              {syncing ? 'กำลังดึงเวลา...' : 'ดึงเวลา HIP ทันที'}
            </button>

            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition backdrop-blur-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              USB Log / ตั้งค่า
            </button>
          </div>
        </div>
      </div>

      {/* Sync Success Banner */}
      {syncSuccessBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{syncSuccessBanner}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 p-1 bg-slate-200/70 rounded-2xl gap-1 text-xs font-bold">
        <button
          onClick={() => setPersonType('all')}
          className={`py-2 rounded-xl transition ${
            personType === 'all' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          ทั้งหมด ({logs.length})
        </button>
        <button
          onClick={() => setPersonType('medical')}
          className={`py-2 rounded-xl transition ${
            personType === 'medical' ? 'bg-white text-teal-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          เมดิคอลทีม
        </button>
        <button
          onClick={() => setPersonType('interpreter')}
          className={`py-2 rounded-xl transition ${
            personType === 'interpreter' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          ทีมล่าม
        </button>
      </div>

      {/* Attendance Logs List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดบันทึกเวลาสแกน...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2">
          <Fingerprint className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-600 font-bold text-xs">ยังไม่มีบันทึกเวลาจากเครื่องสแกน</p>
          <p className="text-[11px] text-slate-400">กดปุ่ม "ดึงเวลา HIP ทันที" เพื่อซิงค์ข้อมูล</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-indigo-300 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    log.person_type === 'medical'
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{log.person_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                      ID: {log.enroll_no}
                    </span>
                    <span>• {log.verify_mode} (สแกนหน้า)</span>
                    <span className="text-emerald-600 font-semibold">• {log.punch_state}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-slate-900 text-xs block">
                  {log.scan_time.slice(11, 16)} น.
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {log.scan_time.slice(0, 10)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync / Settings Modal */}
      <HipSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSynced={loadAttendance}
      />
    </div>
  );
}
