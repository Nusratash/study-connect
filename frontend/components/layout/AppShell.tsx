'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap, Menu, X, Moon, Sun, LogOut, LayoutDashboard, BookOpen,
  MessagesSquare, Users, ShieldCheck, UserRound, Compass,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth, homePath } from '../../lib/auth';
import { useTheme } from '../../lib/theme';
import Avatar from '../ui/Avatar';
import NotificationBell from './NotificationBell';

const PUBLIC_PATHS = new Set(['/', '/register', '/forgot-password', '/verify-email', '/reset-password']);

function navFor(role?: string) {
  const base = [
    { href: homePath(role as never), label: 'Dashboard', icon: LayoutDashboard },
    { href: '/materials', label: 'Materials', icon: BookOpen },
    { href: '/community', label: 'Community', icon: MessagesSquare },
  ];
  if (role === 'student') base.push({ href: '/experts', label: 'Find an expert', icon: Compass });
  if (role === 'admin') base.push({ href: '/admin', label: 'Admin', icon: ShieldCheck });
  return base;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, status, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (PUBLIC_PATHS.has(pathname) || status !== 'authed' || !user) {
    return <>{children}</>;
  }

  const nav = navFor(user.role);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-2 hover:bg-subtle lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href={homePath(user.role)} className="flex items-center gap-2 font-serif text-[17px] font-semibold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-on-brand">
              <GraduationCap className="h-4 w-4" />
            </span>
            EduConnect
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={toggle} aria-label="Toggle dark mode" className="flex h-9 w-9 items-center justify-center rounded-md text-ink-2 hover:bg-subtle hover:text-ink">
              {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <NotificationBell />
            <Link href="/profile/edit" className="ml-1 hidden items-center gap-2 rounded-md py-1 pl-1 pr-2.5 hover:bg-subtle sm:flex">
              <Avatar name={user.name} size="sm" />
              <span className="max-w-[8rem] truncate text-[13px] font-medium text-ink">{user.name}</span>
            </Link>
            <button onClick={handleSignOut} className="btn-ghost btn-sm ml-1" title="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col justify-between border-r border-line px-3 py-5 lg:flex">
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors',
                    active ? 'bg-brand-soft text-brand' : 'text-ink-2 hover:bg-subtle hover:text-ink',
                  )}
                >
                  <item.icon className="h-[17px] w-[17px]" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-lg border border-line bg-subtle/60 px-3.5 py-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <UserRound className="h-3.5 w-3.5 text-ink-3" /> Signed in as
            </div>
            <p className="mt-0.5 truncate text-[13px] text-ink-2">{user.name}</p>
            <p className="text-[11px] capitalize text-ink-3">{user.role}</p>
          </div>
        </aside>

        {/* Sidebar (mobile) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
            <nav className="absolute inset-y-0 left-0 w-64 animate-rise-in space-y-0.5 border-r border-line bg-surface p-4 pt-6">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium',
                      active ? 'bg-brand-soft text-brand' : 'text-ink-2 hover:bg-subtle',
                    )}
                  >
                    <item.icon className="h-[17px] w-[17px]" /> {item.label}
                  </Link>
                );
              })}
              <Link href="/profile/edit" className="mt-3 flex items-center gap-2.5 rounded-md border-t border-line px-3 pt-4 text-sm font-medium text-ink-2">
                <Avatar name={user.name} size="sm" /> Profile
              </Link>
            </nav>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
