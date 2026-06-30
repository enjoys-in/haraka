import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { StatGridSkeleton } from '@/components/stat-grid-skeleton';
import { TableSkeleton } from '@/components/table-skeleton';

/** Loading fallback for the live monitor page. */
export function MonitoringSkeleton() {
  return (
    <Page className="gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <PageScroll className="space-y-6">
        <StatGridSkeleton count={8} />
        <TableSkeleton rows={5} columns={9} />
      </PageScroll>
    </Page>
  );
}
