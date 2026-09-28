'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function DashboardSidebar({
  role,
}: {
  role: 'student' | 'expert';
}) {
  const pathname = usePathname();
  const items =
    role === 'student'
      ? [
          { href: '/dashboard/student', label: 'Overview' },
          { href: '/materials', label: 'Materials' },
          { href: '/dashboard/student#requests', label: 'My Requests' },
          { href: '/community', label: 'Community' },
        ]
      : [
          { href: '/dashboard/expert', label: 'Overview' },
          { href: '/dashboard/expert#students', label: 'My Students' },
          { href: '/dashboard/expert#requests', label: 'Requests' },
          { href: '/materials', label: 'Materials' },
        ];

  return (
    <aside className="w-full md:w-56 shrink-0">
      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap',
              pathname === item.href.split('#')[0]
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
