<route lang="yaml">
name: Reservations
meta:
  layout: client
  middleware: ["user"]
  title: My Reservations
</route>

<script lang="ts" setup>
  import { ReservationsPage } from "./components";
</script>

<template>
  <ReservationsPage />
</template>
