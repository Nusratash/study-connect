'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { chatTime } from '../../lib/format';
import type { ConversationSummary } from '../../lib/types';
import Avatar from '../ui/Avatar';

export default function ConversationList({ conversations }: { conversations: ConversationSummary[] }) {
  const pathname = usePathname();
  return (
    <div className="divide-y divide-line">
      {conversations.map((c) => {
        const active = pathname === `/chat/${c.id}`;
        return (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className={clsx('flex items-center gap-3 px-4 py-3 transition-colors hover:bg-subtle', active && 'bg-brand-soft/50')}
          >
            <Avatar name={c.otherUser?.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[13.5px] font-medium text-ink">{c.otherUser?.name}</p>
                {c.lastMessage && <span className="shrink-0 text-[11px] text-ink-3">{chatTime(c.lastMessage.createdAt)}</span>}
              </div>
              <p className={clsx('truncate text-[12.5px]', c.unreadCount > 0 ? 'font-medium text-ink' : 'text-ink-2')}>
                {c.lastMessage?.content || 'Say hello 👋'}
              </p>
            </div>
            {c.unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand">
                {c.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
