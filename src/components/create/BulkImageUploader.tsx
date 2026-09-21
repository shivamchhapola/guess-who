'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud, FileArchive } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface BulkImageUploaderProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  zipInputRef: React.RefObject<HTMLInputElement | null>;
  uploadStatus: string | null;
  onBulkImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onZipFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesDropped: (files: FileList) => void;
}

export const BulkImageUploader: React.FC<BulkImageUploaderProps> = ({
  fileInputRef,
  zipInputRef,
  uploadStatus,
  onBulkImageSelect,
  onZipFileSelect,
  onFilesDropped,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we actually left the drop zone (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        soundFx.playSelect();
        onFilesDropped(files);
      }
    },
    [onFilesDropped]
  );

  return (
    <div
      className="rounded-2xl transition-all duration-200"
      style={{
        background: isDragging ? 'rgba(245,158,11,0.06)' : 'rgba(15,23,42,0.80)',
        border: isDragging
          ? '2px dashed rgba(245,158,11,0.7)'
          : '1px solid rgba(51,65,85,0.9)',
        boxShadow: isDragging ? '0 0 0 4px rgba(245,158,11,0.08)' : undefined,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {isDragging ? (
                <span className="text-amber-400">Drop your photos or ZIP here!</span>
              ) : (
                <span>Bulk Photo Import &amp; ZIP Drop</span>
              )}
            </h4>
            <p className="text-slate-400 text-xs mt-0.5">
              Drop photos or a ZIP here, or use the buttons.{' '}
              Filenames become character names (e.g.{' '}
              <code className="text-amber-300">Michael.jpg</code> →{' '}
              <strong className="text-slate-200">Michael</strong>).
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
    </div>
  );
};
