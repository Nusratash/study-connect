import clsx from 'clsx';

const TONES = {
  neutral: 'bg-subtle text-ink-2',
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
};

export default function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', TONES[tone], className)}>
      {children}
    </span>
  );
}
