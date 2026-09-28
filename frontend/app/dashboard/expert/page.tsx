'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../../../lib/api';
import DashboardSidebar from '../../../components/DashboardSidebar';

export default function ExpertDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const me = getStoredUser();

  async function load() {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        api.get('/mentorship/my-requests'),
        api.get('/chat/conversations'),
      ]);
      setRequests(r.data);
      setConversations(c.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id: string, status: 'accepted' | 'rejected') {
    await api.patch(`/mentorship/${id}/respond`, { status });
    load();
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const mentees = requests.filter((r) => r.status === 'accepted');

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <DashboardSidebar role="expert" />
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Expert Dashboard</h1>
          <p className="text-sm text-slate-500">Review requests, monitor mentees, and share content</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="text-2xl font-bold text-brand-600">{pending.length}</div>
            <div className="text-sm text-slate-500">Pending requests</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="text-2xl font-bold text-accent-600">{mentees.length}</div>
            <div className="text-sm text-slate-500">Active mentees</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{conversations.length}</div>
            <div className="text-sm text-slate-500">Conversations</div>
          </div>
        </div>

        <section id="requests">
          <h2 className="font-semibold mb-3">Mentorship Requests</h2>
          {loading ? (
            <div className="skeleton h-24" />
          ) : pending.length === 0 ? (
            <p className="text-sm text-slate-500">No pending requests.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((r) => (
                <div key={r.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{r.student?.name}</div>
                    <div className="text-xs text-slate-400">{r.message}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => respond(r.id, 'accepted')} className="text-xs px-3 py-1.5 rounded-xl bg-accent-500 text-white">
                      Accept
                    </button>
                    <button onClick={() => respond(r.id, 'rejected')} className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="students">
          <h2 className="font-semibold mb-3">My Students</h2>
          {mentees.length === 0 ? (
            <p className="text-sm text-slate-500">No active mentees yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {mentees.map((r) => (
                <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="font-semibold">{r.student?.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{r.message}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-semibold mb-3">Conversations</h2>
          <div className="space-y-2">
            {conversations.length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
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
