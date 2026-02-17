<route lang="yaml">
name: Login
meta:
  layout: default
  middleware: ["auth"]
</route>

<script lang="ts" setup>
  import { LoginPage } from "./components";
</script>

<template>
  <LoginPage />
</template>
