'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { passwordRules } from '../../lib/validation';
import FormField, { inputClass } from '../../components/ui/FormField';

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return setError('This reset link is invalid or missing a token.');
    if (passwordRules.some((r) => !r.test(password))) return setError('Password does not meet the requirements.');
    if (password !== confirm) return setError('Passwords do not match.');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password }); // Axios: POST /auth/reset-password
      setDone(true);
      setTimeout(() => router.push('/'), 2200);
    } catch (err) {
      setError(apiError(err, 'This reset link is invalid or has expired.'));
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
        {done ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-soft text-success">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h1 className="font-serif text-lg font-semibold text-ink">Password updated</h1>
            <p className="mt-2 text-[13.5px] text-ink-2">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-lg font-semibold text-ink">Set a new password</h1>
            <p className="mt-1.5 text-[13.5px] text-ink-2">Choose a strong password for your account.</p>
            {error && <div role="alert" className="mt-4 rounded-md border border-danger/25 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">{error}</div>}
            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              <FormField label="New password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass()} autoFocus />
              </FormField>
              <FormField label="Confirm password">
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass()} />
              </FormField>
              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}
        <Link href="/" className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
