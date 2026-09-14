import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, FileText, Calendar, Trash2 } from 'lucide-react';

export default function MedicalDocViewer({ doc, onClose, onDelete }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!doc) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.6));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between max-w-[540px] mx-auto text-white">
      {/* Top Header */}
      <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold truncate">{doc.doc_type || 'ใบรับรองแพทย์'}</h4>
            <p className="text-[11px] text-zinc-400 truncate">{doc.original_name || 'รูปภาพเอกสาร'}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image View with Pan/Zoom */}
      <div className="relative flex-1 flex items-center justify-center p-3 overflow-hidden">
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center w-full h-full"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={doc.file_path}
            alt={doc.doc_type}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10 select-none"
          />
        </div>

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/85 backdrop-blur-md border border-zinc-700/80 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-white/10 rounded-full active:scale-90 transition text-zinc-200"
            title="ซูมออก"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-zinc-300 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-white/10 rounded-full active:scale-90 transition text-zinc-200"
            title="ซูมเข้า"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-700 mx-0.5"></div>
          <button
            onClick={handleRotate}
            className="p-1.5 hover:bg-white/10 rounded-full active:scale-90 transition text-zinc-200"
            title="หมุนภาพ"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Info Sheet */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-3">
        {doc.notes && (
          <div className="bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700/50">
            <span className="text-[11px] text-zinc-400 block font-medium">หมายเหตุ / คำแนะนำแพทย์:</span>
            <p className="text-xs text-zinc-200 mt-0.5">{doc.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(doc.created_at).toLocaleString('th-TH')}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={doc.file_path}
              download={doc.original_name || 'medical-document.jpg'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1.5 font-medium transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              ดาวน์โหลด
            </a>

            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('ต้องการลบเอกสารนี้ใช่หรือไม่?')) {
                    onDelete(doc.id);
                    onClose();
                  }
                }}
                className="p-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition active:scale-95"
                title="ลบเอกสาร"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
