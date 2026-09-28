'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, Moon, Sun } from 'lucide-react';
import { getStoredUser, clearAuth, api } from '../lib/api';
import NotificationBell from './NotificationBell';

const PUBLIC_PATHS = ['/', '/register', '/forgot-password', '/verify-email', '/reset-password', '/login'];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dark, setDark] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  if (PUBLIC_PATHS.includes(pathname)) return null;

  async function handleLogout() {
    try {
      await api.post('/auth/logout'); // AXIOS POST
    } catch {}
    clearAuth();
    router.push('/');
  }

  const home = user?.role === 'expert' ? '/dashboard/expert' : user?.role === 'admin' ? '/admin' : '/dashboard/student';
  const link = 'text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 transition';

  return (
    <nav className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={home} className="flex items-center gap-2 font-bold text-lg text-brand-600">
          <GraduationCap className="w-6 h-6" /> EduConnect
        </Link>
        <div className="hidden md:flex items-center gap-7">
          <Link href={home} className={link}>Dashboard</Link>
          <Link href="/materials" className={link}>Materials</Link>
          <Link href="/community" className={link}>Community</Link>
          {user?.role === 'admin' && <Link href="/admin" className={link}>Admin</Link>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode" className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {user && <NotificationBell />}
          {user && (
            <Link href="/profile/edit" className="hidden sm:flex items-center gap-2 pl-2">
              <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">{user.name?.[0]}</span>
              <span className="text-sm font-medium">{user.name}</span>
            </Link>
          )}
          <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
