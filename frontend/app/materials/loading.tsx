import { Skeleton, SkeletonCard } from '../../components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="mb-6 h-10 w-full max-w-xs" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}
