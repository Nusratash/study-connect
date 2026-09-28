'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { isEmail } from '../../lib/validation';
import FormField, { inputClass } from '../../components/FormField';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email }); // AXIOS POST
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
        <p className="text-sm text-slate-500 mb-6">We&apos;ll email you a link to choose a new password.</p>
        {sent ? (
          <p className="text-sm text-accent-600">If that email is registered, a reset link is on its way. Check your inbox and spam folder.</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label="Email address" error={error}>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </FormField>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <Link href="/" className="block text-sm text-brand-600 mt-6 hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
}
