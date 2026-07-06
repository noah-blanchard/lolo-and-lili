"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // One client per browser session; realtime keeps the cache fresh.
  const [client] = useState(makeClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
