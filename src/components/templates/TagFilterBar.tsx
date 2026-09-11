'use client';

import React from 'react';

interface TagFilterBarProps {
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  allTags,
  selectedTag,
  onSelectTag,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar text-xs font-bold">
      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
          selectedTag === null
            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
            : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
        }`}
      >
        All Decks
      </button>

      {allTags.map((tag) => {
        const isSelected = selectedTag === tag;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(isSelected ? null : tag)}
            className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
              isSelected
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};
