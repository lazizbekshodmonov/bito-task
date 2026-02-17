<route lang="yaml">
name: AdminLogin
meta:
  layout: default
  middleware: ["auth"]
</route>

<script lang="ts" setup>
  import { AdminLoginPage } from "./components";
</script>

<template>
  <AdminLoginPage />
</template>
