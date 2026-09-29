'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { timeAgo } from '../../lib/format';
import type { Notification } from '../../lib/types';

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const { data } = await api.get<Notification[]>('/notifications'); // Axios: GET /notifications (polling)
      setItems(data);
    } catch {
      /* silent: the bell just stays as-is until the next poll succeeds */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.patch('/notifications/read-all'); // Axios: PATCH /notifications/read-all
  }

  async function markOne(n: Notification) {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      await api.patch(`/notifications/${n.id}/read`); // Axios: PATCH /notifications/:id/read
    }
    setOpen(false);
  }

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-2 hover:bg-subtle hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-danger px-[3px] text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[90vw] animate-rise-in overflow-hidden rounded-lg border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-3">You&apos;re all caught up.</p>}
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.link || '#'}
                onClick={() => markOne(n)}
                className={`block border-b border-line/70 px-4 py-3 text-[13px] leading-snug last:border-0 hover:bg-subtle ${!n.isRead ? 'bg-brand-soft/40' : ''}`}
              >
                <span className={!n.isRead ? 'font-medium text-ink' : 'text-ink-2'}>{n.content}</span>
                <span className="mt-0.5 block text-[11px] text-ink-3">{timeAgo(n.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
