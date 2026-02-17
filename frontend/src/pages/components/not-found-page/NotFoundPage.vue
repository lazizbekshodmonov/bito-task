<script lang="ts" setup>
  /**
   * NotFoundPage
   *
   * @description Displays a 404 error page with a message and a button to navigate
   *   back to the home page. Used as the catch-all route for unmatched URLs.
   *
   * @props None
   *
   * @emits None
   *
   * @usage
   *   <NotFoundPage />
   */
  import useNotFoundPage from "./useNotFoundPage";

  const { goHome } = useNotFoundPage();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-800 dark:text-gray-200">404</h1>
      <p class="text-2xl font-semibold text-gray-600 dark:text-gray-400 mt-4">Page Not Found</p>
      <p class="text-gray-500 dark:text-gray-500 mt-2">The page you are looking for doesn't exist.</p>
      <n-button
        type="primary"
        size="large"
        class="mt-6"
        @click="goHome"
      > Go Home </n-button>
    </div>
  </div>
</template>
