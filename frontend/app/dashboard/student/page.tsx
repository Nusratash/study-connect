'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../../lib/api';
import DashboardSidebar from '../../../components/DashboardSidebar';
import SavedMaterials from '../../../components/SavedMaterials';

export default function StudentDashboard() {
  const [experts, setExperts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const me = getStoredUser();

  useEffect(() => {
    Promise.all([
      api.get('/users/experts'),
      api.get('/mentorship/my-requests'),
      api.get('/chat/conversations'),
    ])
      .then(([e, r, c]) => {
        setExperts(e.data);
        setRequests(r.data);
        setConversations(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <DashboardSidebar role="student" />
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-slate-500">Find mentors, track requests, and chat with experts</p>
        </div>

        <section>
          <h2 className="font-semibold mb-3">Featured Experts</h2>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-32" />)}</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {experts.slice(0, 6).map((ex) => (
                <Link
                  key={ex.id}
                  href={`/experts/${ex.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 hover:shadow-md"
                >
                  <div className="font-semibold">{ex.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {(ex.expertProfile?.expertise || []).slice(0, 3).join(', ')}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="requests">
          <h2 className="font-semibold mb-3">My Mentorship Requests</h2>
          <div className="space-y-2">
            {requests.length === 0 && <p className="text-sm text-slate-500">No requests yet.</p>}
            {requests.map((r) => (
              <div key={r.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{r.expert?.name}</div>
                  <div className="text-xs text-slate-400">{r.message}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                  r.status === 'accepted' ? 'bg-accent-500/10 text-accent-600' :
                  r.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <SavedMaterials />

        <section>
          <h2 className="font-semibold mb-3">Conversations</h2>
          <div className="space-y-2">
            {conversations.length === 0 && <p className="text-sm text-slate-500">No conversations yet. Get mentorship accepted to start chatting.</p>}
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="block bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 hover:shadow-md"
              >
                Chat with {c.userOneId === me?.id ? c.userTwo?.name : c.userOne?.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
