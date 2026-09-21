'use client';

import React, { useState } from 'react';
import { Layers, ArrowLeft, ArrowRight, Trash2, Plus } from 'lucide-react';
import { CharacterCard } from '@/types/game';
import { BulkImageUploader } from '@/components/create/BulkImageUploader';
import { CardGridEditor } from '@/components/create/CardGridEditor';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { soundFx } from '@/lib/audio';

const MIN_CARDS = 4;
const IDEAL_CARDS = 24;

interface CharacterWorkshopStepProps {
  cards: CharacterCard[];
  maxCards: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  zipInputRef: React.RefObject<HTMLInputElement | null>;
  uploadStatus: string | null;
  onSetCardInputRef: (idx: number, el: HTMLInputElement | null) => void;
  onCardImageClick: (idx: number) => void;
  onBulkImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onZipFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesDropped: (files: FileList) => void;
  onCardNameChange: (idx: number, name: string) => void;
  onSingleCardFileSelect: (idx: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCard: (idx: number) => void;
  onClearAllCards?: () => void;
  onAddCard: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export function CharacterWorkshopStep({
  cards,
  maxCards,
  fileInputRef,
  zipInputRef,
  uploadStatus,
  onSetCardInputRef,
  onCardImageClick,
  onBulkImageSelect,
  onZipFileSelect,
  onFilesDropped,
  onCardNameChange,
  onSingleCardFileSelect,
  onRemoveCard,
  onClearAllCards,
  onAddCard,
  onPrevStep,
  onNextStep,
}: CharacterWorkshopStepProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const count = cards.length;
  const isMinimumValid = count >= MIN_CARDS;
  const atMax = count >= maxCards;

  // Progress bar — fill relative to maxCards
  const progressPercent = Math.min(100, Math.round((count / maxCards) * 100));
  const minTickPercent = Math.round((MIN_CARDS / maxCards) * 100);
  const idealTickPercent = Math.round((IDEAL_CARDS / maxCards) * 100);

  // Dynamic status copy
  const progressStatus = (() => {
    if (count === 0) return 'Upload at least 4 character photos to continue.';
    if (count < MIN_CARDS) return `Need ${MIN_CARDS - count} more card${MIN_CARDS - count > 1 ? 's' : ''} to reach the minimum.`;
    if (count < IDEAL_CARDS) return `✓ Minimum met — add up to ${IDEAL_CARDS - count} more for a better game!`;
    return `✓ Looking great! You have a full ${count}-card deck.`;
  })();

  const handleProceed = () => {
    if (!isMinimumValid) {
      // The inline progress bar already shows the error — just pulse the bar by briefly adding a class
      // This is handled below by visual state, no alert needed
      return;
    }
    soundFx.playSelect();
    onNextStep();
  };

  const handleClearConfirmed = () => {
    soundFx.playMessagePop();
    onClearAllCards?.();
    setShowClearConfirm(false);
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
              Select multiple photos from your computer or upload a ZIP file. Character names are generated from filenames automatically.
            </p>
          </div>
        </div>

        {/* Dual-Milestone Progress Bar */}
        <div>
          {/* Bar */}
          <div className="relative w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-visible mb-3">
            {/* Fill */}
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Min tick */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-slate-400/60 rounded-full"
              style={{ left: `${minTickPercent}%` }}
              title={`Minimum: ${MIN_CARDS} cards`}
            />
            {/* Ideal tick */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400/70 rounded-full"
              style={{ left: `${idealTickPercent}%` }}
              title={`Ideal: ${IDEAL_CARDS} cards`}
            />
          </div>

          {/* Tick labels */}
          <div className="relative h-4 mb-1">
            <span
              className="absolute text-[10px] font-extrabold text-slate-500 -translate-x-1/2"
              style={{ left: `${minTickPercent}%` }}
            >
              Min.&nbsp;{MIN_CARDS}
            </span>
            <span
              className="absolute text-[10px] font-extrabold text-cyan-400/80 -translate-x-1/2"
              style={{ left: `${idealTickPercent}%` }}
            >
              Ideal&nbsp;{IDEAL_CARDS}
            </span>
            <span className="absolute right-0 text-[10px] font-extrabold text-slate-600">
              Max&nbsp;{maxCards}
            </span>
          </div>

          {/* Dynamic status line */}
          <p
            className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              count === 0 || count < MIN_CARDS
                ? 'text-amber-400/90'
                : count < IDEAL_CARDS
                ? 'text-slate-300'
                : 'text-emerald-400'
            }`}
          >
            <span>{progressStatus}</span>
          </p>
        </div>
      </div>

      {/* Bulk Photo & ZIP Uploader */}
      <BulkImageUploader
        fileInputRef={fileInputRef}
        zipInputRef={zipInputRef}
        uploadStatus={uploadStatus}
        onBulkImageSelect={onBulkImageSelect}
        onZipFileSelect={onZipFileSelect}
        onFilesDropped={onFilesDropped}
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
          {/* Clear All — shows confirm dialog */}
          {cards.length > 0 && onClearAllCards && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="py-3 px-4 rounded-2xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}

          {/* Add single card */}
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              onAddCard();
            }}
            disabled={atMax}
            title={atMax ? `${maxCards}-card limit reached` : 'Add a blank card'}
            className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              atMax
                ? 'bg-slate-800/40 text-slate-600 border border-slate-800/60 cursor-not-allowed opacity-50'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>

          {/* Next step */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={!isMinimumValid}
            className={`py-3.5 px-7 text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 ${
              isMinimumValid
                ? 'game-btn-primary hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-amber-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 border border-slate-700'
            }`}
          >
            <span>Step 3: Board Preview</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Cards?"
        description={`This will permanently remove all ${cards.length} character card${cards.length > 1 ? 's' : ''} from your deck. This cannot be undone.`}
        confirmLabel="Yes, Clear All"
        cancelLabel="Keep Cards"
        onConfirm={handleClearConfirmed}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
