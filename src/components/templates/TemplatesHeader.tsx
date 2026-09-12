'use client';

import Link from 'next/link';
import { Search, PlusCircle, X } from 'lucide-react';

interface TemplatesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
}

export function TemplatesHeader({
  searchQuery,
  onSearchChange,
  filteredCount,
}: TemplatesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
      {/* Title & Deck Count */}
      <div>
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Character <span className="text-amber-400">Decks</span>
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30">
            {filteredCount} {filteredCount === 1 ? 'Deck' : 'Decks'}
          </span>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-lg leading-relaxed">
          Discover ready-made character decks or create your own custom GuessWhooo? board.
        </p>
      </div>

      {/* Controls: Search + Create Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        {/* Search Field */}
        <div className="relative flex-1 md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search decks or tags..."
            aria-label="Search character decks"
            className="w-full h-11 pl-9 pr-9 rounded-2xl text-xs sm:text-sm font-medium bg-slate-950/90 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-all"
            style={{
              caretColor: '#f59e0b',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Create Set Action Button */}
        <Link
          href="/create"
          className="game-btn-primary text-xs sm:text-sm h-11 px-5 font-extrabold flex items-center justify-center gap-2 rounded-2xl shrink-0 active:scale-[0.98] transition-transform"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Create Deck</span>
        </Link>
      </div>
    </div>
  );
}
