'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  maxWidth?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  maxWidth = '280px',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-900 border-y-transparent border-l-transparent',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}

      <div
        role="tooltip"
        aria-hidden={!isVisible}
        style={{ maxWidth }}
        className={`absolute z-50 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900/95 border border-amber-500/30 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none whitespace-normal break-words leading-relaxed ${
          positionClasses[position]
        } ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {content}
        {/* Tooltip Arrow */}
        <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
      </div>
    </div>
  );
}
