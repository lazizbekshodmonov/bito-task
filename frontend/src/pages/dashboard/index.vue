<route lang="yaml">
name: Dashboard
meta:
  layout: dashboard
  middleware: ["admin"]
  title: Dashboard
</route>

<script lang="ts" setup>
  import { DashboardPage } from "./components";
</script>

<template>
  <DashboardPage />
</template>
