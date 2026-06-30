import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { Card } from '@/components/ui/card';

/** Loading fallback for the logs page. */
export function LogsSkeleton() {
  return (
    <Page className="gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <PageScroll className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Card className="space-y-2 p-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </Card>
      </PageScroll>
    </Page>
  );
}
