'use client';

import React from 'react';
import Image from 'next/image';
import { X, Play, Users, Check, Sparkles, User, Tag } from 'lucide-react';
import { CardSetTemplate } from '@/types/game';
import { getCreatorLabel, getCharacterCountLabel } from '@/lib/setUtils';

interface SetPreviewModalProps {
  template: CardSetTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSet?: (template: CardSetTemplate) => void;
  primaryActionLabel?: string;
  onSecondaryAction?: (template: CardSetTemplate) => void;
  secondaryActionLabel?: string;
}

export function SetPreviewModal({
  template,
  isOpen,
  onClose,
  onSelectSet,
  primaryActionLabel = 'Use This Set',
  onSecondaryAction,
  secondaryActionLabel = 'Solo Practice',
}: SetPreviewModalProps) {
  if (!isOpen || !template) return null;

  return (
    <div
      className="modal-backdrop z-[100] fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 7, 13, 0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6 sm:p-8 animate-slide-in-up shadow-2xl relative"
        style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(15, 23, 42, 0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                SET PREVIEW
              </span>
              <span className="text-xs text-slate-500 font-semibold">•</span>
              <span className="text-xs font-bold text-slate-400">
                {getCharacterCountLabel(template)}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {template.title}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              {template.description || 'No description available for this set.'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{getCreatorLabel(template)}</span>
            </div>

            {/* All Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono"
                    style={{
                      background: 'rgba(245,158,11,0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245,158,11,0.25)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
            title="Close preview modal"
            aria-label="Close preview modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Grid */}
        <div className="flex-1 overflow-y-auto pr-1 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            All Characters ({template.cards.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {template.cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col items-center gap-1.5 group p-1.5 rounded-2xl transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-200 text-center leading-tight truncate w-full px-1">
                  {card.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10 shrink-0">
          {onSecondaryAction && (
            <button
              type="button"
              onClick={() => {
                onSecondaryAction(template);
                onClose();
              }}
              className="py-3.5 px-5 rounded-2xl text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
              title={secondaryActionLabel}
              aria-label={secondaryActionLabel}
            >
              <Play className="w-4 h-4 fill-current text-amber-400" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}

          {onSelectSet ? (
            <button
              type="button"
              onClick={() => {
                onSelectSet(template);
                onClose();
              }}
              className="game-btn-primary flex-1 py-3.5 text-sm justify-center rounded-2xl font-bold flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              title={primaryActionLabel}
              aria-label={primaryActionLabel}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{primaryActionLabel}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="game-btn-primary flex-1 py-3.5 text-sm justify-center rounded-2xl font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              title="Close preview"
              aria-label="Close preview"
            >
              Close Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
