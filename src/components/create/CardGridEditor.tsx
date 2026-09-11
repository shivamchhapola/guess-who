'use client';

import React from 'react';
import { CharacterCard } from '@/types/game';
import { ImageIcon, Trash2, Plus } from 'lucide-react';
import Image from 'next/image';

interface CardGridEditorProps {
  cards: CharacterCard[];
  onSetCardInputRef: (index: number, el: HTMLInputElement | null) => void;
  onCardImageClick: (index: number) => void;
  onUpdateCardName: (index: number, name: string) => void;
  onSingleCardImageSelect: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveCard: (index: number) => void;
  onAddCard: () => void;
}

export const CardGridEditor: React.FC<CardGridEditorProps> = ({
  cards,
  onSetCardInputRef,
  onCardImageClick,
  onUpdateCardName,
  onSingleCardImageSelect,
  onRemoveCard,
  onAddCard,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Deck Cards ({cards.length})
        </h3>

        <button
          type="button"
          onClick={onAddCard}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cards.map((card, idx) => (
          <div
            key={card.id || idx}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2.5 relative group hover:border-slate-700 transition-all"
          >
            {/* Delete button */}
            <button
              type="button"
              onClick={() => onRemoveCard(idx)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all z-10"
              title="Remove Card"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Image Preview & Upload Trigger */}
            <div
              onClick={() => onCardImageClick(idx)}
              className="relative w-full aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden cursor-pointer flex flex-col items-center justify-center group/img"
            >
              {card.imageUrl ? (
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-600" />
              )}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white">
                Change Photo
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
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
