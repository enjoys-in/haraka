import { Page, PageScroll } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { AddRouteForm } from './components/AddRouteForm';
import { RouteTable } from './components/RouteTable';
import { MOCK_ROUTES } from './routing.mock';

/** Outbound routing: smart hosts, relays and per-domain transport. */
export function RoutingPage() {
  const routes = MOCK_ROUTES;

  return (
    <Page className="gap-4">
      <PageHeader title="Routing" description="Outbound delivery routes and smart hosts" />

      <PageScroll className="space-y-4">
        <AddRouteForm />
        <RouteTable routes={routes} />
      </PageScroll>
    </Page>
  );
}

export default RoutingPage;
