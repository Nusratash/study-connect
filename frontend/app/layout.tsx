import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { ThemeProvider } from '../lib/theme';
import { ToastProvider } from '../lib/toast';
import AppShell from '../components/layout/AppShell';

export const metadata: Metadata = {
  title: 'EduConnect — Learn. Mentor. Grow.',
  description: 'A student–expert mentorship platform: shared course materials, community Q&A, and 1:1 mentorship.',
};

// Avoids a light-mode flash before ThemeProvider reads localStorage on mount.
const noFlashScript = `
try {
  var t = localStorage.getItem('ec.theme');
  var dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
