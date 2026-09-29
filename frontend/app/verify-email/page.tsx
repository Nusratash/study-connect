'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api, apiError } from '../../lib/api';

function VerifyEmailBody() {
  const token = useSearchParams().get('token') || '';
  const [state, setState] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('fail');
      setMessage('This verification link is missing a token.');
      return;
    }
    api
      .post('/auth/verify-email', { token }) // Axios: POST /auth/verify-email
      .then(() => setState('ok'))
      .catch((err) => {
        setState('fail');
        setMessage(apiError(err, 'This link is invalid or has expired.'));
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-subtle/40 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 text-center shadow-pop">
        <div className="mb-6 flex items-center justify-center gap-2 font-serif text-lg font-semibold text-brand">
          <GraduationCap className="h-6 w-6" /> EduConnect
        </div>
        {state === 'checking' && (
          <>
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-ink-3" />
            <p className="text-sm text-ink-2">Verifying your email…</p>
          </>
        )}
        {state === 'ok' && (
          <>
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h1 className="font-serif text-lg font-semibold text-ink">Email verified</h1>
            <p className="mt-2 text-[13.5px] text-ink-2">Your account is fully active.</p>
          </>
        )}
        {state === 'fail' && (
          <>
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger">
              <XCircle className="h-5 w-5" />
            </span>
            <h1 className="font-serif text-lg font-semibold text-ink">Verification failed</h1>
            <p className="mt-2 text-[13.5px] text-ink-2">{message}</p>
          </>
        )}
        <Link href="/" className="btn-primary mt-6 inline-flex">Continue to sign in</Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailBody />
    </Suspense>
  );
}
