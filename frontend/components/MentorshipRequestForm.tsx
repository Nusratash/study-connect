'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getStoredUser } from '../lib/api';
import { validateMessage } from '../lib/validation';
import { inputClass } from './FormField';

export default function MentorshipRequestForm({ expertId, expertName }: { expertId: string; expertName: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setUser(getStoredUser()); setReady(true); }, []);

  if (!ready) return <div className="skeleton h-24" />;
  if (!user) {
    return <p className="text-sm text-slate-500">Please <Link href="/" className="text-brand-600 font-medium">sign in</Link> as a student to request mentorship.</p>;
  }
  if (user.role !== 'student') {
    return <p className="text-sm text-slate-500">Only students can request mentorship.</p>;
  }
  if (sent) return <p className="text-sm text-accent-600 font-medium">Request sent! You&apos;ll be notified when {expertName} responds.</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateMessage(message, 10);
    if (v.message) return setError('Please describe your goal in at least 10 characters');
    setSending(true);
    try {
      await api.post('/mentorship/request', { expertId, message }); // AXIOS POST
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send request');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <textarea rows={3} placeholder="Tell them what you'd like help with…" value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={sending} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60">
        {sending ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}
