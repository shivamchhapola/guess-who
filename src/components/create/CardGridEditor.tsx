'use client';

import React from 'react';
import { CharacterCard } from '@/types/game';
import { ImageIcon, Trash2, RefreshCw, UploadCloud, FileArchive } from 'lucide-react';
import Image from 'next/image';
import { soundFx } from '@/lib/audio';

interface CardGridEditorProps {
  cards: CharacterCard[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  zipInputRef: React.RefObject<HTMLInputElement | null>;
  onSetCardInputRef: (index: number, el: HTMLInputElement | null) => void;
  onCardImageClick: (index: number) => void;
  onUpdateCardName: (index: number, name: string) => void;
  onSingleCardImageSelect: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCard: (index: number) => void;
  onClearAllCards?: () => void;
}

export const CardGridEditor: React.FC<CardGridEditorProps> = ({
  cards,
  fileInputRef,
  zipInputRef,
  onSetCardInputRef,
  onCardImageClick,
  onUpdateCardName,
  onSingleCardImageSelect,
  onRemoveCard,
  onClearAllCards,
}) => {
  return (
    <div className="space-y-4">
      {/* Grid Toolbar & Metrics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base sm:text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Deck Cards Grid
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/25">
            {cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
          </span>
        </div>

        {cards.length > 0 && onClearAllCards && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playMessagePop();
                onClearAllCards();
              }}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold rounded-xl text-xs border border-rose-500/30 hover:border-rose-500/50 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1.5 cursor-pointer"
              title="Remove all cards to start clean"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State Callout when deck has 0 cards */}
      {cards.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-dashed border-slate-700/80 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="max-w-md">
            <h4 className="text-lg font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your Character Workshop is Clean!
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload photos from your device or drop a ZIP folder. Character names will be automatically extracted from filenames!
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                fileInputRef.current?.click();
              }}
              className="game-btn-primary px-5 py-2.5 text-xs rounded-xl flex items-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select Photos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                zipInputRef.current?.click();
              }}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white font-bold rounded-xl text-xs border border-slate-700 hover:border-amber-400/40 transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FileArchive className="w-4 h-4 text-amber-400" />
              <span>Upload ZIP</span>
            </button>
          </div>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-3.5">
          {cards.map((card, idx) => (
            <div
              key={card.id || idx}
              className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2 relative group hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Delete Card Button */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playMessagePop();
                  onRemoveCard(idx);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-950/90 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 z-20 cursor-pointer shadow-md"
                title="Delete Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Image Preview & Upload Trigger */}
              <div
                onClick={() => {
                  soundFx.playSelect();
                  onCardImageClick(idx);
                }}
                className="relative w-full aspect-square rounded-xl bg-slate-950 border border-slate-800/80 group-hover:border-amber-400/40 overflow-hidden cursor-pointer flex flex-col items-center justify-center transition-all duration-200 group-hover:scale-[1.02] shadow-inner"
              >
                {card.imageUrl ? (
                  <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-600" />
                )}
                <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-amber-300 backdrop-blur-xs">
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span>Change Photo</span>
                </div>
              </div>

              <input
                type="file"
                ref={(el) => onSetCardInputRef(idx, el)}
                onChange={(e) => onSingleCardImageSelect(idx, e)}
                accept="image/*"
                className="hidden"
              />

              {/* Card Name Input */}
              <input
                type="text"
                value={card.name}
                onChange={(e) => onUpdateCardName(idx, e.target.value)}
                placeholder="Character Name"
                className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-center transition-all duration-200"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
