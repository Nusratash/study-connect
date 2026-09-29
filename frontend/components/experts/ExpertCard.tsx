import Link from 'next/link';
import { BadgeCheck, Star } from 'lucide-react';
import type { User } from '../../lib/types';
import Avatar from '../ui/Avatar';

export default function ExpertCard({ expert }: { expert: User }) {
  const p = expert.expertProfile;
  return (
    <Link href={`/experts/${expert.id}`} className="card card-hover flex flex-col p-5">
      <div className="flex items-center gap-3">
        <Avatar name={expert.name} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-serif text-[15.5px] font-semibold text-ink">
            {expert.name}
            {p?.isApproved && <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />}
          </p>
          {p && p.ratingAvg > 0 && (
            <p className="flex items-center gap-1 text-[12px] text-ink-2">
              <Star className="h-3 w-3 fill-warn text-warn" /> {p.ratingAvg.toFixed(1)}
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-[13px] text-ink-2">{expert.bio || 'No bio yet.'}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(p?.expertise || []).slice(0, 3).map((s) => (
          <span key={s} className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">{s}</span>
        ))}
      </div>
    </Link>
  );
}
