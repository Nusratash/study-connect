'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Send } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { validateText } from '../../lib/validation';
import { inputClass } from '../ui/FormField';

export default function MentorshipRequestForm({ expertId, expertName }: { expertId: string; expertName: string }) {
  const { user, status } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (status === 'loading') return <div className="skeleton h-24" />;
  if (!user) {
    return (
      <p className="text-[13.5px] text-ink-2">
        Please <Link href="/" className="font-semibold text-brand hover:underline">sign in</Link> as a student to request mentorship.
      </p>
    );
  }
  if (user.role !== 'student') {
    return <p className="text-[13.5px] text-ink-2">Only students can request mentorship.</p>;
  }
  if (sent) {
    return (
      <p className="flex items-center gap-2 text-[13.5px] font-medium text-success">
        <CheckCircle2 className="h-4 w-4" /> Request sent — you&apos;ll be notified when {expertName} responds.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validateText(message, 15, 'Describe your goal in at least 15 characters.');
    if (msg) return setError(msg);
    setSending(true);
    setError('');
    try {
      await api.post('/mentorship/request', { expertId, message }); // Axios: POST /mentorship/request
      setSent(true);
    } catch (err) {
      setError(apiError(err, 'Could not send your request.'));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <textarea
        rows={3}
        placeholder={`Tell ${expertName} what you'd like help with…`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={inputClass(!!error)}
      />
      {error && <p className="text-[12.5px] text-danger">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary">
        <Send className="h-3.5 w-3.5" /> {sending ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}
