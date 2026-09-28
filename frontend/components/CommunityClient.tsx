'use client';

import { useState } from 'react';
import { api } from '../lib/api';
import { validatePost, Errors } from '../lib/validation';
import PostCard from './PostCard';
import FormField, { inputClass } from './FormField';

export default function CommunityClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validatePost(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    setServerError('');
    try {
      await api.post('/posts', {
        title: form.title,
        content: form.content,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }); // AXIOS POST
      const { data } = await api.get('/posts'); // AXIOS GET (refresh list)
      setPosts(data);
      setForm({ title: '', content: '', tags: '' });
      setShowForm(false);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Could not create post. Are you logged in?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-sm text-slate-500">Ask for help, share knowledge, get answers</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">+ Ask a question</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-800 space-y-4">
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <FormField label="Title" error={errors.title}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Description" error={errors.content}>
            <textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Tags (comma separated)">
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} />
          </FormField>
          <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-accent-500 text-white font-medium disabled:opacity-60">
            {submitting ? 'Posting…' : 'Post question'}
          </button>
        </form>
      )}

      {posts.length === 0 ? (
        <p className="text-slate-500">No posts yet. Be the first to ask!</p>
      ) : (
        <div className="space-y-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
      )}
    </div>
  );
}
