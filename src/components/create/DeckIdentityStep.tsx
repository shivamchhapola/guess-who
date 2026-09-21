'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, Lock, ArrowRight } from 'lucide-react';
import { TagSelectorBar } from '@/components/create/TagSelectorBar';
import { soundFx } from '@/lib/audio';

interface DeckIdentityStepProps {
  title: string;
  description: string;
  isPublic: boolean;
  selectedTags: string[];
  customTagInput: string;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onIsPublicChange: (val: boolean) => void;
  onCustomTagInputChange: (val: string) => void;
  onToggleTag: (tag: string) => void;
  onAddCustomTag: (e: React.KeyboardEvent | React.MouseEvent) => void;
  onNextStep: () => void;
}

export function DeckIdentityStep({
  title,
  description,
  isPublic,
  selectedTags,
  customTagInput,
  onTitleChange,
  onDescriptionChange,
  onIsPublicChange,
  onCustomTagInputChange,
  onToggleTag,
  onAddCustomTag,
  onNextStep,
}: DeckIdentityStepProps) {
  const [titleError, setTitleError] = useState('');

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Please enter a title for your game set.');
      return;
    }
    setTitleError('');
    soundFx.playSelect();
    onNextStep();
  };

  return (
    <form onSubmit={handleProceed} className="game-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Step 1: Set Identity &amp; Details</span>
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Name your deck, add a description, select visibility, and tag topics for search.
          </p>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1.5">
            Game Set Title <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => {
              onTitleChange(e.target.value);
              if (titleError) setTitleError('');
            }}
            placeholder="e.g. Dunder Mifflin Scranton, Marvel Heroes, Office Squad"
            className={`w-full h-12 px-4 bg-slate-950/90 border rounded-2xl text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none transition-all ${
              titleError
                ? 'border-rose-500/70 focus:border-rose-400'
                : 'border-slate-700/80 focus:border-amber-400'
            }`}
            style={{ caretColor: '#f59e0b' }}
          />
          {titleError && (
            <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
              <span>⚠</span>
              {titleError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1.5">
            Short Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Brief description of characters in this deck..."
            className="w-full h-12 px-4 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
            style={{ caretColor: '#f59e0b' }}
          />
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
            {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">
              {isPublic ? 'Public Community Deck' : 'Private Unlisted Deck'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isPublic
                ? 'Visible in Browse Sets so other players can preview and host games.'
                : 'Only players with your room code can play with this set.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            onIsPublicChange(!isPublic);
          }}
          className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
            isPublic
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          {isPublic ? 'Public' : 'Private'}
        </button>
      </div>

      {/* Tag Selector Bar */}
      <TagSelectorBar
        selectedTags={selectedTags}
        customTagInput={customTagInput}
        onCustomTagInputChange={onCustomTagInputChange}
        onToggleTag={onToggleTag}
        onAddCustomTag={onAddCustomTag}
      />

      {/* Next Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="game-btn-primary py-3.5 px-7 text-sm font-black rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20"
        >
          <span>Step 2: Add Character Cards</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </form>
  );
}
