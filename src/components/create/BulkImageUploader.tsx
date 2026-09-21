'use client';

import React from 'react';
import { UploadCloud, FileArchive } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface BulkImageUploaderProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  zipInputRef: React.RefObject<HTMLInputElement | null>;
  uploadStatus: string | null;
  onBulkImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onZipFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BulkImageUploader: React.FC<BulkImageUploaderProps> = ({
  fileInputRef,
  zipInputRef,
  uploadStatus,
  onBulkImageSelect,
  onZipFileSelect,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span>Bulk Photo Import & ZIP Drop</span>
          </h4>
          <p className="text-slate-400 text-xs mt-0.5">
            Filenames will automatically become character names (e.g. <code className="text-amber-300">Michael.jpg</code> → <strong className="text-slate-200">Michael</strong>).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onBulkImageSelect}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              fileInputRef.current?.click();
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-md hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Select Photos</span>
          </button>

          <input
            type="file"
            ref={zipInputRef}
            onChange={onZipFileSelect}
            accept=".zip,application/zip"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              zipInputRef.current?.click();
            }}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 hover:border-amber-400/40 text-slate-200 hover:text-white font-bold rounded-xl text-xs border border-slate-700 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileArchive className="w-4 h-4 text-amber-400" />
            <span>Upload ZIP</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="mt-3 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse flex items-center gap-2">
          <span>{uploadStatus}</span>
        </div>
      )}
    </div>
  );
};
