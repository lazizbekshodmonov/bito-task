import type { PaginatedResponse } from "@/types/pagination";

export interface UsePaginatedQueryOptions<T> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
}
