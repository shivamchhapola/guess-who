'use client';

import React, { useState, useEffect } from 'react';
import { CardSetTemplate } from '@/types/game';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { createClient } from '@/lib/supabase/client';
import { Search, Sparkles, Play, PlusCircle, User, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CardSetTemplate[]>([CLASSIC_GUESS_WHO_TEMPLATE]);

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

          setTemplates([CLASSIC_GUESS_WHO_TEMPLATE, ...formatted]);
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
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="w-full border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Back to Home</span>
          </Link>

          <span className="text-sm font-extrabold tracking-tight">
            Template <span className="gradient-text font-black">Library</span>
          </span>

          <Link
            href="/create"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Template</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-100 mb-1">
              Community Template Library
            </h1>
            <p className="text-slate-400 text-sm">
              Discover and play custom Guess Who sets created by players around the world.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Tag Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedTag === null
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'glass-card text-slate-400 hover:text-slate-200'
            }`}
          >
            All Templates
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedTag === tag
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'glass-card text-slate-400 hover:text-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
            >
              <div>
                {/* Preview Thumbnail Grid */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-950/80 border border-white/5 mb-4 aspect-[2/1] overflow-hidden">
                  {template.cards.slice(0, 8).map((card) => (
                    <div key={card.id} className="relative w-full h-full rounded-lg overflow-hidden bg-slate-900">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {template.title}
                  </h3>
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 mb-4">
                  {template.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                  <User className="w-3.5 h-3.5" />
                  <span>By {template.creatorName}</span>
                  <span>•</span>
                  <span>{template.cards.length} Cards</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                <Link
                  href="/play/practice"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white gradient-btn rounded-xl shadow-md transition-all hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Set</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
