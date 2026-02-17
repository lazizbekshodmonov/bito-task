<script setup lang="ts">
  import IconSun from "@/components/icons/tabler/IconSun.vue";
  import IconMoon from "@/components/icons/tabler/IconMoon.vue";
  import IconUserAvatar from "@/components/icons/carbon/IconUserAvatar.vue";
  import useClientLayout from "./useClientLayout";

  const { authStore, isDark, toggleDark, handleLogout, goToSeats, goToReservations } = useClientLayout();

  const route = useRoute();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Navbar -->
    <header
      class="sticky top-0 z-50 border-b border-gray-200
        dark:border-gray-700 bg-white/80
        dark:bg-gray-900/80 backdrop-blur-lg"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left: Brand + Nav -->
          <div class="flex items-center gap-8">
            <div class="flex items-center gap-2 cursor-pointer" @click="goToSeats">
              <img src="/logo.svg" alt="DSRS" class="w-9 h-9 rounded-lg" />
              <span class="text-xl font-bold text-gray-900 dark:text-white">DSRS</span>
            </div>

            <nav class="hidden sm:flex items-center gap-1">
              <button
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                  route.path === '/seats'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : `text-gray-600 dark:text-gray-400
                      hover:text-gray-900
                      dark:hover:text-white
                      hover:bg-gray-100
                      dark:hover:bg-gray-800`
                "
                @click="goToSeats"
              >
                Home
              </button>
              <button
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                  route.path === '/reservations'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : `text-gray-600 dark:text-gray-400
                      hover:text-gray-900
                      dark:hover:text-white
                      hover:bg-gray-100
                      dark:hover:bg-gray-800`
                "
                @click="goToReservations"
              >
                My Reservations
              </button>
            </nav>
          </div>

          <!-- Right: Controls -->
          <div class="flex items-center gap-3">
            <button
              class="p-2 rounded-lg text-gray-500
                dark:text-gray-400 hover:bg-gray-100
                dark:hover:bg-gray-800 transition-colors"
              @click="toggleDark"
            >
              <icon-sun v-if="isDark" class="w-5 h-5" />
              <icon-moon v-else class="w-5 h-5" />
            </button>

            <n-dropdown
              trigger="click"
              :options="[
                { label: 'Profile', key: 'profile' },
                { label: 'Logout', key: 'logout' },
              ]"
              @select="(key: string) => key === 'logout' && handleLogout()"
            >
              <div
                class="flex items-center gap-2
                  cursor-pointer hover:opacity-80
                  transition-opacity"
              >
                <n-avatar :size="34" round class="bg-blue-600">
                  <icon-user-avatar class="text-white" />
                </n-avatar>
                <div
                  v-if="authStore.user"
                  class="hidden sm:block leading-tight"
                >
                  <div
                    class="text-sm font-medium
                      text-gray-900 dark:text-white"
                  >
                    {{ authStore.user.name }}
                  </div>
                  <div
                    class="text-xs text-gray-500
                      dark:text-gray-400"
                  >
                    {{ authStore.user.email }}
                  </div>
                </div>
              </div>
            </n-dropdown>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer
      class="border-t border-gray-200
        dark:border-gray-700
        bg-white dark:bg-gray-900 py-6"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6
          lg:px-8 text-center text-sm
          text-gray-500 dark:text-gray-400"
      >
        Distributed Seat Reservation System &copy; {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>
