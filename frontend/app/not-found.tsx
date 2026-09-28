import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="text-2xl font-bold mt-3">Page not found</h1>
      <p className="text-slate-500 mt-2">The page you are looking for doesn&apos;t exist or was removed.</p>
      <Link href="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">Back to home</Link>
    </div>
  );
}
