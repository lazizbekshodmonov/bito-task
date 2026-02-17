/**
 * useNotFoundPage
 *
 * @description Provides navigation logic for the 404 Not Found page.
 *   Used by the NotFoundPage component.
 *
 * @returns Object containing the goHome navigation handler
 */
const useNotFoundPage = () => {
  const router = useRouter();

  /**
   * Navigates the user back to the home page.
   *
   * @returns void
   */
  const goHome = () => {
    router.push("/");
  };

  return { goHome };
};

export default useNotFoundPage;
