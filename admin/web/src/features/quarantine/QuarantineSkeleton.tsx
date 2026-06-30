import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { TableSkeleton } from '@/components/table-skeleton';

/** Loading fallback for the quarantine page. */
export function QuarantineSkeleton() {
  return (
    <Page className="gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <PageScroll className="space-y-4">
        <TableSkeleton rows={5} columns={8} title={false} />
      </PageScroll>
    </Page>
  );
}
