<script setup lang="ts">
  import useSeatsPage from "./useSeatsPage";
  import { SeatIcon } from "../seat-icon";
  import { SeatDetailPanel } from "../seat-detail-panel";

  const {
    isLoading,
    seatsStore,
    activeFilter,
    categories,
    filteredSeatsByRow,
    sortedRows,
    selectedSeat,
    isMySeat,
    handleSeatClick,
  } = useSeatsPage();
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <div class="bg-black dark:bg-white text-white dark:text-black py-12 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-3">Select Your Seat</h1>
        <p class="text-white/70 dark:text-black/60 text-lg">Choose the perfect spot for an unforgettable experience</p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Category filter bar -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="px-5 py-2 rounded-full text-sm font-medium transition-all"
          :class="
            activeFilter === cat.key
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
              : `bg-white dark:bg-gray-800
                text-gray-600 dark:text-gray-300
                border border-gray-200
                dark:border-gray-700
                hover:border-gray-400
                dark:hover:border-gray-500`
          "
          @click="activeFilter = cat.key"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Seat grid area -->
        <div class="flex-1">
          <!-- Loading -->
          <div v-if="isLoading" class="flex justify-center py-20">
            <n-spin size="large" />
          </div>

          <template v-else>
            <!-- Stage -->
            <div class="mb-8">
              <div
                class="mx-auto max-w-lg h-12
                  rounded-b-[50%] stage-gradient
                  flex items-center justify-center
                  border-b-4 border-gray-400 dark:border-gray-600"
              >
                <span
                  class="text-sm font-bold
                    tracking-[0.3em] text-gray-600
                    dark:text-gray-400 uppercase"
                >
                  Stage
                </span>
              </div>
            </div>

            <!-- Seat rows -->
            <div class="space-y-3 overflow-x-auto p-4">
              <div
                v-for="row in sortedRows"
                :key="row"
                class="flex items-center gap-2 justify-center min-w-fit"
              >
                <span
                  class="w-8 text-center text-sm
                    font-bold text-gray-400
                    dark:text-gray-500 shrink-0"
                >
                  {{ row }}
                </span>
                <div class="flex gap-1.5">
                  <SeatIcon
                    v-for="seat in filteredSeatsByRow.get(row)"
                    :key="seat.id"
                    :seat="seat"
                    :is-selected="seatsStore.selectedSeatId === seat.id"
                    :is-mine="isMySeat(seat.reservations)"
                    @click="handleSeatClick"
                  />
                </div>
                <span
                  class="w-8 text-center text-sm
                    font-bold text-gray-400
                    dark:text-gray-500 shrink-0"
                >
                  {{ row }}
                </span>
              </div>
            </div>

            <!-- Legend -->
            <div
              class="mt-8 flex flex-wrap
                justify-center gap-6 text-sm
                text-gray-600 dark:text-gray-400"
            >
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-amber-500"></div>
                <span>VIP</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-purple-500"></div>
                <span>Premium</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-blue-500"></div>
                <span>Standard</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-emerald-500"></div>
                <span>Economy</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600 opacity-50"></div>
                <span>Reserved</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600 opacity-30"></div>
                <span>Confirmed</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Detail panel (desktop) -->
        <div class="hidden lg:block w-80 shrink-0">
          <div v-if="selectedSeat" class="sticky top-24">
            <SeatDetailPanel
              :key="selectedSeat.id"
              :seat="selectedSeat"
              :is-mine="isMySeat(selectedSeat.reservations)"
            />
          </div>
          <div
            v-else
            class="rounded-2xl border-2 border-dashed
              border-gray-300 dark:border-gray-700
              p-8 text-center"
          >
            <p class="text-gray-400 dark:text-gray-500">Click a seat to view details</p>
          </div>
        </div>
      </div>

      <!-- Detail panel (mobile/tablet - bottom) -->
      <div v-if="selectedSeat" class="lg:hidden mt-6">
        <SeatDetailPanel
          :key="selectedSeat.id"
          :seat="selectedSeat"
          :is-mine="isMySeat(selectedSeat.reservations)"
        />
      </div>
    </div>
  </div>
</template>
