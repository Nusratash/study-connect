'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../lib/toast';
import type { Material } from '../../lib/types';
import MaterialRow from '../materials/MaterialRow';
import EmptyState from '../ui/EmptyState';
import { Bookmark } from 'lucide-react';
import { SkeletonRow } from '../ui/Skeleton';

export default function SavedMaterials() {
  const { push } = useToast();
  const [items, setItems] = useState<Material[] | null>(null);

  async function load() {
    try {
      const { data } = await api.get<Material[]>('/bookmarks'); // Axios: GET /bookmarks
      setItems(data);
    } catch {
      setItems([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    setItems((prev) => prev?.filter((m) => m.id !== id) ?? null);
    try {
      await api.delete(`/bookmarks/${id}`); // Axios: DELETE /bookmarks/:id
    } catch {
      push('error', 'Could not remove the bookmark.');
      load();
    }
  }

  if (items === null) return <div className="space-y-2">{[1, 2].map((i) => <SkeletonRow key={i} />)}</div>;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing saved yet"
        description="Bookmark materials from the Materials page to find them here later."
        action={<Link href="/materials" className="btn-secondary btn-sm">Browse materials</Link>}
      />
    );
  }
  return (
    <div className="space-y-2">
      {items.map((m) => (
        <MaterialRow
          key={m.id}
          material={m}
          action={
            <button onClick={() => remove(m.id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-danger-soft hover:text-danger" aria-label="Remove bookmark">
              <X className="h-3.5 w-3.5" />
            </button>
          }
        />
      ))}
    </div>
  );
}
