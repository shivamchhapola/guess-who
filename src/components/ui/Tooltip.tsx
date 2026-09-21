'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  /** Which side the tooltip appears on */
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  maxWidth?: string;
  /** Milliseconds before the tooltip appears. Prevents flicker on fast mouse-throughs. */
  delay?: number;
}

// ─── Direction config ─────────────────────────────────────────────────────────

/** Panel offset from the trigger */
const PANEL_OFFSET: Record<string, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-3',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
  left:   'right-full top-1/2 -translate-y-1/2 mr-3',
  right:  'left-full top-1/2 -translate-y-1/2 ml-3',
};

/**
 * Entry translate class — tooltip starts offset from the trigger and slides in.
 * On exit the same translate is applied (opacity fades out while it drifts back).
 */
const ENTER_TRANSLATE: Record<string, string> = {
  top:    'translate-y-1.5',
  bottom: '-translate-y-1.5',
  left:   'translate-x-1.5',
  right:  '-translate-x-1.5',
};

/**
 * Arrow: a small rotated square with selective borders to form a caret.
 * bg + two border sides are styled inline; position classes are Tailwind.
 */
const ARROW_POSITION: Record<string, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 -translate-y-[5px] rotate-45',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-[5px] rotate-45',
  left:   'left-full top-1/2 -translate-y-1/2 -translate-x-[5px] rotate-45',
  right:  'right-full top-1/2 -translate-y-1/2 translate-x-[5px] rotate-45',
};

/** Which two border-sides of the rotated square should be visible (facing outward) */
const ARROW_BORDER: Record<string, React.CSSProperties> = {
  top:    { borderBottomWidth: 1, borderRightWidth: 1, borderTopWidth: 0, borderLeftWidth: 0 },
  bottom: { borderTopWidth: 1, borderLeftWidth: 1, borderBottomWidth: 0, borderRightWidth: 0 },
  left:   { borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 0, borderLeftWidth: 0 },
  right:  { borderBottomWidth: 1, borderLeftWidth: 1, borderTopWidth: 0, borderRightWidth: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  maxWidth = '280px',
  delay = 160,
}: TooltipProps) {
  /**
   * Two-phase visibility:
   *  `mounted`  — whether the tooltip node exists in the DOM
   *  `visible`  — whether CSS shows it (controls opacity/translate transition)
   *
   * Show: mount → next frame → set visible  (triggers enter animation)
   * Hide: clear visible → wait for transition → unmount (ensures exit animation plays)
   */
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const showTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef   = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current)  clearTimeout(showTimer.current);
    if (hideTimer.current)  clearTimeout(hideTimer.current);
    if (frameRef.current)   cancelAnimationFrame(frameRef.current);
  }, []);

  const show = useCallback(() => {
    clearTimers();
    showTimer.current = setTimeout(() => {
      setMounted(true);
      // Give the DOM a frame to paint the unmounted state before transitioning in
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = requestAnimationFrame(() => setVisible(true));
      });
    }, delay);
  }, [delay, clearTimers]);

  const hide = useCallback(() => {
    clearTimers();
    setVisible(false);
    // Wait for exit transition (matches duration-200 below) then unmount
    hideTimer.current = setTimeout(() => setMounted(false), 220);
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!content) return <>{children}</>;

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onTouchStart={show}
      onTouchEnd={hide}
    >
      {children}

      {mounted && (
        <div
          role="tooltip"
          aria-hidden={!visible}
          style={{ maxWidth, zIndex: 200 }}
          className={`
            absolute pointer-events-none select-none
            ${PANEL_OFFSET[position]}
            transition-all duration-200 ease-out
            ${visible
              ? 'opacity-100 translate-y-0 translate-x-0 scale-100'
              : `opacity-0 scale-[0.97] ${ENTER_TRANSLATE[position]}`
            }
          `}
        >
          {/* Glass panel */}
          <div
            className="relative px-3 py-2.5 rounded-2xl text-xs font-medium text-slate-100 whitespace-normal break-words leading-relaxed"
            style={{
              background: 'rgba(6, 9, 20, 0.97)',
              border: '1px solid rgba(245,158,11,0.22)',
              backdropFilter: 'blur(20px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
              boxShadow:
                '0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
            }}
          >
            {content}

            {/* Arrow — rotated square with selective border sides */}
            <div
              className={`absolute w-[10px] h-[10px] ${ARROW_POSITION[position]}`}
              style={{
                background: 'rgba(6, 9, 20, 0.97)',
                borderColor: 'rgba(245,158,11,0.22)',
                borderStyle: 'solid',
                ...ARROW_BORDER[position],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
