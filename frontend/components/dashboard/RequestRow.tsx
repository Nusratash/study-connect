import { timeAgo } from '../../lib/format';
import type { MentorshipRequest } from '../../lib/types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const TONE = { pending: 'warn', accepted: 'success', rejected: 'danger', completed: 'neutral' } as const;

export default function RequestRow({
  request,
  person,
  action,
}: {
  request: MentorshipRequest;
  person: { name?: string } | undefined;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
      <Avatar name={person?.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-ink">{person?.name || 'Unknown'}</p>
        <p className="line-clamp-1 text-[12px] text-ink-2">{request.message}</p>
      </div>
      <span className="hidden shrink-0 text-[11px] text-ink-3 sm:inline">{timeAgo(request.createdAt)}</span>
      {action ?? <Badge tone={TONE[request.status]}>{request.status}</Badge>}
    </div>
  );
}
