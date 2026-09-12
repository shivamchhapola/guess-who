'use client';

import React from 'react';
import Image from 'next/image';
import { CardSetTemplate } from '@/types/game';
import { Eye, Gamepad2, Play } from 'lucide-react';
import { getDisplayTags, getTruncatedDescription, getCreatorLabel } from '@/lib/setUtils';
import { soundFx } from '@/lib/audio';

interface TemplateCardProps {
  template: CardSetTemplate;
  onPreview: (template: CardSetTemplate) => void;
  onHostRoom: (templateId: string) => void;
  onSoloPractice: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPreview,
  onHostRoom,
  onSoloPractice,
}) => {
  const { visibleTags, extraCount } = getDisplayTags(template, 3);
  const cardPreviews = template.cards.slice(0, 4);

  return (
    <div
      className="game-panel p-5 rounded-3xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden"
      style={{
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(15, 23, 42, 0.75)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
    >
      <div>
        {/* Card Avatar Preview Row */}
        <div className="flex items-center justify-between gap-2 mb-4 p-2 rounded-2xl bg-slate-950/80 border border-slate-800/80">
          <div className="flex -space-x-3 overflow-hidden">
            {cardPreviews.map((card, idx) => (
              <div
                key={card.id || idx}
                className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-950 shrink-0"
              >
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-extrabold text-amber-400">
            {template.cards.length} Cards
          </div>
        </div>

        {/* Title & Creator */}
        <div className="mb-2">
          <h3
            className="text-lg font-black text-white group-hover:text-amber-400 transition-colors line-clamp-1"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {template.title}
          </h3>
          <p className="text-slate-400 text-xs font-medium">{getCreatorLabel(template)}</p>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-xs leading-relaxed mb-4 min-h-[36px] line-clamp-2">
          {getTruncatedDescription(template.description)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25"
            >
              #{tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">
              +{extraCount} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            onPreview(template);
          }}
          className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/70 transition-all cursor-pointer shrink-0"
          title="Preview Character Cards"
          aria-label="Preview cards"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            onSoloPractice(template.id);
          }}
          className="flex-1 h-10 px-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>Practice</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playSelect();
            onHostRoom(template.id);
          }}
          className="flex-1 h-10 px-3 rounded-xl text-xs font-extrabold game-btn-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
        >
          <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
          <span>Host Game</span>
        </button>
      </div>
    </div>
  );
};
