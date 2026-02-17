/**
 * Creates a debounced version of the provided function that delays invocation
 * until after the specified delay has elapsed since the last call.
 *
 * @param fn - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns A debounced version of the original function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};
