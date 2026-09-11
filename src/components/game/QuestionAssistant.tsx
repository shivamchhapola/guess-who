'use client';

import React, { useState } from 'react';
import { CharacterCard } from '@/types/game';
import { Sparkles, Filter, RotateCcw } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface QuestionAssistantProps {
  cards: CharacterCard[];
  flippedCardIds: string[];
  onAutoFlipCards: (cardIdsToFlip: string[]) => void;
  onResetFlips: () => void;
}

export const QuestionAssistant: React.FC<QuestionAssistantProps> = ({
  cards,
  flippedCardIds,
  onAutoFlipCards,
  onResetFlips,
}) => {
  const [selectedTraitKey, setSelectedTraitKey] = useState<string>('hairColor');
  const [selectedTraitVal, setSelectedTraitVal] = useState<string>('blonde');
  const [matchMode, setMatchMode] = useState<'has' | 'does_not_have'>('has');

  const activeRemainingCardsCount = cards.length - flippedCardIds.length;

  const handleApplyFilter = () => {
    const toEliminate: string[] = [];

    cards.forEach((card) => {
      if (flippedCardIds.includes(card.id)) return; // Already eliminated

      const cardVal = card.attributes[selectedTraitKey];
      let matches = false;

      if (typeof cardVal === 'boolean') {
        matches = cardVal === (selectedTraitVal === 'true');
      } else {
        matches = String(cardVal).toLowerCase() === selectedTraitVal.toLowerCase();
      }

      // If user asks "Does character HAVE X?" and answer is YES => eliminate non-matching
      // If user asks "Does character HAVE X?" and answer is NO => eliminate matching
      if (matchMode === 'has' && !matches) {
        toEliminate.push(card.id);
      } else if (matchMode === 'does_not_have' && matches) {
        toEliminate.push(card.id);
      }
    });

    if (toEliminate.length > 0) {
      soundFx.playCardFlip(true);
      onAutoFlipCards(toEliminate);
    }
  };

  return (
    <div className="w-full glass-panel p-4 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-cyan-500/20">
      {/* Title & Stats */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
          <Filter className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <span>Tactical Assistant</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
              {activeRemainingCardsCount} / {cards.length} Standing
            </span>
          </h4>
          <p className="text-slate-400 text-xs">Fast-eliminate cards based on your opponent&apos;s question answer.</p>
        </div>
      </div>

      {/* Control Inputs */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <select
          value={selectedTraitKey}
          onChange={(e) => {
            setSelectedTraitKey(e.target.value);
            if (e.target.value === 'glasses' || e.target.value === 'hat' || e.target.value === 'facialHair') {
              setSelectedTraitVal('true');
            } else if (e.target.value === 'gender') {
              setSelectedTraitVal('male');
            } else if (e.target.value === 'hairColor') {
              setSelectedTraitVal('blonde');
            }
          }}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          <option value="hairColor">Hair Color</option>
          <option value="gender">Gender</option>
          <option value="glasses">Glasses</option>
          <option value="hat">Hat</option>
          <option value="facialHair">Facial Hair</option>
          <option value="eyeColor">Eye Color</option>
        </select>

        <select
          value={matchMode}
          onChange={(e) => setMatchMode(e.target.value as 'has' | 'does_not_have')}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          <option value="has">Answer: YES (Keep Matching)</option>
          <option value="does_not_have">Answer: NO (Eliminate Matching)</option>
        </select>

        {selectedTraitKey === 'hairColor' && (
          <select
            value={selectedTraitVal}
            onChange={(e) => setSelectedTraitVal(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
          >
            <option value="blonde">Blonde</option>
            <option value="brown">Brown</option>
            <option value="black">Black</option>
            <option value="red">Red</option>
            <option value="white">White</option>
            <option value="bald">Bald</option>
          </select>
        )}

        {selectedTraitKey === 'gender' && (
          <select
            value={selectedTraitVal}
            onChange={(e) => setSelectedTraitVal(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        )}

        {(selectedTraitKey === 'glasses' || selectedTraitKey === 'hat' || selectedTraitKey === 'facialHair') && (
          <select
            value={selectedTraitVal}
            onChange={(e) => setSelectedTraitVal(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        )}

        <button
          type="button"
          onClick={handleApplyFilter}
          className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Eliminate</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playCardFlip(false);
            onResetFlips();
          }}
          className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 glass-card rounded-lg flex items-center gap-1 transition-colors"
          title="Reset all eliminated cards"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
