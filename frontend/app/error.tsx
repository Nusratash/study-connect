'use client';

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertOctagon className="h-6 w-6" />
      </span>
      <h1 className="font-serif text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-2">An unexpected error occurred while loading this page. You can try again.</p>
      <button onClick={reset} className="btn-primary mt-6">Try again</button>
    </div>
  );
}
