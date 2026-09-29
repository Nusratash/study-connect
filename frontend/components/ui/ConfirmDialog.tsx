'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]" role="dialog" aria-modal>
      <div className="w-full max-w-sm animate-rise-in rounded-lg border border-line bg-surface p-6 shadow-pop">
        <div className="flex items-start gap-3">
          {danger && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>
          )}
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary btn-sm">Cancel</button>
          <button ref={ref} onClick={onConfirm} disabled={busy} className={danger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
