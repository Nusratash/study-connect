import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3 p-5">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="card flex items-center gap-3 p-4">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
