import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export default function GpsLocationBadge({ onLocationUpdate, defaultLocation = null }) {
  const [coords, setCoords] = useState(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (defaultLocation) {
      setCoords(defaultLocation);
    } else {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('อุปกรณ์นี้ไม่รองรับการระบุพิกัด GPS');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          address: 'พิกัด GPS ตรวจจับจากอุปกรณ์มือถือ',
          isMock: false,
        };
        setCoords(newCoords);
        setLoading(false);
        if (onLocationUpdate) onLocationUpdate(newCoords);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrorMsg('ไม่สามารถดึงพิกัดได้ (กรุณาอนุญาต Location บนมือถือ หรือกดใช้พิกัดจำลอง)');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const handleSimulateHospitalLocation = (hospitalPreset) => {
    let mockCoords;
    if (hospitalPreset === 'bumrungrad') {
      mockCoords = {
        lat: 13.746618,
        lng: 100.553047,
        accuracy: 8,
        address: 'โรงพยาบาลบำรุงราษฎร์ สุขุมวิท 3 กรุงเทพมหานคร',
        isMock: true,
      };
    } else {
      mockCoords = {
        lat: 13.748366,
        lng: 100.584168,
        accuracy: 12,
        address: 'โรงพยาบาลกรุงเทพ ซอยเพชรบุรี 47 กรุงเทพมหานคร',
        isMock: true,
      };
    }
    setCoords(mockCoords);
    setErrorMsg(null);
    if (onLocationUpdate) onLocationUpdate(mockCoords);
  };

  return (
    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-950 uppercase tracking-wider block">
              พิกัด GPS หน้างาน
            </span>
            <span className="text-[11px] text-emerald-700">
              {coords ? (coords.isMock ? '📍 พิกัดจำลอง รพ.' : '🛰️ พิกัดตรวจจับสด') : 'ยังไม่ได้ดึงพิกัด'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="px-2.5 py-1 text-xs bg-white border border-emerald-300 text-emerald-800 rounded-lg font-medium flex items-center gap-1 hover:bg-emerald-100/50 active:scale-95 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          {loading ? 'กำลังหา...' : 'อัปเดตพิกัด'}
        </button>
      </div>

      {errorMsg ? (
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 space-y-1.5">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
          <div className="flex gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleSimulateHospitalLocation('bumrungrad')}
              className="px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-medium active:scale-95 transition"
            >
              ใช้พิกัด รพ.บำรุงราษฎร์
            </button>
            <button
              type="button"
              onClick={() => handleSimulateHospitalLocation('bangkok')}
              className="px-2 py-1 bg-white border border-amber-300 text-amber-900 rounded text-[11px] font-medium active:scale-95 transition"
            >
              ใช้พิกัด รพ.กรุงเทพ
            </button>
          </div>
        </div>
      ) : coords ? (
        <div className="space-y-1.5 text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
          <div className="flex justify-between items-center">
            <span className="font-mono font-medium text-slate-800">
              Lat: {coords.lat} , Lng: {coords.lng}
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md font-medium">
              ±{coords.accuracy}m
            </span>
          </div>

          <p className="text-[11px] text-slate-500 truncate">{coords.address}</p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <a
              href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              เปิดดูใน Google Maps
            </a>

            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <ShieldCheck className="w-3 h-3" /> พิกัดพร้อมเช็คอิน
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-slate-500">
          กำลังค้นหาดาวเทียม GPS...
        </div>
      )}
    </div>
  );
}
