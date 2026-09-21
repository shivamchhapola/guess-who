'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';
import type { ToastItem, ToastVariant } from '@/hooks/useToast';

/* ─── Single Toast Tile ─── */
interface ToastTileProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const variantConfig: Record<
  ToastVariant,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  error: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.35)',
    text: '#fca5a5',
    icon: <AlertCircle className="w-4 h-4 shrink-0" />,
  },
  success: {
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
    text: '#6ee7b7',
    icon: <CheckCircle className="w-4 h-4 shrink-0" />,
  },
  warning: {
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    text: '#fcd34d',
    icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
  },
};

function ToastTile({ toast, onDismiss }: ToastTileProps) {
  const [visible, setVisible] = useState(false);
  const cfg = variantConfig[toast.variant];

  // Animate in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: 'rgba(13,19,36,0.97)',
        border: `1px solid ${cfg.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease',
      }}
      className="flex items-start gap-3 px-4 py-3 rounded-2xl max-w-sm w-full pointer-events-auto backdrop-blur-md"
    >
      <span style={{ color: cfg.text }} className="mt-0.5">
        {cfg.icon}
      </span>
      <p
        className="flex-1 text-xs font-semibold leading-snug"
        style={{ color: cfg.text }}
      >
        {toast.message}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer mt-0.5"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Container (mount once per page) ─── */
interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end pointer-events-none sm:bottom-6 sm:right-6"
    >
      {toasts.map((t) => (
        <ToastTile key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
