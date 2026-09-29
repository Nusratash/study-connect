'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, session } from './api';
import type { Role, User } from './types';

type Status = 'loading' | 'authed' | 'anon';

interface AuthContextValue {
  user: User | null;
  status: Status;
  signIn: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function homePath(role?: Role) {
  if (role === 'admin') return '/admin';
  if (role === 'expert') return '/dashboard/expert';
  return '/dashboard/student';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const stored = session.readUser<User>();
    if (stored && session.accessToken) {
      setUser(stored);
      setStatus('authed');
    } else {
      setStatus('anon');
    }
  }, []);

  const signIn = useCallback((u: User, accessToken: string, refreshToken: string) => {
    session.save(u, accessToken, refreshToken);
    setUser(u);
    setStatus('authed');
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      session.save(next);
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/logout'); // Axios: POST /auth/logout
    } catch {
      /* the local session is cleared either way */
    }
    session.clear();
    setUser(null);
    setStatus('anon');
  }, []);

  const value = useMemo(() => ({ user, status, signIn, updateUser, signOut }), [user, status, signIn, updateUser, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
