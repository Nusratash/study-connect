'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Compass, Inbox, MessagesSquare } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import type { ConversationSummary, MentorshipRequest, User } from '../../../lib/types';
import ExpertCard from '../../../components/experts/ExpertCard';
import RequestRow from '../../../components/dashboard/RequestRow';
import SavedMaterials from '../../../components/dashboard/SavedMaterials';
import StatCard from '../../../components/ui/StatCard';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';
import Avatar from '../../../components/ui/Avatar';
import { chatTime } from '../../../lib/format';
import { SkeletonCard } from '../../../components/ui/Skeleton';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [experts, setExperts] = useState<User[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<User[]>('/users/experts'), // Axios: GET /users/experts
      api.get<MentorshipRequest[]>('/mentorship/my-requests'), // Axios: GET /mentorship/my-requests
      api.get<ConversationSummary[]>('/chat/conversations'), // Axios: GET /chat/conversations
    ])
      .then(([e, r, c]) => { setExperts(e.data); setRequests(r.data); setConversations(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const active = requests.filter((r) => r.status === 'accepted').length;
  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Dashboard" title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`} description="Find mentors, track requests, and keep learning." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Compass} label="Active mentors" value={active} tone="brand" />
        <StatCard icon={Inbox} label="Pending requests" value={pending} tone="accent" />
        <StatCard icon={MessagesSquare} label="Conversations" value={conversations.length} tone="success" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[16px] font-semibold text-ink">Featured experts</h2>
          <Link href="/experts" className="text-[12.5px] font-medium text-brand hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : experts.length === 0 ? (
          <EmptyState icon={Compass} title="No experts available yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {experts.slice(0, 6).map((ex) => <ExpertCard key={ex.id} expert={ex} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-[16px] font-semibold text-ink">My mentorship requests</h2>
        {requests.length === 0 ? (
          <EmptyState icon={Inbox} title="No requests yet" description="Visit a mentor's profile to send your first request." action={<Link href="/experts" className="btn-secondary btn-sm">Find an expert</Link>} />
        ) : (
          <div className="space-y-2">
            {requests.map((r) => <RequestRow key={r.id} request={r} person={r.expert} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-[16px] font-semibold text-ink">Saved materials</h2>
        <SavedMaterials />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[16px] font-semibold text-ink">Conversations</h2>
          <Link href="/chat" className="text-[12.5px] font-medium text-brand hover:underline">Open inbox</Link>
        </div>
        {conversations.length === 0 ? (
          <EmptyState icon={MessagesSquare} title="No conversations yet" description="Chats start automatically once mentorship is accepted." />
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
