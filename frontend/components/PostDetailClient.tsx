'use client';

import { useEffect, useState } from 'react';
import { api, getStoredUser } from '../lib/api';
import { validateMessage } from '../lib/validation';
import { inputClass } from './FormField';

export default function PostDetailClient({ initialPost }: { initialPost: any }) {
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [me, setMe] = useState<any>(null);
  useEffect(() => setMe(getStoredUser()), []);

  async function reload() {
    const { data } = await api.get(`/posts/${post.id}`); // AXIOS GET
    setPost(data);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    const v = validateMessage(comment, 2);
    if (v.message) return setError(v.message);
    try {
      await api.post(`/posts/${post.id}/comments`, { content: comment }); // AXIOS POST
      setComment('');
      setError('');
      reload();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Please log in to reply');
    }
  }

  async function upvote() {
    try { await api.post(`/posts/${post.id}/upvote`); reload(); } // AXIOS POST
    catch { setError('Please log in to upvote'); }
  }

  async function resolve(commentId: string) {
    await api.patch(`/posts/${post.id}/resolve/${commentId}`); // AXIOS PATCH
    reload();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {(post.tags || []).map((t: string) => (
            <span key={t} className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600">#{t}</span>
          ))}
          <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${post.status === 'resolved' ? 'bg-accent-500/10 text-accent-600' : 'bg-amber-500/10 text-amber-600'}`}>
            {post.status === 'resolved' ? '✓ Resolved' : 'Open'}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm text-slate-400 mt-1">Asked by {post.author?.name}</p>
        <p className="mt-5 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        <button onClick={upvote} className="mt-5 text-sm px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">▲ Upvote · {post.upvotes}</button>
      </article>

      <h2 className="text-lg font-semibold mt-8 mb-3">{post.comments?.length || 0} Replies</h2>
      <div className="space-y-3">
        {post.comments?.map((c: any) => (
          <div key={c.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border ${post.acceptedCommentId === c.id ? 'border-accent-500' : 'border-slate-100 dark:border-slate-800'}`}>
            <div className="flex justify-between">
              <span className="text-sm font-medium">{c.author?.name}</span>
              {post.acceptedCommentId === c.id && <span className="text-xs font-semibold text-accent-600">✓ Accepted answer</span>}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{c.content}</p>
            {me?.id === post.authorId && post.status !== 'resolved' && (
              <button onClick={() => resolve(c.id)} className="text-xs text-brand-600 mt-2 hover:underline">Mark as accepted answer</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleComment} noValidate className="mt-6">
        <div className="flex gap-2">
          <input placeholder="Write a reply…" value={comment} onChange={(e) => setComment(e.target.value)} className={inputClass} />
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">Reply</button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}
