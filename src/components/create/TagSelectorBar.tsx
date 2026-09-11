'use client';

import React from 'react';
import { Tag, Plus, X } from 'lucide-react';

const SUGGESTED_TAGS = ['Custom', 'Photos', 'Friends', 'Party', 'TV Show', 'Comedy', 'Movies', 'Gaming', 'Anime', 'Celebrities'];

interface TagSelectorBarProps {
  selectedTags: string[];
  customTagInput: string;
  onCustomTagInputChange: (val: string) => void;
  onToggleTag: (tag: string) => void;
  onAddCustomTag: (e: React.KeyboardEvent | React.MouseEvent) => void;
}

export const TagSelectorBar: React.FC<TagSelectorBarProps> = ({
  selectedTags,
  customTagInput,
  onCustomTagInputChange,
  onToggleTag,
  onAddCustomTag,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-cyan-400" />
        Deck Tags & Categorization
      </label>

      {/* Suggested Tags */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tag}</span>
              {isSelected && <X className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {/* Custom Tag Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customTagInput}
          onChange={(e) => onCustomTagInputChange(e.target.value)}
          onKeyDown={onAddCustomTag}
          placeholder="Add custom tag (e.g. #office-party)..."
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="button"
          onClick={onAddCustomTag}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
