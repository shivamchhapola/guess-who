'use client';

import React from 'react';
import { Layers, ArrowLeft, ArrowRight, AlertCircle, Trash2 } from 'lucide-react';
import { CharacterCard } from '@/types/game';
import { BulkImageUploader } from '@/components/create/BulkImageUploader';
import { CardGridEditor } from '@/components/create/CardGridEditor';
import { soundFx } from '@/lib/audio';

interface CharacterWorkshopStepProps {
  cards: CharacterCard[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  zipInputRef: React.RefObject<HTMLInputElement | null>;
  uploadStatus: string | null;
  onSetCardInputRef: (idx: number, el: HTMLInputElement | null) => void;
  onCardImageClick: (idx: number) => void;
  onBulkImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onZipFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCardNameChange: (idx: number, name: string) => void;
  onSingleCardFileSelect: (idx: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCard: (idx: number) => void;
  onClearAllCards?: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export function CharacterWorkshopStep({
  cards,
  fileInputRef,
  zipInputRef,
  uploadStatus,
  onSetCardInputRef,
  onCardImageClick,
  onBulkImageSelect,
  onZipFileSelect,
  onCardNameChange,
  onSingleCardFileSelect,
  onRemoveCard,
  onClearAllCards,
  onPrevStep,
  onNextStep,
}: CharacterWorkshopStepProps) {
  const isMinimumValid = cards.length >= 4;
  const recommendedCount = 24;
  const progressPercent = Math.min(100, Math.round((cards.length / recommendedCount) * 100));

  const handleProceed = () => {
    if (!isMinimumValid) {
      alert(`A game set needs at least 4 character cards before previewing the board. (Currently ${cards.length} cards)`);
      return;
    }
    soundFx.playSelect();
    onNextStep();
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Step Title & Progress Meter Header */}
      <div className="game-panel p-5 sm:p-6 rounded-3xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Step 2: Character Cards Workshop</span>
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Select multiple photos from your computer or drop a ZIP folder. Character names are created automatically!
            </p>
          </div>
        </div>

        {/* Card Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 mb-1.5">
            <span>Minimum: 4 Cards (Required)</span>
            <span>Recommended: 24 Cards</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {!isMinimumValid && (
            <p className="text-amber-400/90 text-xs font-semibold mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Please add at least 4 character cards before proceeding to board preview.</span>
            </p>
          )}
        </div>
      </div>

      {/* Bulk Photo & ZIP Uploader */}
      <BulkImageUploader
        fileInputRef={fileInputRef}
        zipInputRef={zipInputRef}
        uploadStatus={uploadStatus}
        onBulkImageSelect={onBulkImageSelect}
        onZipFileSelect={onZipFileSelect}
      />

      {/* Card Grid Editor */}
      <CardGridEditor
        cards={cards}
        fileInputRef={fileInputRef}
        zipInputRef={zipInputRef}
        onSetCardInputRef={onSetCardInputRef}
        onCardImageClick={onCardImageClick}
        onUpdateCardName={onCardNameChange}
        onSingleCardImageSelect={onSingleCardFileSelect}
        onRemoveCard={onRemoveCard}
        onClearAllCards={onClearAllCards}
      />

      {/* Footer Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            onPrevStep();
          }}
          className="w-full sm:w-auto py-3 px-5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Identity</span>
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3 flex-wrap justify-end">
          {cards.length > 0 && onClearAllCards && (
            <button
              type="button"
              onClick={() => {
                soundFx.playMessagePop();
                onClearAllCards();
              }}
              className="py-3 px-4 rounded-2xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Cards</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleProceed}
            disabled={!isMinimumValid}
            className={`py-3.5 px-7 text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 ${isMinimumValid
                ? 'game-btn-primary hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-amber-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 border border-slate-700'
              }`}
          >
            <span>Step 3: Board Preview</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
