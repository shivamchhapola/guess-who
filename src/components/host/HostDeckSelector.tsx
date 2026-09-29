'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CardSetTemplate } from '@/types/game';
import { Layers, Eye } from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { SetPreviewModal } from '@/components/SetPreviewModal';
import { getCreatorLabel, getCharacterCountLabel } from '@/lib/setUtils';
import { DeckPickerModal } from '@/components/ui/DeckPickerModal';

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
  const [previewTemplate, setPreviewTemplate] = useState<CardSetTemplate | null>(null);
  const [pendingTagFilter, setPendingTagFilter] = useState<string | null>(null);

  const cardPreviews = selectedTemplate.cards.slice(0, 4);
  const isPreviewingSelected = previewTemplate?.id === selectedTemplate.id;

  return (
    <section className="game-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative">
      {/* Section Header */}
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
          className="px-4 py-2 rounded-xl text-xs font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/10"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Change Deck</span>
        </button>
      </div>

      {/* Selected Deck Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex flex-col gap-4 shadow-xl">
        {/* Row 1: Title & Card Count */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg sm:text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {selectedTemplate.title}
          </h3>

          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-extrabold text-amber-400 shrink-0">
            {getCharacterCountLabel(selectedTemplate)}
          </span>
        </div>

        {/* Row 2: Description, Creator & Interactive Tags */}
        <div>
          <p className="text-slate-300 text-xs leading-relaxed mb-2">
            {selectedTemplate.description || 'Custom character deck for online GuessWhooo matches.'}
          </p>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-slate-500 text-[11px] font-medium">
              {getCreatorLabel(selectedTemplate)}
            </p>
            {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTemplate.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setPendingTagFilter(tag);
                      setIsModalOpen(true);
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 transition-all cursor-pointer"
                    title={`Filter by #${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Character Thumbnails & Preview Button */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">Preview:</span>
            <div className="flex -space-x-2.5 overflow-hidden">
              {cardPreviews.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-900 shadow-md shrink-0"
                >
                  <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setPreviewTemplate(selectedTemplate);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Eye className="w-4 h-4" />
            <span>Preview All Cards</span>
          </button>
        </div>
      </div>

      {/* Shared Deck Picker Modal */}
      <DeckPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableTemplates={availableTemplates}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={(tpl) => {
          soundFx.playSelect();
          onSelectTemplate(tpl);
          setIsModalOpen(false);
        }}
        initialTag={pendingTagFilter}
        onInitialTagConsumed={() => setPendingTagFilter(null)}
      />

      {/* Set Preview Modal for the "Preview All Cards" button on the summary card */}
      <SetPreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelectSet={
          isPreviewingSelected
            ? undefined
            : (tpl) => {
                soundFx.playSelect();
                onSelectTemplate(tpl);
                setPreviewTemplate(null);
              }
        }
        primaryActionLabel="Select Deck for Match"
      />
    </section>
  );
}
