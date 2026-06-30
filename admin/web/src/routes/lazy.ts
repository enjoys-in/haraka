import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * `React.lazy` for modules that expose their component under a *named* export
 * (our page components are named, not default). Keeps the router declarative
 * while still code-splitting every page into its own chunk.
 */
export function lazyNamed(
  loader: () => Promise<Record<string, unknown>>,
  name: string,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[name] as ComponentType };
  });
}
