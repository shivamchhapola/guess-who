'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import { NavHeader } from '@/components/NavHeader';
import { SetPreviewModal } from '@/components/SetPreviewModal';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TagFilterBar } from '@/components/templates/TagFilterBar';
import { TemplatesHeader } from '@/components/templates/TemplatesHeader';
import { Pagination } from '@/components/templates/Pagination';
import { HomeFooter } from '@/components/home/HomeFooter';
import { matchesSearch } from '@/lib/setUtils';

const ITEMS_PER_PAGE = 9;

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState<CardSetTemplate | null>(null);
  const [templates, setTemplates] = useState<CardSetTemplate[]>([
    ...ALL_POPULAR_TEMPLATES,
    CLASSIC_GUESS_WHO_TEMPLATE,
  ]);

  const supabase = createClient();

  // Load public community templates from Supabase
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

  // Compute tag frequencies and rank top tags
  const { topTags, allTags } = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    const sortedAll = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const top = sortedAll.slice(0, 10);
    return { topTags: top, allTags: sortedAll };
  }, [templates]);

  // Filter templates by search query & tag selection
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesQ = matchesSearch(t, searchQuery);
      const matchesT = selectedTag ? (t.tags || []).includes(selectedTag) : true;
      return matchesQ && matchesT;
    });
  }, [templates, searchQuery, selectedTag]);

  // Reset pagination to page 1 whenever filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  // Pagination calculation (9 items per page)
  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTemplates.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredTemplates, currentPage]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader activePage="templates" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header & Controls */}
        <TemplatesHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filteredCount={filteredTemplates.length}
        />

        {/* Tag Filters Bar (Top popular flex row + popover) */}
        <TagFilterBar
          topTags={topTags}
          allTags={allTags}
          selectedTag={selectedTag}
          onSelectTag={handleTagSelect}
        />

        {/* Template Cards Grid (9 items per page) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={(tpl) => setPreviewTemplate(tpl)}
              onHostRoom={(id) => router.push(`/host?template=${id}`)}
              onSoloPractice={(id) => router.push(`/play/practice?template=${id}`)}
            />
          ))}
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTemplates.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="decks"
        />

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="game-panel p-10 sm:p-12 rounded-3xl text-center max-w-md mx-auto my-12 border border-slate-700/50 shadow-xl">
            <Filter className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              No matching decks found
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Try searching for a different keyword or reset your active tag filters.
            </p>
            <button
              type="button"
              onClick={() => {
                handleSearchChange('');
                handleTagSelect(null);
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <HomeFooter />

      {/* Set Preview Modal */}
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
