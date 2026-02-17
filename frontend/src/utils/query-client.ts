import { QueryClient } from "@tanstack/vue-query";

/**
 * Pre-configured TanStack Query client instance with default options.
 * Disables refetch on window focus, limits retries to 1, and sets
 * a 5-minute stale time for all queries.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
