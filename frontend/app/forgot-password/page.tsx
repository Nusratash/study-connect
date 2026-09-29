'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, MailCheck } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { isEmail } from '../../lib/validation';
import FormField, { inputClass } from '../../components/ui/FormField';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) return setError('Enter a valid email address.');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email }); // Axios: POST /auth/forgot-password
      setSent(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-subtle/40 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 shadow-pop">
        <div className="mb-6 flex items-center gap-2 font-serif text-lg font-semibold text-brand">
          <GraduationCap className="h-6 w-6" /> EduConnect
        </div>

        {sent ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-soft text-success">
              <MailCheck className="h-5 w-5" />
            </span>
            <h1 className="font-serif text-lg font-semibold text-ink">Check your inbox</h1>
            <p className="mt-2 text-[13.5px] text-ink-2">
              If an account exists for <span className="font-medium text-ink">{email}</span>, a reset link is on its way.
            </p>
            <Link href="/" className="btn-secondary mt-6 inline-flex">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-lg font-semibold text-ink">Forgot your password?</h1>
            <p className="mt-1.5 text-[13.5px] text-ink-2">Enter your email and we&apos;ll send you a reset link.</p>
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <FormField label="Email address" error={error}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(!!error)} autoFocus />
              </FormField>
              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <Link href="/" className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
