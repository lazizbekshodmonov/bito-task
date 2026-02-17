<route lang="yaml">
name: AdminUsers
meta:
  layout: dashboard
  middleware: ["admin"]
  title: Users
</route>

<script lang="ts" setup>
  import { UsersPage } from "./components";
</script>

<template>
  <UsersPage />
</template>
