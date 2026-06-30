import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { TableSkeleton } from '@/components/table-skeleton';
import { Card, CardContent } from '@/components/ui/card';

/** Loading fallback for the aliases page. */
export function AliasesSkeleton() {
  return (
    <Page className="gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-60" />
      </div>
      <PageScroll className="space-y-4">
        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto]">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-20" />
          </CardContent>
        </Card>
        <TableSkeleton rows={4} columns={6} title={false} />
      </PageScroll>
    </Page>
  );
}
