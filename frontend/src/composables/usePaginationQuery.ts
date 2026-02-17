import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { UsePaginatedQueryOptions } from "@/composables/pagination-query.types";

/**
 * Composable that wraps TanStack Query's useQuery for paginated API endpoints.
 * Provides reactive items array, pagination metadata, loading states, error handling,
 * and refetch capability. Uses previous data as placeholder during refetches for
 * seamless pagination transitions.
 *
 * @param options - Configuration object containing queryKey, queryFn, and optional enabled flag
 * @returns An object containing items, data, pagination, isLoading, isFetching, error, and refetch
 */
export const usePaginatedQuery = <T>({ queryKey, queryFn, enabled = true }: UsePaginatedQueryOptions<T>) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled,
    placeholderData: (previousData) => previousData,
  });

  const items = computed(() => data.value?.content || []);

  const pagination = computed(() => ({
    page: data.value?.page || 1,
    size: data.value?.size || 0,
    totalPages: data.value?.totalPages || 0,
    totalElements: data.value?.totalElements || 0,
    hasNext: data.value?.hasNext || false,
  }));

  return {
    items,
    data,
    pagination,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
