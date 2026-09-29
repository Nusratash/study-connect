'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import ChatBubble from '../../../components/chat/ChatBubble';
import ChatFrame from '../../../components/chat/ChatFrame';
import Avatar from '../../../components/ui/Avatar';
import PageHeader from '../../../components/ui/PageHeader';
import type { Message, User } from '../../../lib/types';

export default function ChatConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user: me } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const [{ data: history }, { data: meta }] = await Promise.all([
        api.get<Message[]>(`/chat/conversations/${conversationId}/messages`), // Axios: GET /chat/conversations/:id/messages
        api.get<{ otherUser: User }>(`/chat/conversations/${conversationId}`), // Axios: GET /chat/conversations/:id
      ]);
      setMessages(history);
      setOtherUser(meta.otherUser);
      setError('');
    } catch {
      setError('Unable to load this conversation.');
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const draft = input;
    setInput('');
    try {
      await api.post(`/chat/conversations/${conversationId}/messages`, { content: draft }); // Axios: POST /chat/conversations/:id/messages
      load();
    } catch {
      setError('Message could not be sent.');
      setInput(draft);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Inbox" title="Conversations" />
      <ChatFrame activeId={conversationId}>
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <Avatar name={otherUser?.name} size="sm" />
          <span className="font-medium text-ink">{otherUser?.name || (loaded ? 'Conversation' : '')}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <p className="mb-3 flex items-center gap-1.5 text-[13px] text-danger"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>
          )}
          {loaded && messages.length === 0 && !error && (
            <p className="mt-10 text-center text-sm text-ink-3">No messages yet. Say hello 👋</p>
          )}
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              content={m.content}
              isOwn={m.senderId === me?.id}
              senderName={m.sender?.name}
              time={new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="input flex-1" />
          <button type="submit" aria-label="Send" className="btn-primary shrink-0"><Send className="h-4 w-4" /></button>
        </form>
      </ChatFrame>
    </div>
  );
}
