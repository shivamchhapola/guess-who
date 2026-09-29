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
  ChevronLeft,
  ChevronRight,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { SetPreviewModal } from '@/components/SetPreviewModal';

const TOP_TAGS_COUNT = 8;
const DECKS_PER_PAGE = 6;

interface DeckPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTemplates: CardSetTemplate[];
  selectedTemplate: CardSetTemplate;
  /** Called when the user picks a deck. Does NOT auto-close — caller decides. */
  onSelectTemplate: (template: CardSetTemplate) => void;
  /** Optional initial tag filter (e.g. when user clicks a tag on the summary card) */
  initialTag?: string | null;
  onInitialTagConsumed?: () => void;
}

export const DeckPickerModal: React.FC<DeckPickerModalProps> = ({
  isOpen,
  onClose,
  availableTemplates,
  selectedTemplate,
  onSelectTemplate,
  initialTag,
  onInitialTagConsumed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag ?? null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<CardSetTemplate | null>(null);

  // Apply initialTag when it changes from outside
  React.useEffect(() => {
    if (initialTag !== undefined && initialTag !== null) {
      setSelectedTag(initialTag);
      onInitialTagConsumed?.();
    }
  }, [initialTag, onInitialTagConsumed]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setCurrentPage(1);
      setIsTagPopoverOpen(false);
      setTagSearch('');
    }
  }, [isOpen]);

  // Extract unique tags ordered by popularity
  const { topTags, remainingTags } = useMemo(() => {
    const counts = new Map<string, number>();
    availableTemplates.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        if (tag && tag.trim()) {
          const key = tag.trim();
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      });
    });
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
    return { topTags: sorted.slice(0, TOP_TAGS_COUNT), remainingTags: sorted.slice(TOP_TAGS_COUNT) };
  }, [availableTemplates]);

  const filteredRemainingTags = useMemo(
    () => remainingTags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase().trim())),
    [remainingTags, tagSearch],
  );

  const isSelectedTagInTop =
    selectedTag === null || topTags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

  const filteredDecks = useMemo(() => {
    return availableTemplates.filter((t) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.creatorName.toLowerCase().includes(query) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(query));

      const matchesTag =
        !selectedTag || (t.tags || []).some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [availableTemplates, searchQuery, selectedTag]);

  const totalPages = Math.max(1, Math.ceil(filteredDecks.length / DECKS_PER_PAGE));
  const paginatedDecks = useMemo(() => {
    const start = (currentPage - 1) * DECKS_PER_PAGE;
    return filteredDecks.slice(start, start + DECKS_PER_PAGE);
  }, [filteredDecks, currentPage]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag: string | null) => {
    soundFx.playSelect();
    if (tag === null) {
      setSelectedTag(null);
    } else {
      setSelectedTag((prev) => (prev?.toLowerCase() === tag.toLowerCase() ? null : tag));
    }
    setCurrentPage(1);
    setIsTagPopoverOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div
          className="game-panel w-full max-w-4xl h-[80vh] min-h-[560px] max-h-[720px] p-5 sm:p-7 rounded-3xl border border-amber-500/30 flex flex-col shadow-2xl relative"
          style={{ background: 'rgba(11, 16, 31, 0.98)' }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="text-xl sm:text-2xl font-black text-white"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Select Character Deck
                </h3>
                <p className="text-slate-400 text-xs">Choose a deck for your match room</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close deck picker"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar & Tag Filter Pills */}
          <div className="flex flex-col gap-2.5 mb-4 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search character decks by title, description, creator, or tags..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
              />
            </div>

            {/* Tag Filter Bar */}
            {(topTags.length > 0 || remainingTags.length > 0) && (
              <div className="relative pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTagToggle(null)}
                    className={`h-8 px-3.5 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center ${
                      selectedTag === null
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    All Decks
                  </button>

                  {topTags.map((tag) => {
                    const isActive = selectedTag?.toLowerCase() === tag.toLowerCase();
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(isActive ? null : tag)}
                        className={`h-8 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                            : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}

                  {!isSelectedTagInTop && selectedTag && (
                    <button
                      type="button"
                      onClick={() => handleTagToggle(null)}
                      className="h-8 px-3 rounded-xl text-[11px] font-black bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      #{selectedTag}
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  {remainingTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setIsTagPopoverOpen((prev) => !prev);
                      }}
                      className="h-8 px-3 rounded-xl text-[11px] font-bold bg-slate-900/90 text-amber-400 hover:text-amber-300 hover:bg-slate-800/90 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Tag className="w-3 h-3" />
                      <span>More ({remainingTags.length})</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${isTagPopoverOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {isTagPopoverOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 z-50 w-64 p-3.5 rounded-2xl border border-amber-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                    style={{ background: 'rgba(13, 19, 36, 0.98)' }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
                      <span className="text-[11px] font-black text-white flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-amber-400" />
                        All Tags
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsTagPopoverOpen(false)}
                        className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="relative mb-2.5">
                      <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Search tags..."
                        className="w-full pl-7 pr-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5">
                      {filteredRemainingTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                            selectedTag?.toLowerCase() === tag.toLowerCase()
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                      {filteredRemainingTags.length === 0 && (
                        <p className="text-[11px] text-slate-500 py-2 text-center w-full">
                          No matching tags
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Decks Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
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
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className="text-base font-black text-white truncate"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                {deck.title}
                              </h4>
                              {isSelected && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                              {deck.description}
                            </p>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 shrink-0">
                            {deck.cards.length} Cards
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 my-2">
                          <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                            {previews.map((c, idx) => (
                              <div
                                key={c.id || idx}
                                className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-slate-900 bg-slate-950 shrink-0"
                              >
                                <Image
                                  src={c.imageUrl}
                                  alt={c.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[130px] text-right">
                            By {deck.creatorName}
                          </span>
                        </div>

                        {deck.tags && deck.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {deck.tags.map((tag) => {
                              const isTagActive = selectedTag?.toLowerCase() === tag.toLowerCase();
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTagToggle(tag);
                                  }}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                    isTagActive
                                      ? 'bg-amber-400 text-slate-950 font-black scale-105'
                                      : 'bg-slate-900/90 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 hover:text-white'
                                  }`}
                                >
                                  #{tag}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

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
                          <span>Preview Cards</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playSelect();
                            onSelectTemplate(deck);
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
                              <span>Active</span>
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
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-medium gap-2 py-12">
                <p>No character decks match your search or selected tag.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                    setCurrentPage(1);
                    setIsTagPopoverOpen(false);
                  }}
                  className="text-amber-400 font-bold hover:underline text-xs mt-1 cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800 text-xs shrink-0">
              <span className="text-slate-400 font-medium">
                Showing{' '}
                <span className="text-white font-bold">
                  {(currentPage - 1) * DECKS_PER_PAGE + 1}
                </span>
                -
                <span className="text-white font-bold">
                  {Math.min(currentPage * DECKS_PER_PAGE, filteredDecks.length)}
                </span>{' '}
                of <span className="text-white font-bold">{filteredDecks.length}</span> decks
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

      {/* Nested preview modal */}
      <SetPreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelectSet={
          previewTemplate?.id === selectedTemplate.id
            ? undefined
            : (tpl) => {
                soundFx.playSelect();
                onSelectTemplate(tpl);
                setPreviewTemplate(null);
              }
        }
        primaryActionLabel="Select Deck for Match"
      />
    </>
  );
};
