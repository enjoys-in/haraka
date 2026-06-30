import { Skeleton } from '@/components/ui/skeleton';
import { Page, PageScroll } from '@/components/page';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/** Loading fallback for the server settings page. */
export function SettingsSkeleton() {
  return (
    <Page className="gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <PageScroll className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="p-4">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      </PageScroll>
    </Page>
  );
}
