'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { api, storeAuth } from '../../lib/api';
import { validateRegister, Errors } from '../../lib/validation';
import FormField, { inputClass } from '../../components/FormField';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
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
      const { data } = await api.post('/auth/register', form); // AXIOS POST
      storeAuth(data.user, data.accessToken, data.refreshToken);
      router.push(data.user.role === 'expert' ? '/dashboard/expert' : '/dashboard/student');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 overflow-auto bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center gap-2 text-xl font-bold text-brand-600 mb-6">
          <GraduationCap className="w-7 h-7" /> EduConnect
        </div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Join as a student or an expert mentor.</p>

        {serverError && (
          <div role="alert" className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {Array.isArray(serverError) ? serverError.join(', ') : serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Full name" error={errors.name}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Email address" error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Password" error={errors.password}>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="I am a">
            <div className="grid grid-cols-2 gap-2">
              {(['student', 'expert'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition ${
                    form.role === r ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </FormField>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-center mt-6 text-slate-500">
          Already have an account?{' '}
          <Link href="/" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
