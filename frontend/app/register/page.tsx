'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, GraduationCap as CapIcon, BookOpen, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { api, apiError } from '../../lib/api';
import { useAuth, homePath } from '../../lib/auth';
import { validateRegister, passwordRules, Errors } from '../../lib/validation';
import FormField, { inputClass } from '../../components/ui/FormField';

const ROLES = [
  { id: 'student', label: 'Student', desc: 'Learn, ask questions, find a mentor', icon: BookOpen },
  { id: 'expert', label: 'Expert', desc: 'Mentor students, share your knowledge', icon: CapIcon },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' as 'student' | 'expert' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form); // Axios: POST /auth/register
      signIn(data.user, data.accessToken, data.refreshToken);
      router.push(homePath(data.user.role));
    } catch (err) {
      setServerError(apiError(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-subtle/40 px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 shadow-pop">
        <div className="mb-6 flex items-center gap-2 font-serif text-lg font-semibold text-brand">
          <GraduationCap className="h-6 w-6" /> EduConnect
        </div>
        <h1 className="font-serif text-[22px] font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-[14px] text-ink-2">Join as a student or an expert mentor — it takes a minute.</p>

        {serverError && (
          <div role="alert" className="mt-5 rounded-md border border-danger/25 bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <FormField label="I am joining as" required>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setForm({ ...form, role: r.id })}
                  className={clsx(
                    'rounded-md border p-3 text-left transition-colors',
                    form.role === r.id ? 'border-brand bg-brand-soft' : 'border-line hover:bg-subtle',
                  )}
                >
                  <r.icon className={clsx('mb-1.5 h-4 w-4', form.role === r.id ? 'text-brand' : 'text-ink-3')} />
                  <p className="text-[13.5px] font-semibold text-ink">{r.label}</p>
                  <p className="text-[11.5px] text-ink-2">{r.desc}</p>
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Full name" htmlFor="name" error={errors.name}>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass(!!errors.name)} />
          </FormField>
          <FormField label="Email address" htmlFor="email" error={errors.email}>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass(!!errors.email)} />
          </FormField>
          <FormField label="Password" htmlFor="password" error={errors.password}>
            <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass(!!errors.password)} />
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {passwordRules.map((r) => {
                const pass = r.test(form.password);
                return (
                  <li key={r.id} className={clsx('flex items-center gap-1 text-[11.5px]', pass ? 'text-success' : 'text-ink-3')}>
                    {pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {r.label}
                  </li>
                );
              })}
            </ul>
          </FormField>
          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-[13.5px] text-ink-2">
          Already have an account?{' '}
          <Link href="/" className="font-semibold text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
