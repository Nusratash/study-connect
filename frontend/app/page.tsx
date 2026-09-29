'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Users, MessagesSquare, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api, apiError } from '../lib/api';
import { useAuth, homePath } from '../lib/auth';
import { validateLogin, Errors } from '../lib/validation';
import FormField, { inputClass } from '../components/ui/FormField';

const FEATURES = [
  { icon: BookOpen, title: 'Shared course materials', text: 'Upload, search and save study resources by category.' },
  { icon: Users, title: 'Verified expert mentors', text: 'Request 1:1 mentorship from approved subject experts.' },
  { icon: MessagesSquare, title: 'Community Q&A', text: 'Ask questions, get answers, and mark the one that solved it.' },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, status, signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authed' && user) router.replace(homePath(user.role));
  }, [status, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form); // Axios: POST /auth/login
      signIn(data.user, data.accessToken, data.refreshToken);
      router.push(homePath(data.user.role));
    } catch (err) {
      setServerError(apiError(err, 'Unable to log in. Check your details and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-on-brand lg:flex xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        <div className="relative flex items-center gap-2.5 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-on-brand/15">
            <GraduationCap className="h-4.5 w-4.5" />
          </span>
          EduConnect
        </div>
        <div className="relative max-w-md">
          <h1 className="font-serif text-[2.6rem] font-semibold leading-[1.15] tracking-tight">
            Where students meet the experts who guide them.
          </h1>
          <p className="mt-4 text-[15px] text-on-brand/75">
            A focused learning platform for sharing knowledge, getting real answers, and finding the right mentor.
          </p>
          <ul className="mt-10 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-on-brand/10">
                  <f.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[14.5px] font-semibold">{f.title}</p>
                  <p className="text-[13.5px] text-on-brand/70">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-on-brand/50">© {new Date().getFullYear()} EduConnect. Built for learners and mentors.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-[26rem]">
          <div className="mb-9 flex items-center gap-2 font-serif text-lg font-semibold text-brand lg:hidden">
            <GraduationCap className="h-6 w-6" /> EduConnect
          </div>
          <h2 className="font-serif text-[26px] font-semibold text-ink">Welcome back</h2>
          <p className="mt-1.5 text-[15px] text-ink-2">Sign in to continue to your dashboard.</p>

          {serverError && (
            <div role="alert" className="mt-6 rounded-md border border-danger/25 bg-danger-soft px-4 py-3 text-[13.5px] text-danger">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <FormField label="Email address" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass(!!errors.email)}
              />
            </FormField>
            <FormField label="Password" htmlFor="password" error={errors.password}>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass(!!errors.password) + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>
            <div className="-mt-1 text-right">
              <Link href="/forgot-password" className="text-[13px] font-medium text-brand hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-[13.5px] text-ink-2">
            New to EduConnect?{' '}
            <Link href="/register" className="inline-flex items-center gap-0.5 font-semibold text-brand hover:underline">
              Create an account <ArrowRight className="h-3 w-3" />
            </Link>
          </p>

          <div className="mt-8 rounded-lg border border-line bg-subtle/60 px-4 py-3 text-[12.5px] text-ink-2">
            <p className="mb-1 font-medium text-ink-2">Demo accounts</p>
            <p>admin@educonnect.dev · expert@educonnect.dev · student@educonnect.dev</p>
            <p className="text-ink-3">Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
