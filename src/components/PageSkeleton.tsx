import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div className="space-y-5 pb-4 animate-in fade-in duration-300">
      <div>
        <Skeleton className="h-6 w-28 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-40 rounded-xl flex-shrink-0" />)}
      </div>
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-300">
      <div>
        <Skeleton className="h-6 w-36 mb-1" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 flex-1 rounded-xl" />)}
      </div>
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
    </div>
  );
}

export function GenericSkeleton() {
  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-300">
      <div>
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
    </div>
  );
}
