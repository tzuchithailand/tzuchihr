import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon, FlipHorizontal } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture, title = 'ถ่ายภาพหน้างาน' }) {
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (selfie)
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn('Live camera stream not supported or denied:', err);
      setCameraError('ไม่สามารถเข้าถึงกล้องวิดีโอสดได้ (สามารถใช้ปุ่มเลือกรูปถ่ายจากเครื่องแทนได้)');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleNativeFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPhoto(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between max-w-[540px] mx-auto text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-black/40">
        <h3 className="text-base font-semibold tracking-wide flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          {title}
        </h3>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-zinc-950">
        {capturedPhoto ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img
              src={capturedPhoto}
              alt="Preview"
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-white/20"
            />
            <div className="absolute top-4 left-4 bg-emerald-600/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
              <Check className="w-3.5 h-3.5" /> ภาพถ่ายพร้อมใช้งาน
            </div>
          </div>
        ) : stream ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Target Framing Overlay */}
            <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
              </div>
              <p className="text-center text-xs text-white/70 bg-black/40 py-1 px-3 rounded-full mx-auto">
                จัดตำแหน่งให้เอกสารหรือหน้างานอยู่ในกรอบ
              </p>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-4">
            <Camera className="w-16 h-16 text-zinc-600 mx-auto animate-pulse" />
            <p className="text-sm text-zinc-300">{cameraError || 'กำลังเปิดกล้องถ่ายรูป...'}</p>
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium text-sm flex items-center gap-2 mx-auto shadow-lg"
            >
              <ImageIcon className="w-4 h-4" />
              ถ่ายรูปด้วยกล้องมือถือ / เลือกรูปภาพ
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeFileInput}
          className="hidden"
        />
      </div>

      {/* Bottom Controls */}
      <div className="p-5 bg-zinc-900 border-t border-zinc-800">
        {capturedPhoto ? (
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RefreshCw className="w-4 h-4" />
              ถ่ายใหม่
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-900/40 transition"
            >
              <Check className="w-4 h-4" />
              ยืนยันใช้รูปนี้
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-around">
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="flex flex-col items-center gap-1 text-xs text-zinc-300 active:scale-95"
            >
              <div className="p-3 bg-zinc-800 rounded-full">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <span>คลังภาพ</span>
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleTakeSnapshot}
              disabled={!stream}
              className="relative p-1 rounded-full border-4 border-white disabled:opacity-40 active:scale-95 transition"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>

            <button
              onClick={toggleCameraFacing}
              className="flex flex-col items-center gap-1 text-xs text-zinc-300 active:scale-95"
            >
              <div className="p-3 bg-zinc-800 rounded-full">
                <FlipHorizontal className="w-5 h-5 text-emerald-400" />
              </div>
              <span>สลับกล้อง</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
