import { Skeleton } from '../../../components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
