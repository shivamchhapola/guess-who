'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, User, Eye } from 'lucide-react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';
import { createClient } from '@/lib/supabase/client';
import { NavHeader } from '@/components/NavHeader';
import { SetPreviewModal } from '@/components/SetPreviewModal';

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
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? t.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(templates.flatMap((t) => t.tags)));

  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader activePage="templates" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Game Set Library
            </h1>
            <p className="text-slate-400 text-sm">
              Click any set to preview all characters, then play or host a room.
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
                placeholder="Search sets..."
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none w-56"
                style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(71,85,105,0.6)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(245,158,11,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(71,85,105,0.6)')}
              />
            </div>
            <Link
              href="/create"
              className="game-btn-primary text-sm py-2.5 px-4"
              style={{ borderRadius: '0.75rem' }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Set</span>
            </Link>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
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
            All Sets
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: selectedTag === tag ? '#f59e0b' : 'rgba(30,41,59,0.7)',
                color: selectedTag === tag ? '#0a0f1a' : '#94a3b8',
                border: '1px solid ' + (selectedTag === tag ? 'transparent' : 'rgba(71,85,105,0.4)'),
              }}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setPreviewTemplate(template)}
              className="game-panel p-5 rounded-3xl text-left group transition-all w-full"
              style={{ border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            >
              {/* Preview Grid */}
              <div
                className="grid grid-cols-4 gap-1.5 rounded-2xl overflow-hidden mb-4"
                style={{ background: '#07090f', aspectRatio: '2/1', padding: '0.375rem' }}
              >
                {template.cards.slice(0, 8).map((card) => (
                  <div key={card.id} className="relative rounded-lg overflow-hidden" style={{ background: '#0f172a' }}>
                    <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-black text-white mb-1 group-hover:text-amber-400 transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}>
                {template.title}
              </h3>
              <p className="text-slate-400 text-xs line-clamp-2 mb-3">{template.description || 'No description.'}</p>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                <User className="w-3.5 h-3.5" />
                <span>By {template.creatorName}</span>
                <span>•</span>
                <span>{template.cards.length} Cards</span>
              </div>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                      style={{ background: 'rgba(30,41,59,0.8)', color: '#64748b', border: '1px solid rgba(71,85,105,0.3)' }}>
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </span>
              </div>
            </button>
          ))}
        </div>
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
