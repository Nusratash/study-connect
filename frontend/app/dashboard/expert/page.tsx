'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, GraduationCap, Inbox, MessagesSquare, XCircle } from 'lucide-react';
import { api, apiError } from '../../../lib/api';
import { useToast } from '../../../lib/toast';
import type { ConversationSummary, MentorshipRequest } from '../../../lib/types';
import RequestRow from '../../../components/dashboard/RequestRow';
import StatCard from '../../../components/ui/StatCard';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';
import Avatar from '../../../components/ui/Avatar';
import { chatTime } from '../../../lib/format';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function ExpertDashboard() {
  const { push } = useToast();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        api.get<MentorshipRequest[]>('/mentorship/my-requests'), // Axios: GET /mentorship/my-requests
        api.get<ConversationSummary[]>('/chat/conversations'), // Axios: GET /chat/conversations
      ]);
      setRequests(r.data);
      setConversations(c.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function respond(id: string, status: 'accepted' | 'rejected') {
    setBusyId(id);
    try {
      await api.patch(`/mentorship/${id}/respond`, { status }); // Axios: PATCH /mentorship/:id/respond
      push('success', status === 'accepted' ? 'Request accepted — a conversation was started.' : 'Request declined.');
      await load();
    } catch (err) {
      push('error', apiError(err));
    } finally {
      setBusyId(null);
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const mentees = requests.filter((r) => r.status === 'accepted');

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Dashboard" title="Expert dashboard" description="Review requests, monitor mentees, and stay on top of your inbox." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Inbox} label="Pending requests" value={pending.length} tone="accent" />
        <StatCard icon={GraduationCap} label="Active mentees" value={mentees.length} tone="brand" />
        <StatCard icon={MessagesSquare} label="Conversations" value={conversations.length} tone="success" />
      </div>

      <section>
        <h2 className="mb-3 font-serif text-[16px] font-semibold text-ink">Mentorship requests</h2>
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
        ) : pending.length === 0 ? (
          <EmptyState icon={Inbox} title="No pending requests" description="New requests from students will show up here." />
        ) : (
          <div className="space-y-2">
            {pending.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                person={r.student}
                action={
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => respond(r.id, 'accepted')} disabled={busyId === r.id} className="btn-primary btn-sm"><CheckCircle2 className="h-3.5 w-3.5" /> Accept</button>
                    <button onClick={() => respond(r.id, 'rejected')} disabled={busyId === r.id} className="btn-secondary btn-sm"><XCircle className="h-3.5 w-3.5" /> Decline</button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-[16px] font-semibold text-ink">My students</h2>
        {mentees.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No active mentees yet" description="Accepted requests will appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {mentees.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.student?.name} />
                  <p className="font-semibold text-ink">{r.student?.name}</p>
                </div>
                <p className="mt-2 line-clamp-2 text-[12.5px] text-ink-2">{r.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[16px] font-semibold text-ink">Conversations</h2>
          <Link href="/chat" className="text-[12.5px] font-medium text-brand hover:underline">Open inbox</Link>
        </div>
        {conversations.length === 0 ? (
          <EmptyState icon={MessagesSquare} title="No conversations yet" />
        ) : (
          <div className="space-y-2">
            {conversations.slice(0, 4).map((c) => (
              <Link key={c.id} href={`/chat/${c.id}`} className="card card-hover flex items-center gap-3 p-3.5">
                <Avatar name={c.otherUser?.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">{c.otherUser?.name}</p>
                  <p className="truncate text-[12px] text-ink-2">{c.lastMessage?.content || 'Say hello 👋'}</p>
                </div>
                {c.lastMessage && <span className="shrink-0 text-[11px] text-ink-3">{chatTime(c.lastMessage.createdAt)}</span>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
