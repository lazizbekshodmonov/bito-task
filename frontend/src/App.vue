<script setup lang="ts">
  import { darkTheme, type GlobalTheme } from "naive-ui";
  import { lightThemeOverrides, darkThemeOverrides } from "@/plugins/naive-ui/themeOverrides.ts";
  import { useDarkMode } from "@/composables/useDarkMode.ts";
  import type { Component } from "vue";

  const { isDark } = useDarkMode();

  const route = useRoute();

  const layoutModules = import.meta.glob<{ default: Component }>("./layouts/*.vue");

  const layouts = Object.fromEntries(
    Object.entries(layoutModules).map(([path, importFn]) => {
      const layoutName = path.replace("./layouts/", "").replace("Layout.vue", "").replace(".vue", "").toLowerCase() as string;
      return [layoutName, markRaw(defineAsyncComponent(importFn))];
    })
  ) as Record<string, Component>;

  const layoutComponent = computed(() => {
    const layoutName = (route.meta.layout as string) || "default";
    return layouts[layoutName.replace(".vue", "")] || layouts.default;
  });
  const theme = computed<GlobalTheme | null>(() => (isDark.value ? darkTheme : null));
  const themeOverrides = computed(() => (isDark.value ? darkThemeOverrides : lightThemeOverrides));
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides" class="h-screen w-screen">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-dialog-provider>
            <n-loading-bar-provider>
              <component :is="layoutComponent">
                <router-view />
              </component>
            </n-loading-bar-provider>
          </n-dialog-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
