import { initials } from '../../lib/format';

const PALETTE = [
  'bg-brand-soft text-brand',
  'bg-accent-soft text-accent',
  'bg-success-soft text-success',
  'bg-warn-soft text-warn',
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const SIZES = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-xs', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };

export default function Avatar({ name, size = 'md' }: { name?: string; size?: keyof typeof SIZES }) {
  const label = name || '?';
  const palette = PALETTE[hash(label) % PALETTE.length];
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${palette} ${SIZES[size]}`}
      aria-hidden
    >
      {initials(label)}
    </span>
  );
}
