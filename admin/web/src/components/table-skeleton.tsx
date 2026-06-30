import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  /** Optional header line above the table. */
  title?: boolean;
}

/** Generic table placeholder used as a Suspense / loading fallback. */
export function TableSkeleton({ rows = 6, columns = 5, title = true }: TableSkeletonProps) {
  return (
    <Card>
      {title && (
        <CardHeader className="p-4">
          <Skeleton className="h-4 w-40" />
        </CardHeader>
      )}
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={`h-4 ${colIndex === 0 ? 'w-16' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
