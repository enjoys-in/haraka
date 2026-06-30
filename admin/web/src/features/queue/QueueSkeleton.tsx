import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { StatGridSkeleton } from '@/components/stat-grid-skeleton';
import { TableSkeleton } from '@/components/table-skeleton';

/** Loading fallback for the mail queue page. */
export function QueueSkeleton() {
  return (
    <Page className="gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <PageScroll className="space-y-6">
        <StatGridSkeleton count={4} />
        <TableSkeleton rows={5} columns={8} />
      </PageScroll>
    </Page>
  );
}
