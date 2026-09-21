'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CardSetTemplate } from '@/types/game';
import { Layers, Check, X, Search } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface HostDeckSelectorProps {
  selectedTemplate: CardSetTemplate;
  availableTemplates: CardSetTemplate[];
  onSelectTemplate: (template: CardSetTemplate) => void;
}

export function HostDeckSelector({
  selectedTemplate,
  availableTemplates,
  onSelectTemplate,
}: HostDeckSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cardPreviews = selectedTemplate.cards.slice(0, 4);

  const filteredDecks = availableTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section className="game-panel p-6 rounded-3xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <span className="text-amber-500 font-extrabold">2.</span> Character Deck
        </h2>

        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            setIsModalOpen(true);
          }}
          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer"
        >
          Change Deck
        </button>
      </div>

      {/* Selected Deck Card Preview */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar Preview Stack */}
          <div className="flex -space-x-3 overflow-hidden shrink-0">
            {cardPreviews.map((card, idx) => (
              <div
                key={card.id || idx}
                className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-950 shrink-0"
              >
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-base font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {selectedTemplate.title}
            </h3>
            <p className="text-slate-400 text-xs line-clamp-1">{selectedTemplate.description}</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-extrabold text-amber-400 shrink-0 self-end sm:self-auto">
          {selectedTemplate.cards.length} Cards
        </span>
      </div>

      {/* Deck Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="game-panel w-full max-w-2xl max-h-[85vh] p-6 rounded-3xl border border-white/10 flex flex-col shadow-2xl relative"
            style={{ background: 'rgba(13, 19, 36, 0.98)' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Select Game Deck
                  </h3>
                  <p className="text-slate-400 text-xs">Choose the deck for your match room</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                aria-label="Close deck picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search decks by title or tag..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Decks List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
              {filteredDecks.map((deck) => {
                const isSelected = deck.id === selectedTemplate.id;
                const previews = deck.cards.slice(0, 4);

                return (
                  <div
                    key={deck.id}
                    onClick={() => {
                      soundFx.playSelect();
                      onSelectTemplate(deck);
                      setIsModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-md shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex -space-x-3 overflow-hidden shrink-0">
                        {previews.map((c, idx) => (
                          <div
                            key={c.id || idx}
                            className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-950 shrink-0"
                          >
                            <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                          </div>
                        ))}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            {deck.title}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 shrink-0">
                            {deck.cards.length} Cards
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs line-clamp-1">{deck.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredDecks.length === 0 && (
                <p className="text-xs text-slate-500 py-8 text-center">No matching decks found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
