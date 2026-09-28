'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { api, getStoredUser } from '../../../lib/api';
import ChatBubble from '../../../components/ChatBubble';

// Simple REST chat: history via GET, sending via POST, refreshed by polling.
export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const me = getStoredUser();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const { data } = await api.get(`/chat/conversations/${conversationId}/messages`); // AXIOS GET
      setMessages(data);
    } catch {
      setError('Unable to load this conversation.');
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await api.post(`/chat/conversations/${conversationId}/messages`, { content: input }); // AXIOS POST
      setInput('');
      load();
    } catch {
      setError('Message could not be sent.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[70vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 font-semibold">Conversation</div>
      <div className="flex-1 overflow-y-auto p-5">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {messages.length === 0 && !error && <p className="text-sm text-slate-400 text-center mt-10">No messages yet. Say hello 👋</p>}
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
      <form onSubmit={send} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <button type="submit" aria-label="Send" className="px-4 rounded-xl bg-brand-600 text-white hover:bg-brand-700"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}
