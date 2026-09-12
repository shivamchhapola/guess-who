'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { soundFx } from '@/lib/audio';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      soundFx.playSelect();
      onPageChange(page);
      // Smooth scroll to top of template grid
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800/80 mt-10">
      {/* Items Summary */}
      <p className="text-xs sm:text-sm font-medium text-slate-400">
        Showing <span className="font-bold text-white">{startItem}</span>–
        <span className="font-bold text-white">{endItem}</span> of{' '}
        <span className="font-bold text-amber-400">{totalItems}</span> decks
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
          className={`h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
            currentPage === 1
              ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 active:scale-[0.98]'
          }`}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((num, idx) => {
            if (typeof num === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-10 flex items-center justify-center text-xs text-slate-500 font-mono"
                >
                  ...
                </span>
              );
            }

            const isActive = num === currentPage;

            return (
              <button
                key={num}
                type="button"
                onClick={() => handlePageClick(num)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.05]'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          className={`h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
            currentPage === totalPages
              ? 'bg-slate-900/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
              : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 active:scale-[0.98]'
          }`}
          aria-label="Next Page"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
