'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { api } from '../../lib/api';
import FormField, { inputClass } from '../../components/FormField';

function ResetForm() {
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return setError('This reset link is invalid.');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
      return setError('Password must be at least 8 characters with letters and numbers');
    if (password !== confirm) return setError('Passwords do not match');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password }); // AXIOS POST
      setDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-3">✅</div>
        <h1 className="text-xl font-bold">Password updated</h1>
        <p className="text-sm text-slate-500 mt-2">You can now sign in with your new password.</p>
        <Link href="/" className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium">Go to sign in</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Enter a new password for your account.</p>
      {error && <div role="alert" className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="New password">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Confirm password">
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </FormField>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60">
          {loading ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="fixed inset-0 z-40 overflow-auto bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center gap-2 text-xl font-bold text-brand-600 mb-6">
          <GraduationCap className="w-7 h-7" /> EduConnect
        </div>
        <Suspense fallback={<div className="skeleton h-40" />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
