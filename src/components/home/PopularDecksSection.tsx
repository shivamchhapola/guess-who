'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, ArrowRight } from 'lucide-react';
import { CardSetTemplate } from '@/types/game';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';

interface PopularDecksSectionProps {
  onSelectTemplate: (template: CardSetTemplate) => void;
}

export function PopularDecksSection({ onSelectTemplate }: PopularDecksSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-black text-white"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Popular Character Decks
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Preview character cards before hosting or playing.
          </p>
        </div>
        <Link
          href="/templates"
          className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto"
        >
          View All Decks <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {ALL_POPULAR_TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelectTemplate(tpl)}
            className="game-panel p-4 sm:p-5 rounded-3xl text-left group transition-all duration-200 w-full active:scale-[0.99]"
            style={{ border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            {/* Photo Grid Preview */}
            <div
              className="grid grid-cols-4 gap-1 sm:gap-1.5 rounded-2xl overflow-hidden mb-3.5"
              style={{ background: '#07090f', aspectRatio: '2/1', padding: '0.375rem' }}
            >
              {tpl.cards.slice(0, 8).map(c => (
                <div key={c.id} className="relative rounded-lg overflow-hidden" style={{ background: '#0f172a' }}>
                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>

            <h3
              className="text-base sm:text-lg font-black text-white mb-1 group-hover:text-amber-400 transition-colors line-clamp-1"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {tpl.title}
            </h3>
            <p className="text-slate-400 text-xs line-clamp-2 mb-3.5 leading-relaxed">{tpl.description}</p>

            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                {tpl.cards.length} Characters
              </span>
              <span className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-400 group-hover:underline">
                <Eye className="w-3.5 h-3.5" />
                Preview Cards
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
