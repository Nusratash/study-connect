'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import type { Material } from '../../lib/types';
import MaterialCard from './MaterialCard';
import UploadMaterialDialog from './UploadMaterialDialog';
import PageHeader from '../ui/PageHeader';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import clsx from 'clsx';

export default function MaterialsBoard({ initialMaterials, initialFailed }: { initialMaterials: Material[]; initialFailed: boolean }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [materials, setMaterials] = useState(initialMaterials);
  const [failed, setFailed] = useState(initialFailed);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (user) {
      api.get<Material[]>('/bookmarks').then(({ data }) => setBookmarks(new Set(data.map((m) => m.id)))).catch(() => {}); // Axios: GET /bookmarks
    }
  }, [user]);

  async function load(q: string) {
    setLoading(true);
    try {
      const { data } = await api.get<Material[]>('/materials', { params: { search: q || undefined } }); // Axios: GET /materials (CSR search)
      setMaterials(data);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; } // first paint is server-rendered
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    materials.forEach((m) => map.set(m.category || 'General', (map.get(m.category || 'General') || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [materials]);

  const visible = category ? materials.filter((m) => (m.category || 'General') === category) : materials;

  async function toggleBookmark(id: string) {
    const has = bookmarks.has(id);
    setBookmarks((prev) => {
      const next = new Set(prev);
      has ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      if (has) await api.delete(`/bookmarks/${id}`); // Axios: DELETE /bookmarks/:id
      else await api.post(`/bookmarks/${id}`); // Axios: POST /bookmarks/:id (many-to-many)
    } catch (err) {
      setBookmarks((prev) => {
        const next = new Set(prev);
        has ? next.add(id) : next.delete(id);
        return next;
      });
      push('error', apiError(err, 'Please sign in to save materials.'));
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Course materials"
        description="Browse, search and share study resources uploaded by the community."
        actions={
          user && (
            <button onClick={() => setShowUpload(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Upload
            </button>
          )
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials…"
            className="input pl-9"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategory(null)}
              className={clsx('rounded-full px-3 py-1 text-[12.5px] font-medium', !category ? 'bg-brand text-on-brand' : 'bg-subtle text-ink-2 hover:bg-line/60')}
            >
              All ({materials.length})
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={clsx('rounded-full px-3 py-1 text-[12.5px] font-medium', category === cat ? 'bg-brand text-on-brand' : 'bg-subtle text-ink-2 hover:bg-line/60')}
              >
                {cat} ({count})
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : failed ? (
        <EmptyState icon={BookOpen} title="Couldn't load materials" description="The API might be starting up — try refreshing in a moment." />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search ? 'No materials match your search' : 'No materials yet'}
          description={user ? 'Be the first to share a resource with the community.' : 'Sign in to upload the first resource.'}
          action={user && <button onClick={() => setShowUpload(true)} className="btn-primary btn-sm"><Plus className="h-3.5 w-3.5" /> Upload a material</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => (
            <MaterialCard key={m.id} material={m} bookmarked={bookmarks.has(m.id)} onToggleBookmark={user ? toggleBookmark : undefined} />
          ))}
        </div>
      )}

      {showUpload && (
        <UploadMaterialDialog
          onClose={() => setShowUpload(false)}
          onCreated={(m) => { setMaterials((prev) => [m, ...prev]); setShowUpload(false); }}
        />
      )}
    </div>
  );
}
