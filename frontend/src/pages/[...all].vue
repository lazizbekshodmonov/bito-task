<script lang="ts" setup>
  /**
   * NotFoundPage Route Wrapper
   *
   * @description Catch-all route wrapper for unmatched URLs.
   *   Renders the NotFoundPage component which displays a 404 page.
   *
   * @usage Mapped to route /[...all] (catches all unmatched routes)
   */
  import { NotFoundPage } from "./components";
</script>

<template>
  <NotFoundPage />
</template>

<route lang="yaml">
meta:
  layout: default
</route>
