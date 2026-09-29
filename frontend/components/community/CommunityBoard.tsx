'use client';

import { useMemo, useState } from 'react';
import { MessagesSquare, Plus } from 'lucide-react';
import { api, apiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { validatePost, Errors } from '../../lib/validation';
import type { Post } from '../../lib/types';
import PostCard from './PostCard';
import PageHeader from '../ui/PageHeader';
import EmptyState from '../ui/EmptyState';
import FormField, { inputClass } from '../ui/FormField';
import clsx from 'clsx';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
] as const;

export default function CommunityBoard({ initialPosts, initialFailed }: { initialPosts: Post[]; initialFailed: boolean }) {
  const { user } = useAuth();
  const { push } = useToast();
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validatePost(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      await api.post('/posts', { // Axios: POST /posts
        title: form.title,
        content: form.content,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      const { data } = await api.get<Post[]>('/posts'); // Axios: GET /posts (refresh list)
      setPosts(data);
      setForm({ title: '', content: '', tags: '' });
      setShowForm(false);
      push('success', 'Your question was posted.');
    } catch (err) {
      push('error', apiError(err, 'Could not post your question. Are you signed in?'));
    } finally {
      setSubmitting(false);
    }
  }

  const visible = useMemo(() => (filter === 'all' ? posts : posts.filter((p) => p.status === filter)), [posts, filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Questions & discussions"
        description="Ask for help, share what you know, and mark the reply that solved it."
        actions={
          user && (
            <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
              <Plus className="h-4 w-4" /> Ask a question
            </button>
          )
        }
      />

      <div className="mb-6 flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx('rounded-full px-3.5 py-1 text-[12.5px] font-medium', filter === f.id ? 'bg-brand text-on-brand' : 'bg-subtle text-ink-2 hover:bg-line/60')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="card mb-6 space-y-4 p-5">
          <FormField label="Title" error={errors.title} required>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass(!!errors.title)} placeholder="Be specific — what are you stuck on?" />
          </FormField>
          <FormField label="Details" error={errors.content} required>
            <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputClass(!!errors.content)} placeholder="What have you tried so far?" />
          </FormField>
          <FormField label="Tags" hint="Comma separated, e.g. calculus, exam-prep">
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass()} />
          </FormField>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Posting…' : 'Post question'}</button>
          </div>
        </form>
      )}

      {initialFailed && posts.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="Couldn't load the community board" description="The API might be starting up — try refreshing in a moment." />
      ) : visible.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="No posts here yet" description={user ? 'Be the first to ask a question.' : 'Sign in to ask the first question.'} />
      ) : (
        <div className="space-y-3">
          {visible.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
