import React, { useState, useEffect } from 'react';
import { X, Fingerprint, Wifi, Upload, CheckCircle2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { syncHipDevice, importHipUsbFile, fetchDeviceConfig, updateDeviceConfig } from '../services/api';

export default function HipSyncModal({ isOpen, onClose, onSynced }) {
  const [deviceConfig, setDeviceConfig] = useState({
    device_name: 'เครื่องสแกนใบหน้า HIP CiF93s-VL',
    ip_address: '192.168.1.201',
    port: 4370,
  });
  const [syncMode, setSyncMode] = useState('network'); // 'network' or 'usb'
  const [loading, setLoading] = useState(false);
  const [usbContent, setUsbContent] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setStatusResult(null);
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const res = await fetchDeviceConfig();
      if (res.success && res.data) setDeviceConfig(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDirectSync = async () => {
    setLoading(true);
    setStatusResult(null);
    try {
      // Save config first
      await updateDeviceConfig(deviceConfig);
      const res = await syncHipDevice(deviceConfig.ip_address, deviceConfig.port);
      setStatusResult({
        success: res.success,
        message: res.message || 'ดึงข้อมูลสำเร็จ',
        count: res.syncedRecords || 0,
      });
      if (res.success && onSynced) onSynced();
    } catch (err) {
      setStatusResult({ success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    } finally {
      setLoading(false);
    }
  };

  const handleUsbUpload = async (e) => {
    e.preventDefault();
    if (!usbContent.trim()) {
      alert('กรุณากรอกหรืออัปโหลดข้อมูลจากไฟล์ attlog.dat');
      return;
    }

    setLoading(true);
    setStatusResult(null);
    try {
      const res = await importHipUsbFile(usbContent);
      setStatusResult({
        success: res.success,
        message: res.message,
        count: res.importedCount || 0,
      });
      if (res.success && onSynced) onSynced();
    } catch (err) {
      setStatusResult({ success: false, message: 'นำเข้าข้อมูลไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUsbContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleInsertSampleUsbLog = () => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const sample = `101\t${today} 07:55:00\t15\t0\t1\t0
201\t${today} 07:28:10\t15\t0\t1\t0
301\t${today} 07:59:45\t15\t0\t1\t0
102\t${today} 13:50:20\t15\t0\t1\t0`;
    setUsbContent(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-[500px] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">เครื่องสแกน HIP CiF93s-VL</h3>
              <p className="text-xs text-slate-500">ดึงเวลาบันทึกเข้า-ออกงานของบุคลากร</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Mode Control */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1 text-xs">
            <button
              onClick={() => setSyncMode('network')}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                syncMode === 'network' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Wifi className="w-4 h-4" />
              Direct Network Sync (LAN)
            </button>
            <button
              onClick={() => setSyncMode('usb')}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                syncMode === 'usb' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Upload className="w-4 h-4" />
              Import จาก USB Log
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {statusResult && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                statusResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {statusResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <div>
                <span className="font-bold block">{statusResult.message}</span>
                {statusResult.count > 0 && (
                  <span className="text-[11px] text-emerald-700">
                    นำเข้าบันทึกเวลาสำเร็จจำนวน {statusResult.count} รายการ
                  </span>
                )}
              </div>
            </div>
          )}

          {syncMode === 'network' ? (
            <div className="space-y-3.5">
              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl space-y-1">
                <span className="font-bold text-indigo-950 block">เชื่อมต่อตรงผ่านระบบเครือข่าย</span>
                <p className="text-indigo-800 text-[11px]">
                  เครื่องสแกนใบหน้า HIP CiF93s-VL ใช้พอร์ต TCP มาตรฐาน 4370 สามารถสั่งดึงบันทึกเวลาล่าสุดได้ทันที
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อเครื่องสแกน</label>
                <input
                  type="text"
                  value={deviceConfig.device_name}
                  onChange={(e) => setDeviceConfig({ ...deviceConfig, device_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={deviceConfig.ip_address}
                    onChange={(e) => setDeviceConfig({ ...deviceConfig, ip_address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Port (Default: 4370)</label>
                  <input
                    type="number"
                    value={deviceConfig.port}
                    onChange={(e) => setDeviceConfig({ ...deviceConfig, port: parseInt(e.target.value) || 4370 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleDirectSync}
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-700/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'กำลังดึงข้อมูลจากเครื่อง HIP...' : 'ดึงข้อมูลเวลาจากเครื่อง HIP ทันที'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleUsbUpload} className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <span className="font-bold text-slate-900 block">นำเข้าไฟล์ attlog.dat จาก Flash Drive</span>
                <p className="text-slate-600 text-[11px]">
                  เสียบ Flash Drive ที่เครื่องสแกน HIP เมนู "ดาวน์โหลดข้อมูลเวลา" จะได้ไฟล์ attlog.dat หรือ CSV
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">เลือกไฟล์จากเครื่อง:</label>
                <button
                  type="button"
                  onClick={handleInsertSampleUsbLog}
                  className="text-[11px] text-indigo-600 font-bold hover:underline"
                >
                  + ใส่ตัวอย่างข้อมูล Log
                </button>
              </div>

              <input
                type="file"
                accept=".dat,.txt,.csv"
                onChange={handleFileSelect}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เนื้อหาไฟล์ Log (Preview):</label>
                <textarea
                  rows={5}
                  placeholder="EnrollNo \t DateTime \t VerifyMode \t PunchState"
                  value={usbContent}
                  onChange={(e) => setUsbContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !usbContent.trim()}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-700/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'กำลังประมวลผลไฟล์...' : 'ประมวลผลและนำเข้าบันทึกเวลา'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
