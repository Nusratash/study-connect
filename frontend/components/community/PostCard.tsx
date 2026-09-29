import Link from 'next/link';
import { ArrowBigUp, MessageSquare, CheckCircle2 } from 'lucide-react';
import { timeAgo } from '../../lib/format';
import type { Post } from '../../lib/types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/community/${post.id}`} className="card card-hover group flex gap-4 p-5">
      <div className="flex w-12 shrink-0 flex-col items-center gap-1 text-ink-3">
        <ArrowBigUp className="h-5 w-5" />
        <span className="tabular text-[13px] font-semibold text-ink-2">{post.upvotes}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {post.status === 'resolved' ? (
            <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>
          ) : (
            <Badge tone="warn">Open</Badge>
          )}
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[11.5px] text-ink-3">#{tag}</span>
          ))}
        </div>
        <h3 className="font-serif text-[17px] font-semibold leading-snug text-ink group-hover:text-brand">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-[13.5px] text-ink-2">{post.content}</p>
        <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-3">
          <span className="flex items-center gap-1.5">
            <Avatar name={post.author?.name} size="sm" /> {post.author?.name || 'Unknown'}
          </span>
          <span>·</span>
          <span>{timeAgo(post.createdAt)}</span>
          <span className="ml-auto flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {post.commentCount ?? post.comments?.length ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}
