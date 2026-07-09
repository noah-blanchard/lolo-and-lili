import "server-only";
import { QueryClient } from "@tanstack/react-query";

/**
 * A fresh QueryClient for prefetching query data during a single RSC render.
 * The page prefetches with the same `queryKeys` the client hooks use, then wraps
 * its content in <HydrationBoundary state={dehydrate(qc)}> — so the client cache
 * hydrates with data on first paint instead of fetching after hydration (F-021).
 *
 * `staleTime` mirrors the client (query-provider.tsx) so hydrated data isn't
 * treated as immediately stale, which would trigger a redundant refetch on mount.
 * Realtime + the client hooks keep the data live afterwards.
 */
export function makeServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000 },
    },
  });
}
