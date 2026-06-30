import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { TableSkeleton } from '@/components/table-skeleton';
import { Card, CardContent } from '@/components/ui/card';

/** Loading fallback for the access control page. */
export function AccessSkeleton() {
  return (
    <Page className="gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <PageScroll className="space-y-4">
        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_2fr_auto]">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-32" />
          </CardContent>
        </Card>
        <TableSkeleton rows={5} columns={6} title={false} />
      </PageScroll>
    </Page>
  );
}
