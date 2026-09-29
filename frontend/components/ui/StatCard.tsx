import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

const TONES = {
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  neutral: 'bg-subtle text-ink-2',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'brand',
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-md', TONES[tone])}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="tabular text-[22px] font-semibold leading-tight text-ink">{value}</p>
        <p className="text-[12.5px] text-ink-2">{label}</p>
      </div>
    </div>
  );
}
