'use client';

import React from 'react';
import { UploadCloud, FileArchive } from 'lucide-react';

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
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Bulk Auto-Fill Photos or ZIP Archive
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Upload multiple photos at once or drop a ZIP folder. Filenames will automatically become character names!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
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
            onClick={() => zipInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition-colors flex items-center gap-2"
          >
            <FileArchive className="w-4 h-4 text-amber-400" />
            <span>Upload ZIP</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold animate-pulse">
          {uploadStatus}
        </div>
      )}
    </div>
  );
};
