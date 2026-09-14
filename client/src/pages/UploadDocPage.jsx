import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Camera, Upload, FileText, Image as ImageIcon, 
  Trash2, Eye, CheckCircle2, AlertCircle, Plus, Sparkles, Building2, User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CameraModal from '../components/CameraModal';
import MedicalDocViewer from '../components/MedicalDocViewer';
import { fetchJobById, uploadMedicalDoc, deleteMedicalDoc } from '../services/api';

export default function UploadDocPage({ jobId, onBack, onJobUpdated }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [docType, setDocType] = useState('ใบรับรองแพทย์ (Medical Certificate)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const res = await fetchJobById(jobId);
      if (res.success) {
        setJob(res.data);
      }
    } catch (err) {
      console.error('Error loading job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = (photoDataUrl) => {
    setCapturedPhoto(photoDataUrl);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!capturedPhoto) {
      alert('กรุณาถ่ายรูปหรือเลือกไฟล์ใบรับรองแพทย์ก่อน');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doc_type: docType,
        notes: notes,
        base64Photo: capturedPhoto,
        original_name: `${docType.split(' ')[0]}_${Date.now()}.jpg`,
      };

      const res = await uploadMedicalDoc(jobId, payload);
      if (res.success) {
        confetti({
          particleCount: 70,
          spread: 50,
          origin: { y: 0.6 },
        });
        showToast('อัปโหลดใบรับรองแพทย์สำเร็จ!');
        setCapturedPhoto(null);
        setNotes('');
        loadJobDetails();
        if (onJobUpdated) onJobUpdated();
      } else {
        alert(res.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const res = await deleteMedicalDoc(docId);
      if (res.success) {
        showToast('ลบเอกสารเรียบร้อยแล้ว');
        loadJobDetails();
        if (onJobUpdated) onJobUpdated();
      }
    } catch (err) {
      alert('ไม่สามารถลบเอกสารได้');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const docTypesList = [
    { label: 'ใบรับรองแพทย์ (Medical Certificate)', icon: '🏥' },
    { label: 'ใบสั่งยา / คำแนะนำยา (Prescription)', icon: '💊' },
    { label: 'ผลตรวจเลือด / ห้องแล็บ (Lab Result)', icon: '🔬' },
    { label: 'ผลเอกซเรย์ / CT Scan (Imaging)', icon: '🩻' },
    { label: 'ใบนัดตรวจติดตาม (Appointment)', icon: '🗓️' },
    { label: 'เอกสารอื่นๆ (Other Document)', icon: '📑' },
  ];

  if (loading || !job) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        กำลังโหลดข้อมูลเอกสาร...
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้ารายละเอียดงาน
        </button>

        <span className="text-xs text-slate-400 font-mono font-medium">
          {job.job_no}
        </span>
      </div>

      {/* Mini Job Banner */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
        <div className="truncate">
          <span className="text-[11px] text-teal-400 block font-medium">
            {job.hospital_name.split(' (')[0]}
          </span>
          <h3 className="font-bold text-sm truncate flex items-center gap-1.5 text-white">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span>คนไข้: {job.patient_name}</span>
          </h3>
        </div>

        <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg shrink-0 font-mono">
          {job.patient_hn || 'HN -'}
        </span>
      </div>

      {/* Upload Card */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                ถ่ายรูปใบรับรองแพทย์ / เอกสาร
              </h3>
              <p className="text-[11px] text-slate-400">
                ถ่ายรูปด้วยกล้องมือถือให้ชัดเจนเพื่อแนบเข้าระบบ
              </p>
            </div>
          </div>
        </div>

        {/* Document Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            เลือกประเภทเอกสาร:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {docTypesList.map((type, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDocType(type.label)}
                className={`p-2 rounded-xl text-left text-xs font-medium border transition flex items-center gap-1.5 ${
                  docType === type.label
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'
                }`}
              >
                <span className="text-base">{type.icon}</span>
                <span className="truncate">{type.label.split(' (')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            ภาพถ่ายเอกสาร:
          </label>

          {capturedPhoto ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-4/3 max-h-72">
              <img
                src={capturedPhoto}
                alt="Document preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-2.5 py-1 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs backdrop-blur-xs font-medium active:scale-95 transition"
                >
                  ถ่ายใหม่
                </button>
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-xs active:scale-95 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> รูปภาพพร้อมอัปโหลด
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="w-full py-8 border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl bg-teal-50/40 flex flex-col items-center justify-center gap-2 active:scale-98 transition group"
            >
              <div className="p-3.5 bg-teal-600 text-white rounded-full shadow-md group-hover:scale-105 transition">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-center px-4">
                <span className="text-xs font-bold text-teal-950 block">
                  กดเพื่อเปิดกล้องถ่ายใบรับรองแพทย์
                </span>
                <span className="text-[11px] text-teal-600">
                  ถ่ายรูปจากกล้องมือถือโดยตรง หรือเลือกจากอัลบั้มรูป
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Doctor's Notes / Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            คำแนะนำแพทย์ / สรุปการรักษา:
          </label>
          <textarea
            rows={2}
            placeholder="เช่น แพทย์ให้พักงาน 3 วัน ตั้งแต่วันที่... หรือคำแนะนำการทานยา"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !capturedPhoto}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-700/20 active:scale-98 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              กำลังอัปโหลดเอกสาร...
            </span>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              บันทึกและอัปโหลดใบรับรองแพทย์
            </>
          )}
        </button>
      </form>

      {/* Gallery of Uploaded Documents */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>เอกสารที่อัปโหลดแล้ว ({job.docs ? job.docs.length : 0})</span>
          </h3>
        </div>

        {job.docs && job.docs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {job.docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex flex-col justify-between group hover:border-teal-400 transition"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setViewingDoc(doc)}
                  className="relative aspect-4/3 bg-slate-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={doc.file_path}
                    alt={doc.doc_type}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>

                {/* Meta */}
                <div className="p-2 space-y-1">
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1 block">
                    {doc.doc_type.split(' (')[0]}
                  </span>
                  {doc.notes && (
                    <p className="text-[10px] text-slate-500 line-clamp-2 italic">
                      "{doc.notes}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>
                      {new Date(doc.created_at).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="ลบเอกสาร"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 space-y-1">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">ยังไม่มีเอกสารแนบในเคสนี้</p>
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
        title="ถ่ายรูปใบรับรองแพทย์ / เอกสาร"
      />

      {/* Lightbox Document Viewer */}
      {viewingDoc && (
        <MedicalDocViewer
          doc={viewingDoc}
          onClose={() => setViewingDoc(null)}
          onDelete={handleDeleteDoc}
        />
      )}
    </div>
  );
}
