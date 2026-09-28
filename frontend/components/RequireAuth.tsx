'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '../lib/api';

// Client-side route guard: redirects to the login page when not authenticated,
// and (optionally) when the user's role is not allowed.
export default function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const token = localStorage.getItem('accessToken');
    if (!user || !token) {
      router.replace('/');
    } else if (roles && !roles.includes(user.role)) {
      router.replace(user.role === 'expert' ? '/dashboard/expert' : user.role === 'admin' ? '/admin' : '/dashboard/student');
    } else {
      setOk(true);
    }
  }, []);

  if (!ok) return <div className="skeleton h-64" />;
  return <>{children}</>;
}
