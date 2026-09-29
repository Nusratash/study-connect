'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<{ dark: boolean; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ec.theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(stored ? stored === 'dark' : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    setDark((d) => {
      localStorage.setItem('ec.theme', !d ? 'dark' : 'light');
      return !d;
    });
  };

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
