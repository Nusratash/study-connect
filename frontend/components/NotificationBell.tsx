'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../lib/api';

export default function NotificationBell() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const { data } = await api.get('/notifications'); // AXIOS GET
      setItems(data);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  async function markAll() {
    await api.patch('/notifications/read-all'); // AXIOS PATCH
    load();
  }

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        <Bell className="w-5 h-5" />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-sm">Notifications</span>
            <button onClick={markAll} className="text-xs text-brand-600 hover:underline">Mark all read</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 && <p className="p-4 text-sm text-slate-500">Nothing yet.</p>}
            {items.map((n) => (
              <div key={n.id} className={`px-4 py-3 text-sm border-b border-slate-50 dark:border-slate-800 ${n.isRead ? 'text-slate-500' : 'bg-brand-50/60 dark:bg-brand-700/10 font-medium'}`}>
                {n.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
