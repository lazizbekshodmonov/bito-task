<script setup lang="ts">
  import IconMenu from "@/components/icons/tabler/IconMenu.vue";
  import IconSun from "@/components/icons/tabler/IconSun.vue";
  import IconMoon from "@/components/icons/tabler/IconMoon.vue";
  import useDashboardLayout from "./useDashboardLayout";

  const { authStore, router, collapsed, isDark, toggleDark, breadcrumbs, menuOptions, activeKey, IconUserAvatar, handleMenuClick, handleLogout } = useDashboardLayout();
</script>

<template>
  <n-layout has-sider class="h-full">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="270"
      :collapsed="collapsed"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="flex items-center h-14 px-4 overflow-hidden">
        <img src="/logo.svg" alt="DSRS" class="w-8 h-8 shrink-0 rounded-lg" />
        <h2
          class="text-xl font-bold text-primary m-0
            whitespace-nowrap transition-all
            duration-300 ease-in-out"
          :class="collapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 w-auto ml-2'"
        >
          DSRS
        </h2>
      </div>

      <n-menu
        :value="activeKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        class="mt-4"
        @update:value="handleMenuClick"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered class="h-14 px-4 flex items-center justify-between">
        <n-space align="center" :size="12">
          <n-button
            quaternary
            circle
            size="small"
            @click="collapsed = !collapsed"
          >
            <template #icon>
              <icon-menu />
            </template>
          </n-button>
          <n-breadcrumb>
            <n-breadcrumb-item
              v-for="(item, i) in breadcrumbs"
              :key="i"
              @click="item.routeName && router.push({ name: item.routeName })"
            >
              <span :class="item.routeName ? 'cursor-pointer' : ''">
                {{ item.label }}
              </span>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </n-space>

        <n-space align="center" :size="12">
          <n-button
            quaternary
            circle
            size="small"
            @click="toggleDark"
          >
            <template #icon>
              <icon-sun v-if="isDark" />
              <icon-moon v-else />
            </template>
          </n-button>

          <n-dropdown
            trigger="click"
            :options="[
              { label: 'Profile', key: 'profile' },
              { label: 'Logout', key: 'logout' },
            ]"
            @select="(key: string) => key === 'logout' && handleLogout()"
          >
            <div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <n-avatar :size="32" round>
                <icon-user-avatar />
              </n-avatar>
              <div v-if="authStore.user" class="leading-tight">
                <div class="text-sm font-medium">{{ authStore.user.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ authStore.user.email }}
                </div>
              </div>
            </div>
          </n-dropdown>
        </n-space>
      </n-layout-header>

      <n-layout-content>
        <div class="p-6">
          <slot></slot>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
