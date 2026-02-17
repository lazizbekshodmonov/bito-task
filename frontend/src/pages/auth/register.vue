<route lang="yaml">
name: Register
meta:
  layout: default
  middleware: ["auth"]
</route>

<script lang="ts" setup>
  import { RegisterPage } from "./components";
</script>

<template>
  <RegisterPage />
</template>
