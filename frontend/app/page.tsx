'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Users, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { api, storeAuth, getStoredUser } from '../lib/api';
import { validateLogin, Errors } from '../lib/validation';
import FormField, { inputClass } from '../components/FormField';

const features = [
  { icon: BookOpen, title: 'Shared course materials', text: 'Upload, search and save study resources.' },
  { icon: Users, title: 'Verified expert mentors', text: 'Request mentorship from approved experts.' },
  { icon: MessageSquare, title: 'Community Q&A', text: 'Ask for help and mark accepted answers.' },
];

function homeFor(role: string) {
  return role === 'expert' ? '/dashboard/expert' : role === 'admin' ? '/admin' : '/dashboard/student';
}

// The login page is the landing page ("/") of the site.
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already logged in? Go straight to the dashboard.
  useEffect(() => {
    const u = getStoredUser();
    if (u && localStorage.getItem('accessToken')) router.replace(homeFor(u.role));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form); // AXIOS POST
      storeAuth(data.user, data.accessToken, data.refreshToken);
      router.push(homeFor(data.user.role));
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex bg-white dark:bg-slate-950 overflow-auto">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 text-white p-14 flex-col justify-between">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_80%,#10b981,transparent_40%)]" />
        <div className="relative flex items-center gap-2 text-xl font-bold">
          <GraduationCap className="w-8 h-8" /> EduConnect
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">
            Where students meet <br /> the experts who guide them.
          </h1>
          <p className="mt-4 text-indigo-100 max-w-md">
            A learning platform for sharing knowledge, getting answers and finding the right mentor.
          </p>
          <ul className="mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-indigo-100">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-indigo-200">© {new Date().getFullYear()} EduConnect</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 text-xl font-bold text-brand-600 mb-8">
            <GraduationCap className="w-7 h-7" /> EduConnect
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-slate-500 mt-1 mb-8">Sign in to continue to your dashboard.</p>

          {serverError && (
            <div role="alert" className="mb-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormField label="Email address" error={errors.email}>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Password" error={errors.password}>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </FormField>
            <div className="text-right -mt-2">
              <Link href="/forgot-password" className="text-sm text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold shadow-sm hover:bg-brand-700 disabled:opacity-60 transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center mt-8 text-slate-500">
            New to EduConnect?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
