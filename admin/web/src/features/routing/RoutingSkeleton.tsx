import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { TableSkeleton } from '@/components/table-skeleton';
import { Card, CardContent } from '@/components/ui/card';

/** Loading fallback for the routing page. */
export function RoutingSkeleton() {
  return (
    <Page className="gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <PageScroll className="space-y-4">
        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
        <TableSkeleton rows={4} columns={8} title={false} />
      </PageScroll>
    </Page>
  );
}
