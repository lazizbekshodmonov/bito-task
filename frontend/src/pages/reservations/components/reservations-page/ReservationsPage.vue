<script setup lang="ts">
  import useReservationsPage from "./useReservationsPage";
  import { ReservationCard } from "../reservation-card";

  const { activeTab, tabs, reservations, totalCount, isLoading } = useReservationsPage();
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Reservations</h1>
      <span
        v-if="totalCount > 0"
        class="px-2.5 py-0.5 rounded-full text-xs
          font-semibold bg-blue-100 text-blue-800
          dark:bg-blue-900/30 dark:text-blue-300"
      >
        {{ totalCount }}
      </span>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2 rounded-md text-sm font-medium transition-all"
        :class="
          activeTab === tab.key
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <n-spin size="large" />
    </div>

    <!-- List -->
    <div v-else-if="reservations.length > 0" class="space-y-3">
      <ReservationCard
        v-for="reservation in reservations"
        :key="reservation.id"
        :reservation="reservation"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-20">
      <div
        class="w-20 h-20 mx-auto mb-4
          rounded-full bg-gray-100
          dark:bg-gray-800 flex items-center
          justify-center"
      >
        <svg class="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M4 18v3h3v-3h10v3h3v-3h1a1 1 0
              001-1V5a1 1 0 00-1-1H3a1 1 0
              00-1 1v12a1 1 0 001 1h1zm2-6h12v5H6v-5z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reservations yet</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">Browse available seats and make your first reservation</p>
      <router-link to="/seats">
        <n-button type="primary" size="large">Browse Seats</n-button>
      </router-link>
    </div>
  </div>
</template>
