'use client';

import React from 'react';
import { Layers, Sparkles, Eye, Check, Lock } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface CreateStudioHeaderProps {
  currentStep: number;
  totalCards: number;
  title: string;
  onSelectStep: (step: number) => void;
}

export function CreateStudioHeader({
  currentStep,
  totalCards,
  title,
  onSelectStep,
}: CreateStudioHeaderProps) {
  const steps = [
    { number: 1, label: '1. Set Identity', icon: Sparkles },
    { number: 2, label: '2. Character Workshop', icon: Layers },
    { number: 3, label: '3. Board Preview', icon: Eye },
  ];

  const hasTitle = title.trim().length > 0;
  const hasMinimumCards = totalCards >= 4;

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep === 2 && !hasTitle) return;
    if (targetStep === 3 && (!hasTitle || !hasMinimumCards)) return;

    soundFx.playSelect();
    onSelectStep(targetStep);
  };

  return (
    <div className="mb-8">
      {/* Title & Status Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1
              className="text-2xl sm:text-3xl font-black text-white tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Deck Creator Studio 📸
            </h1>
            <span
              className="px-3 py-1 rounded-full text-xs font-black text-amber-400"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
            </span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm">
            Craft custom photo decks, unpack ZIP archives, and publish your set to the community.
          </p>
        </div>
      </div>

      {/* Step Navigation Pills Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
        {steps.map((s) => {
          const IconComponent = s.icon;
          const isActive = currentStep === s.number;
          const isCompleted = currentStep > s.number;

          const isLocked =
            (s.number === 2 && !hasTitle) ||
            (s.number === 3 && (!hasTitle || !hasMinimumCards));

          return (
            <button
              key={s.number}
              type="button"
              disabled={isLocked}
              onClick={() => handleStepClick(s.number)}
              className={`py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.01]'
                  : isCompleted
                  ? 'bg-slate-900/90 text-amber-400 border border-amber-500/30 hover:border-amber-400/50 hover:bg-slate-800/90 cursor-pointer'
                  : isLocked
                  ? 'bg-slate-900/30 text-slate-600 border border-slate-800/40 opacity-60 cursor-not-allowed'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700 cursor-pointer'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-amber-400 stroke-[3] shrink-0" />
              ) : isLocked ? (
                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              ) : (
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              )}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
