'use client';

import React, { useState } from 'react';
import { CharacterCard } from '@/types/game';
import { Sparkles, Filter, RotateCcw } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { Select } from '@/components/ui/Select';

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
      if (flippedCardIds.includes(card.id)) return;

      const cardVal = card.attributes[selectedTraitKey];
      let matches = false;

      if (typeof cardVal === 'boolean') {
        matches = cardVal === (selectedTraitVal === 'true');
      } else {
        matches = String(cardVal).toLowerCase() === selectedTraitVal.toLowerCase();
      }

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

  const traitOptions = [
    { value: 'hairColor', label: 'Hair Color' },
    { value: 'gender', label: 'Gender' },
    { value: 'glasses', label: 'Glasses' },
    { value: 'hat', label: 'Hat' },
    { value: 'facialHair', label: 'Facial Hair' },
    { value: 'eyeColor', label: 'Eye Color' },
  ];

  const matchModeOptions = [
    { value: 'has' as const, label: 'Answer: YES (Keep Matching)' },
    { value: 'does_not_have' as const, label: 'Answer: NO (Eliminate Matching)' },
  ];

  const hairColorOptions = [
    { value: 'blonde', label: 'Blonde' },
    { value: 'brown', label: 'Brown' },
    { value: 'black', label: 'Black' },
    { value: 'red', label: 'Red' },
    { value: 'white', label: 'White' },
    { value: 'bald', label: 'Bald' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const boolOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ];

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
        <Select
          value={selectedTraitKey}
          options={traitOptions}
          onChange={(val) => {
            setSelectedTraitKey(val);
            if (val === 'glasses' || val === 'hat' || val === 'facialHair') {
              setSelectedTraitVal('true');
            } else if (val === 'gender') {
              setSelectedTraitVal('male');
            } else if (val === 'hairColor') {
              setSelectedTraitVal('blonde');
            }
          }}
        />

        <Select<'has' | 'does_not_have'>
          value={matchMode}
          options={matchModeOptions}
          onChange={setMatchMode}
        />

        {selectedTraitKey === 'hairColor' && (
          <Select
            value={selectedTraitVal}
            options={hairColorOptions}
            onChange={setSelectedTraitVal}
          />
        )}

        {selectedTraitKey === 'gender' && (
          <Select
            value={selectedTraitVal}
            options={genderOptions}
            onChange={setSelectedTraitVal}
          />
        )}

        {(selectedTraitKey === 'glasses' || selectedTraitKey === 'hat' || selectedTraitKey === 'facialHair') && (
          <Select
            value={selectedTraitVal}
            options={boolOptions}
            onChange={setSelectedTraitVal}
          />
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
