'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string | number = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  /** Extra classes on the trigger button */
  className?: string;
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

export function Select<T extends string | number = string>({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  size = 'sm',
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2 text-sm gap-2',
  }[size];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between min-w-[100px] font-semibold rounded-xl border transition-all cursor-pointer
          bg-slate-900 border-slate-700 text-slate-200
          hover:border-slate-600 hover:bg-slate-800
          focus:outline-none focus:border-amber-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses}`}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown
          className={`shrink-0 transition-transform duration-150 text-slate-400 ${
            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 z-[200] min-w-full w-max max-w-[240px] py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          style={{ background: 'rgba(10, 14, 28, 0.98)' }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer text-left
                  ${isSelected
                    ? 'text-amber-300 bg-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3 h-3 shrink-0 text-amber-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
