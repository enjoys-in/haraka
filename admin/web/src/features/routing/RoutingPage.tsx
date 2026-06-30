import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { AddRouteForm } from './components/AddRouteForm';
import { RouteTable } from './components/RouteTable';
import { useRoutes } from './useRoutes';

/** Outbound routing: smart hosts, relays and per-domain transport (smtp_forward.ini). */
export function RoutingPage() {
  const { routes, loading, busy, error, save, remove } = useRoutes();

  return (
    <Page className="gap-4">
      <PageHeader title="Routing" description="Outbound delivery routes and smart hosts" />

      <PageScroll className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <>
            <AddRouteForm onAdd={save} busy={busy} />
            <RouteTable
              routes={routes}
              loading={loading}
              busy={busy}
              onRemove={(domain) => void remove(domain)}
            />
          </>
        )}
      </PageScroll>
    </Page>
  );
}

export default RoutingPage;
