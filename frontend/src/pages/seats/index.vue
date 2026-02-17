<route lang="yaml">
name: Seats
meta:
  layout: client
  middleware: ["user"]
  title: Seats
</route>

<script lang="ts" setup>
  import { SeatsPage } from "./components";
</script>

<template>
  <SeatsPage />
</template>
