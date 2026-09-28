import { notFound } from 'next/navigation';
import { BadgeCheck } from 'lucide-react';
import { serverApi } from '../../../lib/server-api';
import MentorshipRequestForm from '../../../components/MentorshipRequestForm';

export const dynamic = 'force-dynamic';

export default async function ExpertProfilePage({ params }: { params: { id: string } }) {
  let expert: any;
  try {
    const { data } = await serverApi.get(`/users/${params.id}`); // AXIOS GET (SSR)
    expert = data;
  } catch {
    notFound();
  }
  const p = expert.expertProfile;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">{expert.name?.[0]}</div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {expert.name}
              {p?.isApproved && <BadgeCheck className="w-5 h-5 text-accent-600" aria-label="Verified expert" />}
            </h1>
            <p className="text-sm text-slate-500">{p?.credentials}</p>
          </div>
        </div>
        <p className="mt-5 text-slate-600 dark:text-slate-300">{expert.bio}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {(p?.expertise || []).map((s: string) => (
            <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600">{s}</span>
          ))}
        </div>
        <p className="text-sm text-slate-400 mt-4">Availability: {p?.availability || 'Not specified'}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800">
        <h2 className="font-semibold mb-3">Request mentorship</h2>
        <MentorshipRequestForm expertId={expert.id} expertName={expert.name} />
      </div>
    </div>
  );
}
