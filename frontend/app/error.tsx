'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center py-24">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-slate-500 mt-2">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium">Try again</button>
    </div>
  );
}
