'use client';

import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { api } from '../../lib/api';
import type { ConversationSummary } from '../../lib/types';
import ConversationList from './ConversationList';
import EmptyState from '../ui/EmptyState';
import { SkeletonRow } from '../ui/Skeleton';

export default function ChatFrame({ activeId, children }: { activeId?: string; children?: React.ReactNode }) {
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);

  async function load() {
    const { data } = await api.get<ConversationSummary[]>('/chat/conversations'); // Axios: GET /chat/conversations (polling)
    setConversations(data);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card grid h-[calc(100vh-8.5rem)] grid-cols-1 overflow-hidden md:grid-cols-[19rem_1fr]">
      <div className={`flex-col overflow-y-auto border-line md:flex md:border-r ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-serif text-[15px] font-semibold text-ink">Messages</h2>
        </div>
        {conversations === null ? (
          <div className="space-y-2 p-3">{[1, 2, 3].map((i) => <SkeletonRow key={i} />)}</div>
        ) : conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={MessagesSquare} title="No conversations yet" description="Conversations start automatically once a mentorship request is accepted." />
          </div>
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </div>
      <div className={`flex-col ${activeId ? 'flex' : 'hidden md:flex'}`}>
        {children ?? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <MessagesSquare className="mx-auto mb-3 h-8 w-8 text-ink-3" />
              <p className="text-sm text-ink-2">Select a conversation to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
