'use client';

import { useEffect, useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { api, apiError } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useToast } from '../../../lib/toast';
import { splitList } from '../../../lib/format';
import { validatePasswordChange, Errors } from '../../../lib/validation';
import PageHeader from '../../../components/ui/PageHeader';
import FormField, { inputClass } from '../../../components/ui/FormField';
import Avatar from '../../../components/ui/Avatar';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { User } from '../../../lib/types';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
] as const;

export default function ProfileEditPage() {
  const { user, updateUser } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('profile');
  const [profile, setProfile] = useState<User | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<User>('/users/me').then((res) => { // Axios: GET /users/me
      setProfile(res.data);
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
    if (!profile) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name: form.name, bio: form.bio };
      if (profile.role === 'student') {
        payload.interests = splitList(form.interests);
        payload.educationLevel = form.educationLevel;
        payload.goals = form.goals;
      } else if (profile.role === 'expert') {
        payload.expertise = splitList(form.expertise);
        payload.credentials = form.credentials;
        payload.availability = form.availability;
      }
      const { data } = await api.patch<User>('/users/me', payload); // Axios: PATCH /users/me
      updateUser({ name: data.name });
      push('success', 'Profile updated.');
    } catch (err) {
      push('error', apiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (!profile || !user) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader eyebrow="Account" title="Edit profile" />

      <div className="mb-6 flex items-center gap-3">
        <Avatar name={profile.name} size="lg" />
        <div>
          <p className="font-semibold text-ink">{profile.name}</p>
          <p className="text-[12.5px] capitalize text-ink-2">{profile.role}</p>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx('border-b-2 px-3 pb-2.5 text-[13.5px] font-medium', tab === t.id ? 'border-brand text-brand' : 'border-transparent text-ink-2 hover:text-ink')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <FormField label="Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass()} />
          </FormField>
          <FormField label="Bio">
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputClass()} />
          </FormField>

          {profile.role === 'student' && (
            <>
              <FormField label="Interests" hint="Comma separated">
                <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className={inputClass()} />
              </FormField>
              <FormField label="Education level">
                <input value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })} className={inputClass()} />
              </FormField>
              <FormField label="Goals">
                <textarea rows={2} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} className={inputClass()} />
              </FormField>
            </>
          )}

          {profile.role === 'expert' && (
            <>
              <FormField label="Expertise" hint="Comma separated">
                <input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} className={inputClass()} />
              </FormField>
              <FormField label="Credentials">
                <input value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} className={inputClass()} />
              </FormField>
              <FormField label="Availability">
                <input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputClass()} />
              </FormField>
            </>
          )}

          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      ) : (
        <SecurityTab />
      )}
    </div>
  );
}

function SecurityTab() {
  const { push } = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validatePasswordChange(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await api.patch('/users/me/password', { currentPassword: form.current, newPassword: form.next }); // Axios: PATCH /users/me/password
      push('success', 'Password updated.');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      push('error', apiError(err, 'Could not update password.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <FormField label="Current password" error={errors.current}>
        <input type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className={inputClass(!!errors.current)} />
      </FormField>
      <FormField label="New password" error={errors.next}>
        <input type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} className={inputClass(!!errors.next)} />
      </FormField>
      <FormField label="Confirm new password" error={errors.confirm}>
        <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inputClass(!!errors.confirm)} />
      </FormField>
      <button type="submit" disabled={saving} className="btn-primary"><ShieldCheck className="h-4 w-4" /> {saving ? 'Updating…' : 'Update password'}</button>
    </form>
  );
}
