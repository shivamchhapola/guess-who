'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, ArrowLeft, Play, Users, CheckCircle, Loader2, Globe, Lock, Info } from 'lucide-react';
import { CharacterCard } from '@/types/game';
import { Tooltip } from '@/components/ui/Tooltip';

interface DeckBoardPreviewStepProps {
  title: string;
  description: string;
  isPublic: boolean;
  selectedTags: string[];
  cards: CharacterCard[];
  saving: boolean;
  successMsg: string | null;
  onPrevStep: () => void;
  onSaveTemplate: (destination: 'host' | 'practice') => void;
}

export function DeckBoardPreviewStep({
  title,
  description,
  isPublic,
  selectedTags,
  cards,
  saving,
  successMsg,
  onPrevStep,
  onSaveTemplate,
}: DeckBoardPreviewStepProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="game-panel p-6 sm:p-8 rounded-3xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Eye className="w-5 h-5 text-amber-400" />
              <span>Step 3: Board Preview & Publish</span>
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Review your game board tiles before publishing your custom set to the community.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-slate-300">
              <span className="text-amber-400 font-black">{cards.length}</span> Character Cards Ready
            </span>
          </div>
        </div>

        {/* Deck Metadata Overview */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Set Title & Description</span>
            <Tooltip content={title} position="top" maxWidth="320px" className="w-full">
              <h4 className="text-sm font-black text-white truncate cursor-help" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {title || 'Untitled Game Set'}
              </h4>
            </Tooltip>
            {description ? (
              <Tooltip content={description} position="top" maxWidth="320px" className="w-full">
                <p className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors mt-0.5 cursor-help flex items-center gap-1 min-w-0">
                  <span className="truncate">{description}</span>
                  <Info className="w-3 h-3 text-amber-400 shrink-0 opacity-70" />
                </p>
              </Tooltip>
            ) : (
              <p className="text-[11px] text-slate-500 italic mt-0.5">No description provided</p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Visibility</span>
            <div className="flex items-center gap-1.5 text-xs font-extrabold">
              {isPublic ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  Public Community
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Private Unlisted
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Tags</span>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((t) => (
                <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Live Board Preview Box */}
      <div className="game-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Game Board Preview
            </h4>
          </div>
          <span className="text-xs text-slate-400">How your character cards will look in-game</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
          {cards.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-slate-900/90 border border-amber-500/30 transition-transform hover:scale-105"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
              </div>
              <span className="text-[11px] font-bold text-slate-200 text-center leading-tight truncate w-full px-1">
                {c.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Publishing Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onPrevStep}
          disabled={saving}
          className="py-3.5 px-5 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Character Workshop</span>
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSaveTemplate('practice')}
            disabled={saving}
            className="py-3.5 px-5 rounded-2xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/90 border border-slate-700 transition-all flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-amber-400" />
            <span>Save &amp; Practice Solo</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveTemplate('host')}
            disabled={saving}
            className="game-btn-primary py-3.5 px-7 text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Publishing Deck...</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>Publish & Host Room</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
