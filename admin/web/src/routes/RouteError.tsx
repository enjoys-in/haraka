import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PATHS } from './paths';

interface ParsedError {
  /** Short headline shown in bold. */
  title: string;
  /** Human readable message. */
  message: string;
  /** Optional stack / extra detail for the collapsible section. */
  detail?: string;
  /** A failed dynamic import (stale chunk after a deploy) — a reload usually fixes it. */
  isChunkError: boolean;
}

const CHUNK_ERROR_RE = /loading (dynamically imported module|chunk)|importing a module script failed/i;

/** Normalises the many shapes `useRouteError()` can return into one view model. */
function parseRouteError(error: unknown): ParsedError {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText}`,
      message:
        typeof error.data === 'string' ? error.data : 'The page could not be loaded.',
      isChunkError: false,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Something went wrong',
      message: error.message || 'An unexpected error occurred.',
      detail: error.stack,
      isChunkError: CHUNK_ERROR_RE.test(error.message),
    };
  }

  return {
    title: 'Something went wrong',
    message: typeof error === 'string' ? error : 'An unexpected error occurred.',
    isChunkError: false,
  };
}

/**
 * Route-level error boundary rendered via the router's `errorElement`. Replaces
 * react-router's bare default error screen with a styled, actionable panel that
 * stays inside the app shell.
 */
export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { title, message, detail, isChunkError } = parseRouteError(error);

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h1 className="mt-4 text-lg font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>

        {isChunkError && (
          <p className="mt-2 text-sm text-muted-foreground">
            A newer version may have been deployed. Reloading should fix this.
          </p>
        )}

        {detail && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              Technical details
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-3 text-left text-xs">
              {detail}
            </pre>
          </details>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Reload
          </Button>
          <Button variant="outline" onClick={() => navigate(PATHS.dashboard)}>
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
