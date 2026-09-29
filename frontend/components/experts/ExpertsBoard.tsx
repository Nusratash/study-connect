'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { api } from '../../lib/api';
import type { User } from '../../lib/types';
import ExpertCard from './ExpertCard';
import PageHeader from '../ui/PageHeader';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';

export default function ExpertsBoard({ initialExperts, initialFailed }: { initialExperts: User[]; initialFailed: boolean }) {
  const [experts, setExperts] = useState(initialExperts);
  const [failed, setFailed] = useState(initialFailed);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    setLoading(true);
    const t = setTimeout(() => {
      api.get<User[]>('/users/experts', { params: { search: search || undefined } }) // Axios: GET /users/experts (CSR search)
        .then(({ data }) => { setExperts(data); setFailed(false); })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <PageHeader eyebrow="Mentors" title="Find an expert" description="Browse verified mentors by expertise and request 1:1 guidance." />
      <div className="relative mb-6 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or skill…" className="input pl-9" />
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : failed ? (
        <EmptyState icon={Users} title="Couldn't load experts" description="The API might be starting up — try refreshing in a moment." />
      ) : experts.length === 0 ? (
        <EmptyState icon={Users} title="No experts found" description="Try a different search term." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experts.map((e) => <ExpertCard key={e.id} expert={e} />)}
        </div>
      )}
    </div>
  );
}
