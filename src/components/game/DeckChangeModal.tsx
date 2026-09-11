'use client';

import React from 'react';
import { CardSetTemplate } from '@/types/game';
import { Search, Layers, X, Eye } from 'lucide-react';
import Image from 'next/image';

interface DeckChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTemplates: CardSetTemplate[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTemplate: (newTemplate: CardSetTemplate) => void;
  onPreviewTemplate: (template: CardSetTemplate) => void;
}

export const DeckChangeModal: React.FC<DeckChangeModalProps> = ({
  isOpen,
  onClose,
  availableTemplates,
  searchQuery,
  onSearchChange,
  onSelectTemplate,
  onPreviewTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="game-panel w-full max-w-2xl max-h-[85vh] rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl border border-slate-700/60">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Select Card Set Deck
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search template decks by title, creator, or tags..."
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Deck List Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {availableTemplates.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-medium">
              No matching template decks found.
            </div>
          ) : (
            availableTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/60 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Card Previews */}
                  <div className="flex -space-x-2 shrink-0">
                    {tpl.cards.slice(0, 3).map((card, i) => (
                      <div
                        key={card.id || i}
                        className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-950"
                      >
                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{tpl.title}</h4>
                    <p className="text-slate-400 text-xs truncate">
                      {tpl.creatorName} • {tpl.cards.length} cards
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPreviewTemplate(tpl)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    title="Preview Cards"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTemplate(tpl)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
