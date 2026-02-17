<route lang="yaml">
name: AdminSeats
meta:
  layout: dashboard
  middleware: ["admin"]
  title: Seats
</route>

<script lang="ts" setup>
  import { AdminSeatsPage } from "./components";
</script>

<template>
  <AdminSeatsPage />
</template>
