import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { TableSkeleton } from '@/components/table-skeleton';

/** Loading fallback for the mail history page. */
export function MailHistorySkeleton() {
  return (
    <Page className="gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <PageScroll className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-40" />
        </div>
        <TableSkeleton rows={6} columns={8} title={false} />
      </PageScroll>
    </Page>
  );
}
