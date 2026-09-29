'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowBigUp, CheckCircle2, MessageSquare } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { timeAgo } from '../../lib/format';
import { validateText } from '../../lib/validation';
import type { Post } from '../../lib/types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { inputClass } from '../ui/FormField';

export default function PostDetailClient({ initialPost }: { initialPost: Post }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upvoted, setUpvoted] = useState(false);

  async function reload() {
    const { data } = await api.get<Post>(`/posts/${post.id}`); // Axios: GET /posts/:id
    setPost(data);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const msg = validateText(comment, 2, 'Write a little more before replying.');
    if (msg) return setError(msg);
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/posts/${post.id}/comments`, { content: comment }); // Axios: POST /posts/:id/comments
      setComment('');
      await reload();
    } catch (err) {
      setError(apiError(err, 'Please sign in to reply.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function upvote() {
    if (upvoted) return;
    setUpvoted(true);
    setPost((p) => ({ ...p, upvotes: p.upvotes + 1 }));
    try {
      await api.post(`/posts/${post.id}/upvote`); // Axios: POST /posts/:id/upvote
    } catch (err) {
      setUpvoted(false);
      setPost((p) => ({ ...p, upvotes: p.upvotes - 1 }));
      push('error', apiError(err, 'Please sign in to upvote.'));
    }
  }

  async function resolve(commentId: string) {
    await api.patch(`/posts/${post.id}/resolve/${commentId}`); // Axios: PATCH /posts/:id/resolve/:commentId
    push('success', 'Marked as the accepted answer.');
    reload();
  }

  const isAuthor = user?.id === post.authorId;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/community" className="mb-5 inline-block text-[13px] font-medium text-ink-2 hover:text-ink">← Back to Community</Link>

      <article className="card p-7">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {post.status === 'resolved' ? (
            <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>
          ) : (
            <Badge tone="warn">Open</Badge>
          )}
          {post.tags.map((t) => <span key={t} className="text-[11.5px] text-ink-3">#{t}</span>)}
        </div>
        <h1 className="font-serif text-[26px] font-semibold leading-tight text-ink">{post.title}</h1>
        <div className="mt-2.5 flex items-center gap-2 text-[13px] text-ink-2">
          <Avatar name={post.author?.name} size="sm" /> {post.author?.name} <span className="text-ink-3">· {timeAgo(post.createdAt)}</span>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{post.content}</p>
        <button
          onClick={upvote}
          className={`btn-secondary btn-sm mt-6 ${upvoted ? 'border-brand text-brand' : ''}`}
        >
          <ArrowBigUp className="h-4 w-4" /> Upvote · {post.upvotes}
        </button>
      </article>

      <div className="mt-8 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-ink-3" />
        <h2 className="text-[15px] font-semibold text-ink">{post.comments?.length || 0} {post.comments?.length === 1 ? 'Reply' : 'Replies'}</h2>
      </div>

      <div className="mt-4 space-y-3">
        {post.comments?.map((c) => {
          const accepted = post.acceptedCommentId === c.id;
          return (
            <div key={c.id} className={`card p-4 ${accepted ? 'border-success/40 bg-success-soft/40' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  <Avatar name={c.author?.name} size="sm" /> {c.author?.name}
                </div>
                {accepted && <Badge tone="success"><CheckCircle2 className="h-3 w-3" /> Accepted</Badge>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-2">{c.content}</p>
              {isAuthor && post.status !== 'resolved' && (
                <button onClick={() => resolve(c.id)} className="mt-2 text-[12.5px] font-medium text-brand hover:underline">
                  Mark as accepted answer
                </button>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleComment} noValidate className="mt-6">
        <div className="flex gap-2">
          <input placeholder={user ? 'Write a reply…' : 'Sign in to reply…'} value={comment} onChange={(e) => setComment(e.target.value)} className={inputClass()} />
          <button type="submit" disabled={submitting} className="btn-primary shrink-0">Reply</button>
        </div>
        {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
      </form>
    </div>
  );
}
