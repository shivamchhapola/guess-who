'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { CardSetTemplate } from '@/types/game';
import {
  Layers,
  Check,
  X,
  Search,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { SetPreviewModal } from '@/components/SetPreviewModal';
import { getCreatorLabel, getCharacterCountLabel } from '@/lib/setUtils';

const DECKS_PER_PAGE = 6;

interface HostDeckSelectorProps {
  selectedTemplate: CardSetTemplate;
  availableTemplates: CardSetTemplate[];
  onSelectTemplate: (template: CardSetTemplate) => void;
}

type CategoryFilter = 'all' | 'popular' | 'media' | 'gaming' | 'custom';

export function HostDeckSelector({
  selectedTemplate,
  availableTemplates,
  onSelectTemplate,
}: HostDeckSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CardSetTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique tags across available templates
  const allTags = useMemo(() => {
    const set = new Set<string>();
    availableTemplates.forEach((t) => {
      (t.tags || []).forEach((tag) => set.add(tag.toLowerCase()));
    });
    return Array.from(set).slice(0, 10);
  }, [availableTemplates]);

  // Filtered decks based on search, category, and selected tag
  const filteredDecks = useMemo(() => {
    return availableTemplates.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = !selectedTag || (t.tags || []).some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());

      let matchesCategory = true;
      if (activeCategory === 'popular') {
        matchesCategory = (t.tags || []).some((tag) => ['popular', 'classic', 'featured'].includes(tag.toLowerCase()));
      } else if (activeCategory === 'media') {
        matchesCategory = (t.tags || []).some((tag) => ['office', 'tv', 'movie', 'anime', 'pop culture'].includes(tag.toLowerCase()));
      } else if (activeCategory === 'gaming') {
        matchesCategory = (t.tags || []).some((tag) => ['game', 'gaming', 'pokemon', 'retro'].includes(tag.toLowerCase()));
      } else if (activeCategory === 'custom') {
        matchesCategory = t.isPublic === false || (t.tags || []).includes('Custom') || !['the-office', 'classic-who'].includes(t.id);
      }

      return matchesSearch && matchesTag && matchesCategory;
    });
  }, [availableTemplates, searchQuery, activeCategory, selectedTag]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDecks.length / DECKS_PER_PAGE));
  const paginatedDecks = useMemo(() => {
    const start = (currentPage - 1) * DECKS_PER_PAGE;
    return filteredDecks.slice(start, start + DECKS_PER_PAGE);
  }, [filteredDecks, currentPage]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: CategoryFilter) => {
    soundFx.playSelect();
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag: string) => {
    soundFx.playSelect();
    setSelectedTag((prev) => (prev === tag ? null : tag));
    setCurrentPage(1);
  };

  const cardPreviews = selectedTemplate.cards.slice(0, 4);

  return (
    <section className="game-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative">
      {/* Header */}
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
          className="px-4 py-2 rounded-xl text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/10"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Change Deck ({availableTemplates.length} Available)</span>
        </button>
      </div>

      {/* Selected Deck Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl relative overflow-hidden group">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
          {/* Avatar Previews Stack */}
          <div className="flex -space-x-3 overflow-hidden shrink-0 pt-1">
            {cardPreviews.map((card, idx) => (
              <div
                key={card.id || idx}
                className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-900 shadow-md shrink-0"
              >
                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg sm:text-xl font-black text-white truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {selectedTemplate.title}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-black text-amber-400 uppercase tracking-wider">
                Active Deck
              </span>
            </div>
            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-2">
              {selectedTemplate.description || 'Custom character deck for online GuessWhooo matches.'}
            </p>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span>{getCreatorLabel(selectedTemplate)}</span>
              <span>•</span>
              <span className="text-amber-400">{getCharacterCountLabel(selectedTemplate)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setPreviewTemplate(selectedTemplate);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Preview all cards in this deck"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Preview Deck</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Browse All</span>
          </button>
        </div>
      </div>

      {/* Advanced Deck Selector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="game-panel w-full max-w-4xl max-h-[90vh] p-5 sm:p-7 rounded-3xl border border-amber-500/30 flex flex-col shadow-2xl relative"
            style={{ background: 'rgba(11, 16, 31, 0.98)' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Select Character Deck
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Choose from {availableTemplates.length} custom & community decks for your game room
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close deck picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 mb-4 shrink-0">
              {/* Search + Categories Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search deck title, description, or creator..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar shrink-0">
                  {(
                    [
                      { id: 'all', label: 'All Decks' },
                      { id: 'popular', label: '🔥 Popular' },
                      { id: 'media', label: '🎬 TV & Movies' },
                      { id: 'gaming', label: '🎮 Gaming' },
                      { id: 'custom', label: '🎨 Custom' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filters Row */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
                  <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0 text-[11px]">
                    <Filter className="w-3 h-3" />
                    <span>Tags:</span>
                  </span>
                  {allTags.map((tag) => {
                    const isActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                  {selectedTag && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setSelectedTag(null);
                        setCurrentPage(1);
                      }}
                      className="text-[11px] font-bold text-rose-400 hover:underline shrink-0 ml-1"
                    >
                      Reset Tag
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Decks Grid (2 columns) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[300px]">
              {paginatedDecks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {paginatedDecks.map((deck) => {
                    const isSelected = deck.id === selectedTemplate.id;
                    const previews = deck.cards.slice(0, 4);

                    return (
                      <div
                        key={deck.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 group relative ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                            : 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/70'
                        }`}
                      >
                        <div>
                          {/* Deck Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-white truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                  {deck.title}
                                </h4>
                                {isSelected && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{deck.description}</p>
                            </div>
                            <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 shrink-0">
                              {deck.cards.length} Cards
                            </span>
                          </div>

                          {/* Card Portrait Previews Stack */}
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 my-2">
                            <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                              {previews.map((c, idx) => (
                                <div
                                  key={c.id || idx}
                                  className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-950 shrink-0"
                                >
                                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                                </div>
                              ))}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[130px] text-right">
                              By {deck.creatorName}
                            </span>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.playSelect();
                              setPreviewTemplate(deck);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Preview</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playSelect();
                              onSelectTemplate(deck);
                              setIsModalOpen(false);
                            }}
                            disabled={isSelected}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-default'
                                : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Active Deck</span>
                              </>
                            ) : (
                              <span>Select Deck</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 text-xs font-medium flex flex-col items-center justify-center gap-2">
                  <p>No character decks match your search or filter criteria.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                      setSelectedTag(null);
                      setCurrentPage(1);
                    }}
                    className="text-amber-400 font-bold hover:underline text-xs mt-1"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800 text-xs shrink-0">
                <span className="text-slate-400 font-medium">
                  Showing <span className="text-white font-bold">{(currentPage - 1) * DECKS_PER_PAGE + 1}</span>-
                  <span className="text-white font-bold">{Math.min(currentPage * DECKS_PER_PAGE, filteredDecks.length)}</span> of{' '}
                  <span className="text-white font-bold">{filteredDecks.length}</span> decks
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Set Preview Modal Integration */}
      <SetPreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelectSet={(tpl) => {
          soundFx.playSelect();
          onSelectTemplate(tpl);
          setPreviewTemplate(null);
          setIsModalOpen(false);
        }}
        primaryActionLabel="Select Deck for Match"
      />
    </section>
  );
}
