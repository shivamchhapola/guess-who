'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, User, Eye, Sparkles, X, Filter, Users, Play } from 'lucide-react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import { NavHeader } from '@/components/NavHeader';
import { SetPreviewModal } from '@/components/SetPreviewModal';
import {
  getDisplayTags,
  getTruncatedDescription,
  getCharacterCountLabel,
  getCreatorLabel,
  matchesSearch,
  isCustomSet,
} from '@/lib/setUtils';

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CardSetTemplate | null>(null);
  const [templates, setTemplates] = useState<CardSetTemplate[]>([
    ...ALL_POPULAR_TEMPLATES,
    CLASSIC_GUESS_WHO_TEMPLATE,
  ]);

  const supabase = createClient();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data: dbTemplates } = await supabase
          .from('templates')
          .select('*, cards(*)')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (dbTemplates && dbTemplates.length > 0) {
          const formatted: CardSetTemplate[] = dbTemplates.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            creatorName: t.creator_name || 'Community Creator',
            isPublic: t.is_public,
            tags: t.tags || ['Custom'],
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            cards: (t.cards || []).map((c: { id: string; name: string; image_url: string; attributes: Record<string, unknown> }) => ({
              id: c.id,
              name: c.name,
              imageUrl: c.image_url,
              attributes: c.attributes || {},
            })),
          }));
          setTemplates([...ALL_POPULAR_TEMPLATES, CLASSIC_GUESS_WHO_TEMPLATE, ...formatted]);
        }
      } catch (err) {
        console.warn('Could not load remote templates:', err);
      }
    }
    fetchTemplates();
  }, [supabase]);

  const filteredTemplates = templates.filter((t) => {
    const matchesQ = matchesSearch(t, searchQuery);
    const matchesT = selectedTag ? (t.tags || []).includes(selectedTag) : true;
    return matchesQ && matchesT;
  });

  const allTags = Array.from(new Set(templates.flatMap((t) => t.tags || []))).sort();

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader activePage="templates" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Game Set Library
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-400"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                {filteredTemplates.length} {filteredTemplates.length === 1 ? 'Set' : 'Sets'}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Discover character sets or create your own custom Guess Who board.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, tag, or creator..."
                className="pl-9 pr-9 py-2.5 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none w-64 transition-all"
                style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(71,85,105,0.6)' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(71,85,105,0.6)')}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Link
              href="/create"
              className="game-btn-primary text-sm py-2.5 px-4 shrink-0"
              style={{ borderRadius: '0.75rem' }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Set</span>
            </Link>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: selectedTag === null ? '#f59e0b' : 'rgba(30,41,59,0.7)',
              color: selectedTag === null ? '#0a0f1a' : '#94a3b8',
              border: '1px solid ' + (selectedTag === null ? 'transparent' : 'rgba(71,85,105,0.4)'),
            }}
          >
            All Sets ({templates.length})
          </button>
          {allTags.map((tag) => {
            const count = templates.filter((t) => (t.tags || []).includes(tag)).length;
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                style={{
                  background: isSelected ? '#f59e0b' : 'rgba(30,41,59,0.7)',
                  color: isSelected ? '#0a0f1a' : '#94a3b8',
                  border: '1px solid ' + (isSelected ? 'transparent' : 'rgba(71,85,105,0.4)'),
                }}
              >
                <span>#{tag}</span>
                <span
                  className="text-[10px] px-1.5 py-0.2 rounded-full font-mono"
                  style={{
                    background: isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                    color: isSelected ? '#0a0f1a' : '#64748b',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const { visibleTags, extraCount } = getDisplayTags(template, 3);
            const isCommunity = isCustomSet(template);

            return (
              <div
                key={template.id}
                className="game-panel p-5 rounded-3xl text-left group transition-all duration-200 flex flex-col justify-between"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(10,15,26,0.95) 100%)',
                }}
              >
                <div>
                  {/* Header Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"
                      style={{
                        background: isCommunity ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)',
                        border: `1px solid ${isCommunity ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        color: isCommunity ? '#a78bfa' : '#f59e0b',
                      }}
                    >
                      {isCommunity ? <Users className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      {isCommunity ? 'Community Set' : 'Verified Deck'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {getCharacterCountLabel(template)}
                    </span>
                  </div>

                  {/* 8-Card Thumbnail Grid */}
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(template)}
                    className="w-full text-left focus:outline-none cursor-pointer"
                  >
                    <div
                      className="grid grid-cols-4 gap-1.5 rounded-2xl overflow-hidden mb-4 transition-transform group-hover:scale-[1.01]"
                      style={{ background: '#07090f', aspectRatio: '2/1', padding: '0.375rem', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      {template.cards.slice(0, 8).map((card) => (
                        <div key={card.id} className="relative rounded-lg overflow-hidden" style={{ background: '#0f172a' }}>
                          <Image src={card.imageUrl} alt={card.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                        </div>
                      ))}
                    </div>

                    <h3
                      className="text-lg font-black text-white mb-1 group-hover:text-amber-400 transition-colors line-clamp-1"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {template.title}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3 min-h-[2rem]">
                      {getTruncatedDescription(template.description, 100)}
                    </p>
                  </button>
                </div>

                <div>
                  {/* Creator & Tags */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{getCreatorLabel(template)}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {visibleTags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                          style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8', border: '1px solid rgba(71,85,105,0.3)' }}
                        >
                          #{t}
                        </span>
                      ))}
                      {extraCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono text-slate-500">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(template)}
                      className="py-2 px-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/host?template=${template.id}`)}
                      className="game-btn-primary py-2 px-3 text-xs justify-center"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Host</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="game-panel p-12 rounded-3xl text-center max-w-md mx-auto my-12" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
            <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              No matching sets found
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Try searching for something else or clear your search and tag filters.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
              className="game-btn-secondary text-sm py-2.5 px-5"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      <SetPreviewModal
        template={previewTemplate}
        isOpen={previewTemplate !== null}
        onClose={() => setPreviewTemplate(null)}
        primaryActionLabel="Host Multiplayer Room"
        onSelectSet={(tpl) => router.push(`/host?template=${tpl.id}`)}
        secondaryActionLabel="Play Solo Practice"
        onSecondaryAction={(tpl) => router.push(`/play/practice?template=${tpl.id}`)}
      />
    </div>
  );
}
