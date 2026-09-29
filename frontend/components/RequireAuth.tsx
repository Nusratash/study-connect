'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, homePath } from '../lib/auth';
import type { Role } from '../lib/types';
import { Skeleton } from './ui/Skeleton';

export default function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'anon') router.replace('/');
    else if (status === 'authed' && roles && user && !roles.includes(user.role)) router.replace(homePath(user.role));
  }, [status, user, roles, router]);

  if (status !== 'authed' || (roles && user && !roles.includes(user.role))) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
