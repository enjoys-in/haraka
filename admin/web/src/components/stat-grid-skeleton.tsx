import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export interface StatGridSkeletonProps {
  count?: number;
  className?: string;
}

/** Placeholder grid of KPI tiles for loading states. */
export function StatGridSkeleton({
  count = 4,
  className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
}: StatGridSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-7 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
