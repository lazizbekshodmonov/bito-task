<route lang="yaml">
name: AdminAdmins
meta:
  layout: dashboard
  middleware: ["admin"]
  title: Admins
</route>

<script lang="ts" setup>
  import { AdminsPage } from "./components";
</script>

<template>
  <AdminsPage />
</template>
