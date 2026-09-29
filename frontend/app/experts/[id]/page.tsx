import { notFound } from 'next/navigation';
import { BadgeCheck, Briefcase, Calendar } from 'lucide-react';
import { safeGet } from '../../../lib/server-api';
import MentorshipRequestForm from '../../../components/experts/MentorshipRequestForm';
import Avatar from '../../../components/ui/Avatar';
import type { User } from '../../../lib/types';

export const dynamic = 'force-dynamic';

export default async function ExpertProfilePage({ params }: { params: { id: string } }) {
  const { data: expert, failed } = await safeGet<User>(`/users/${params.id}`); // Axios: GET /users/:id (SSR)
  if (failed || !expert) notFound();
  const p = expert.expertProfile;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card p-7">
        <div className="flex items-center gap-4">
          <Avatar name={expert.name} size="xl" />
          <div>
            <h1 className="flex items-center gap-1.5 font-serif text-xl font-semibold text-ink">
              {expert.name}
              {p?.isApproved && <BadgeCheck className="h-5 w-5 text-brand" aria-label="Verified expert" />}
            </h1>
            <p className="text-[13.5px] text-ink-2">{p?.credentials || 'Credentials not specified'}</p>
          </div>
        </div>
        <p className="mt-5 text-[14.5px] leading-relaxed text-ink-2">{expert.bio || 'This mentor has not written a bio yet.'}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(p?.expertise || []).map((s) => (
            <span key={s} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-medium text-brand">{s}</span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-5 border-t border-line pt-4 text-[13px] text-ink-2">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-ink-3" /> {p?.availability || 'Availability not specified'}</span>
          <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-ink-3" /> Verified mentor</span>
        </div>
      </div>
      <div className="card p-7">
        <h2 className="mb-3 font-serif text-[16px] font-semibold text-ink">Request mentorship</h2>
        <MentorshipRequestForm expertId={expert.id} expertName={expert.name} />
      </div>
    </div>
  );
}
