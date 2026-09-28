'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

function Verify() {
  const token = useSearchParams().get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) return setStatus('error');
    api.post('/auth/verify-email', { token }) // AXIOS POST
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') return <p>Verifying your email…</p>;
  if (status === 'success')
    return (
      <>
        <div className="text-4xl mb-3">✅</div>
        <h1 className="text-xl font-bold">Email verified!</h1>
        <p className="text-sm text-slate-500 mt-2">You can now sign in to your account.</p>
        <Link href="/" className="inline-block mt-4 px-5 py-2 rounded-xl bg-brand-600 text-white">Go to sign in</Link>
      </>
    );
  return (
    <>
      <div className="text-4xl mb-3">⚠️</div>
      <h1 className="text-xl font-bold">Verification failed</h1>
      <p className="text-sm text-slate-500 mt-2">This link is invalid or has expired.</p>
      <Link href="/" className="inline-block mt-4 text-brand-600 hover:underline">Back to sign in</Link>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <Suspense fallback={<p>Loading…</p>}>
          <Verify />
        </Suspense>
      </div>
    </div>
  );
}
