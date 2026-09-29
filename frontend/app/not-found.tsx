import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-ink-3">
        <Compass className="h-6 w-6" />
      </span>
      <p className="font-serif text-6xl font-semibold text-brand">404</p>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink-2">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
