'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, X, Filter } from 'lucide-react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import { NavHeader } from '@/components/NavHeader';
import { SetPreviewModal } from '@/components/SetPreviewModal';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TagFilterBar } from '@/components/templates/TagFilterBar';
import { matchesSearch } from '@/lib/setUtils';

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
          const builtIn = [...ALL_POPULAR_TEMPLATES, CLASSIC_GUESS_WHO_TEMPLATE];
          const existingIds = new Set(builtIn.map((b) => b.id));
          const formatted: CardSetTemplate[] = dbTemplates
            .filter((t) => !existingIds.has(t.id))
            .map((t) => ({
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
          setTemplates([...builtIn, ...formatted]);
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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25">
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
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, tag, or creator..."
                className="pl-9 pr-9 py-2.5 rounded-xl text-xs font-semibold bg-slate-950/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-64 transition-all"
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
              className="game-btn-primary text-xs py-2.5 px-4 shrink-0 font-bold flex items-center gap-1.5"
              style={{ borderRadius: '0.75rem' }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Set</span>
            </Link>
          </div>
        </div>

        {/* Tag Filters Component */}
        <div className="mb-8">
          <TagFilterBar
            allTags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>

        {/* Template Cards Grid Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={(tpl) => setPreviewTemplate(tpl)}
              onHostRoom={(id) => router.push(`/host?template=${id}`)}
              onSoloPractice={(id) => router.push(`/play/practice?template=${id}`)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto my-12 border border-slate-700/50 shadow-xl">
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
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl text-xs transition-colors"
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
