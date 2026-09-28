'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function SavedMaterials() {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    const { data } = await api.get('/bookmarks'); // AXIOS GET
    setItems(data);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  async function remove(id: string) {
    await api.delete(`/bookmarks/${id}`); // AXIOS DELETE
    load();
  }

  return (
    <section>
      <h2 className="font-semibold mb-3">Saved Materials</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing saved yet — bookmark materials from the Materials page.</p>
      ) : (
        <div className="space-y-2">
          {items.map((m) => (
            <div key={m.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{m.title}</div>
                <div className="text-xs text-slate-400">{m.category || 'General'}</div>
              </div>
              <button onClick={() => remove(m.id)} className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600">Remove</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
