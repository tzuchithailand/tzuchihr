import React, { useState } from 'react';
import { 
  Building2, User, Clock, ArrowLeft, Camera, CheckCircle2, 
  MapPin, Upload, FileText, Globe, AlertTriangle, ExternalLink,
  ChevronRight, Sparkles, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CameraModal from '../components/CameraModal';
import GpsLocationBadge from '../components/GpsLocationBadge';
import { checkinJob, checkoutJob } from '../services/api';

export default function ActiveJob({ job, onBack, onNavigateToDocs, onJobUpdated }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [checkinPhoto, setCheckinPhoto] = useState(null);
  const [gpsData, setGpsData] = useState(
    job.checkin_lat
      ? {
          lat: job.checkin_lat,
          lng: job.checkin_lng,
          accuracy: job.checkin_accuracy,
          address: job.checkin_address,
        }
      : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [checkoutNotes, setCheckoutNotes] = useState(job.summary_notes || '');
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  const isCheckedIn = job.status !== 'assigned';
  const isCompleted = job.status === 'completed';

  const handleCapturePhoto = (photoDataUrl) => {
    setCheckinPhoto(photoDataUrl);
  };

  const handlePerformCheckin = async () => {
    if (!checkinPhoto && !job.checkin_photo) {
      alert('กรุณาถ่ายรูปหน้างานหรือหน้าโรงพยาบาลก่อนทำการเช็คอิน');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        lat: gpsData ? gpsData.lat : 13.7466,
        lng: gpsData ? gpsData.lng : 100.5530,
        accuracy: gpsData ? gpsData.accuracy : 10,
        address: gpsData ? gpsData.address : 'พิกัดโรงพยาบาล',
        base64Photo: checkinPhoto,
      };

      const res = await checkinJob(job.id, payload);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
        onJobUpdated(res.data);
      } else {
        alert(res.message || 'เช็คอินไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูลเช็คอิน');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePerformCheckout = async () => {
    setSubmitting(true);
    try {
      const res = await checkoutJob(job.id, checkoutNotes);
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
        setShowCheckoutConfirm(false);
        onJobUpdated(res.data);
      } else {
        alert(res.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเช็คเอาท์');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้ารายการ
        </button>

        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
          {job.job_no}
        </span>
      </div>

      {/* Hospital Job Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
              โรงพยาบาลเป้าหมาย
            </span>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{job.hospital_name}</span>
            </h2>
            <p className="text-xs text-slate-500 ml-6.5">{job.department}</p>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
              isCompleted
                ? 'bg-slate-100 text-slate-700'
                : isCheckedIn
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isCompleted ? 'เสร็จสิ้น' : isCheckedIn ? 'เช็คอินแล้ว' : 'รอเช็คอิน'}
          </span>
        </div>

        {/* Patient & Case Information */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">ผู้ป่วย</span>
            <span className="font-bold text-slate-800 block truncate">{job.patient_name}</span>
            <span className="text-[11px] font-mono text-slate-500">{job.patient_hn || '-'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">ภาษา & ล่าม</span>
            <span className="font-semibold text-emerald-700 block truncate">{job.language}</span>
            <span className="text-[11px] text-slate-500 truncate block">ล่าม: {job.interpreter_name}</span>
          </div>
        </div>

        {job.summary_notes && (
          <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-xl">
            <span className="font-semibold text-amber-900 block text-[11px]">บันทึกอาการ:</span>
            {job.summary_notes}
          </div>
        )}
      </div>

      {/* SECTION 1: Check-in & GPS Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isCheckedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                1. เช็คอิน GPS & ภาพถ่ายหน้างาน
              </h3>
              <p className="text-[11px] text-slate-400">
                {isCheckedIn ? 'เช็คอินเรียบร้อยแล้ว' : 'ระบุพิกัดและถ่ายรูปยืนยันถึง รพ.'}
              </p>
            </div>
          </div>

          {isCheckedIn && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Check className="w-3.5 h-3.5" /> สำเร็จ
            </span>
          )}
        </div>

        {/* GPS Widget */}
        <GpsLocationBadge
          defaultLocation={gpsData}
          onLocationUpdate={(coords) => setGpsData(coords)}
        />

        {/* Check-in Photo Area */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 block">
            ภาพถ่ายหน้างาน / ป้ายโรงพยาบาล:
          </span>

          {checkinPhoto || job.checkin_photo ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-52 bg-slate-900">
              <img
                src={checkinPhoto || job.checkin_photo}
                alt="Checkin confirmation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white text-xs justify-between">
                <span className="flex items-center gap-1 font-medium text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" /> ภาพถ่ายเช็คอิน
                </span>
                {!isCheckedIn && (
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-lg text-xs font-semibold active:scale-95 transition"
                  >
                    ถ่ายใหม่
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="w-full py-6 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-emerald-50/40 flex flex-col items-center justify-center gap-2 active:scale-98 transition group"
            >
              <div className="p-3 bg-emerald-600 text-white rounded-full shadow-md group-hover:scale-105 transition">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-900 block">
                  กดเพื่อถ่ายรูปหน้า รพ. / เซลฟี่
                </span>
                <span className="text-[11px] text-emerald-600">
                  ใช้กล้องมือถือถ่ายภาพเพื่อยืนยันการเช็คอิน
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Check-in Action Button (If not yet checked in) */}
        {!isCheckedIn && (
          <button
            type="button"
            onClick={handlePerformCheckin}
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 active:scale-98 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังบันทึกเช็คอิน...
              </span>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                ยืนยันเช็คอินเข้า รพ. (GPS + รูปถ่าย)
              </>
            )}
          </button>
        )}

        {/* Checkin Timestamp Details */}
        {job.checkin_time && (
          <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-500 flex justify-between items-center">
            <span>เวลาเช็คอิน:</span>
            <span className="font-semibold text-slate-800">
              {new Date(job.checkin_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
            </span>
          </div>
        )}
      </div>

      {/* SECTION 2: Medical Certificate & Documents */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                2. เอกสาร & ใบรับรองแพทย์ของผู้ป่วย
              </h3>
              <p className="text-[11px] text-slate-400">
                ถ่ายรูปใบรับรองแพทย์, ใบสั่งยา, ผลตรวจทางห้องแล็บ
              </p>
            </div>
          </div>

          <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
            {job.doc_count || 0} รายการ
          </span>
        </div>

        <p className="text-xs text-slate-600">
          เมื่อคุณหมอตรวจเสร็จ สามารถใช้กล้องมือถือถ่ายรูปใบรับรองแพทย์และเอกสารต่างๆ เพื่อส่งเข้าระบบทันที
        </p>

        <button
          onClick={onNavigateToDocs}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-700/20 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          ไปที่หน้าถ่ายรูป & อัปโหลดใบรับรองแพทย์
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION 3: Check-out / Completion */}
      {isCheckedIn && !isCompleted && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            3. ปิดเคส & เช็คเอาท์ (Check-out)
          </h3>

          {!showCheckoutConfirm ? (
            <button
              onClick={() => setShowCheckoutConfirm(true)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs active:scale-98 transition"
            >
              เสร็จสิ้นการแปล / สรุปเคสเช็คเอาท์
            </button>
          ) : (
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">
                สรุปผลการแปล / คำแนะนำเพิ่มเติมจากแพทย์:
              </label>
              <textarea
                rows={3}
                placeholder="เช่น ผู้ป่วยรับทราบแผนการรักษา นัดตรวจซ้ำอีก 2 สัปดาห์ พร้อมรับยา..."
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCheckoutConfirm(false)}
                  className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handlePerformCheckout}
                  disabled={submitting}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  ยืนยันเช็คเอาท์
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
          <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Check className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-emerald-900 text-sm">ภารกิจนี้เสร็จสิ้นสมบูรณ์แล้ว</h4>
          <p className="text-xs text-emerald-700">
            เช็คเอาท์เมื่อ: {new Date(job.checkout_time || Date.now()).toLocaleTimeString('th-TH')} น.
          </p>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
        title="ถ่ายภาพหน้างาน / ป้าย รพ."
      />
    </div>
  );
}
