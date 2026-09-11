'use client';

import React from 'react';
import Image from 'next/image';
import { CardSetTemplate } from '@/types/game';
import { Eye, Users, Play } from 'lucide-react';
import { getDisplayTags, getTruncatedDescription, getCreatorLabel } from '@/lib/setUtils';

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
    <div className="glass-panel p-5 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300">
      <div>
        {/* Card Avatar Row Preview */}
        <div className="flex items-center gap-1.5 mb-4 p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
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

          <div className="ml-auto px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300">
            {template.cards.length} cards
          </div>
        </div>

        {/* Title & Creator */}
        <div className="mb-2">
          <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {template.title}
          </h3>
          <p className="text-slate-400 text-xs font-semibold">{getCreatorLabel(template)}</p>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-xs leading-relaxed mb-4 min-h-[36px]">
          {getTruncatedDescription(template.description)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-cyan-400 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
              +{extraCount} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => onPreview(template)}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Inspect Cards"
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSoloPractice(template.id)}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Practice</span>
        </button>

        <button
          type="button"
          onClick={() => onHostRoom(template.id)}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Host</span>
        </button>
      </div>
    </div>
  );
};
