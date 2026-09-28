'use client';

import { useEffect, useState } from 'react';
import { api, storeAuth, getStoredUser } from '../../../lib/api';

export default function ProfileEditPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/users/me').then((res) => {
      setUser(res.data);
      setForm({
        name: res.data.name,
        bio: res.data.bio || '',
        interests: (res.data.studentProfile?.interests || []).join(', '),
        educationLevel: res.data.studentProfile?.educationLevel || '',
        goals: res.data.studentProfile?.goals || '',
        expertise: (res.data.expertProfile?.expertise || []).join(', '),
        credentials: res.data.expertProfile?.credentials || '',
        availability: res.data.expertProfile?.availability || '',
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const payload: any = { name: form.name, bio: form.bio };
      if (user.role === 'student') {
        payload.interests = form.interests.split(',').map((s: string) => s.trim()).filter(Boolean);
        payload.educationLevel = form.educationLevel;
        payload.goals = form.goals;
      } else if (user.role === 'expert') {
        payload.expertise = form.expertise.split(',').map((s: string) => s.trim()).filter(Boolean);
        payload.credentials = form.credentials;
        payload.availability = form.availability;
      }
      const { data } = await api.patch('/users/me', payload);
      const current = getStoredUser();
      const accessToken = localStorage.getItem('accessToken') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      storeAuth({ ...current, name: data.name }, accessToken, refreshToken);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <div className="skeleton h-64" />;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
        {saved && <p className="text-sm text-accent-600">Profile updated!</p>}
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
          />
        </div>

        {user.role === 'student' && (
          <>
            <div>
              <label className="text-sm font-medium">Interests (comma separated)</label>
              <input
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Education level</label>
              <input
                value={form.educationLevel}
                onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Goals</label>
              <textarea
                value={form.goals}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>
          </>
        )}

        {user.role === 'expert' && (
          <>
            <div>
              <label className="text-sm font-medium">Expertise (comma separated)</label>
              <input
                value={form.expertise}
                onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Credentials</label>
              <input
                value={form.credentials}
                onChange={(e) => setForm({ ...form, credentials: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Availability</label>
              <input
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
