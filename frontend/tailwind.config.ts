import type { Config } from 'tailwindcss';

// Every colour is a CSS variable (see app/globals.css) so light and dark
// themes share one set of utility classes.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        subtle: token('subtle'),
        line: token('line'),
        ink: token('ink'),
        'ink-2': token('ink-2'),
        'ink-3': token('ink-3'),
        brand: token('brand'),
        'brand-hover': token('brand-hover'),
        'brand-soft': token('brand-soft'),
        'on-brand': token('on-brand'),
        accent: token('accent'),
        'accent-soft': token('accent-soft'),
        success: token('success'),
        'success-soft': token('success-soft'),
        warn: token('warn'),
        'warn-soft': token('warn-soft'),
        danger: token('danger'),
        'danger-soft': token('danger-soft'),
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Inter', 'Roboto',
          '"Helvetica Neue"', 'Arial', 'sans-serif',
        ],
        serif: [
          '"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Charter',
          '"Book Antiqua"', 'Georgia', 'serif',
        ],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        pop: '0 8px 24px -6px rgb(0 0 0 / 0.16), 0 0 0 1px rgb(var(--line))',
        focus: '0 0 0 3px rgb(var(--brand) / 0.22)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 140ms ease-out',
        'rise-in': 'rise-in 180ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
