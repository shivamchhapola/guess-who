'use client';

import React, { useState } from 'react';
import { Tag, Search, X, ChevronDown } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface TagFilterBarProps {
  topTags: string[];
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  topTags,
  allTags,
  selectedTag,
  onSelectTag,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  const remainingTags = allTags.filter((t) => !topTags.includes(t));
  const filteredRemaining = remainingTags.filter((t) =>
    t.toLowerCase().includes(tagSearch.toLowerCase().trim())
  );

  const isSelectedTagInTop = selectedTag === null || topTags.includes(selectedTag);

  const handleTagClick = (tag: string | null) => {
    soundFx.playSelect();
    onSelectTag(tag);
    setIsPopoverOpen(false);
  };

  return (
    <div className="relative mb-8">
      {/* Popular Tags Row (Wrap Grid Layout - No ugly scrollbars!) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* All Decks Pill */}
        <button
          type="button"
          onClick={() => handleTagClick(null)}
          className={`h-9 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
            selectedTag === null
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
          }`}
        >
          All Decks
        </button>

        {/* Top 10 Popular Tag Pills */}
        {topTags.map((tag) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(isSelected ? null : tag)}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
              }`}
            >
              <span>#{tag}</span>
            </button>
          );
        })}

        {/* If active tag is not in top 10, display it as a highlighted pill */}
        {!isSelectedTagInTop && selectedTag && (
          <button
            type="button"
            onClick={() => handleTagClick(null)}
            className="h-9 px-3.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>#{selectedTag}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* More Tags Dropdown Trigger */}
        {remainingTags.length > 0 && (
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setIsPopoverOpen((prev) => !prev);
            }}
            className="h-9 px-3.5 rounded-xl text-xs font-bold bg-slate-900/90 text-amber-400 hover:text-amber-300 hover:bg-slate-800/90 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>More Tags ({remainingTags.length})</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPopoverOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* More Tags Search Popover Panel */}
      {isPopoverOpen && (
        <div
          className="absolute left-0 top-full mt-2 z-40 w-72 sm:w-80 p-4 rounded-2xl game-panel border border-amber-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{ background: 'rgba(13, 19, 36, 0.98)' }}
        >
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Explore All Tags
            </span>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tag Search Input */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search all tags..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Tags List */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5">
            {filteredRemaining.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}

            {filteredRemaining.length === 0 && (
              <p className="text-xs text-slate-500 py-3 text-center w-full">No matching tags found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
