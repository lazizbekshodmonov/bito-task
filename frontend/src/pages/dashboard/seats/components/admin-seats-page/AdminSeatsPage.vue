<script setup lang="ts">
  import useAdminSeatsPage from "./useAdminSeatsPage";
  import { SeatIcon } from "@/pages/seats/components/seat-icon";
  import { SeatStatus } from "@/services/seats/seat.types";

  const {
    isLoading,
    seatsStore,
    categoryFilter,
    statusFilter,
    categories,
    statuses,
    filteredSeatsByRow,
    sortedRows,
    stats,
    selectedSeat,
    handleSeatClick,
  } = useAdminSeatsPage();

  const reservationUser = computed(() => {
    if (!selectedSeat.value) return null;
    const r = selectedSeat.value.reservations?.find(
      (res) => res.status === "RESERVED" || res.status === "CONFIRMED"
    );
    return r ?? null;
  });
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Seats
    </h2>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">Total</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ stats.total }}
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="text-sm text-emerald-600 dark:text-emerald-400">
          Available
        </div>
        <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {{ stats.available }}
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="text-sm text-amber-600 dark:text-amber-400">Reserved</div>
        <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
          {{ stats.reserved }}
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border
          border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="text-sm text-blue-600 dark:text-blue-400">Confirmed</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ stats.confirmed }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="
            categoryFilter === cat.key
              ? 'bg-blue-600 text-white'
              : `bg-white dark:bg-gray-800
                text-gray-600 dark:text-gray-300
                border border-gray-200 dark:border-gray-700
                hover:border-blue-300 dark:hover:border-blue-600`
          "
          @click="categoryFilter = cat.key"
        >
          {{ cat.label }}
        </button>
      </div>
      <div class="w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" ></div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="st in statuses"
          :key="st.key"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="
            statusFilter === st.key
              ? 'bg-blue-600 text-white'
              : `bg-white dark:bg-gray-800
                text-gray-600 dark:text-gray-300
                border border-gray-200 dark:border-gray-700
                hover:border-blue-300 dark:hover:border-blue-600`
          "
          @click="statusFilter = st.key"
        >
          {{ st.label }}
        </button>
      </div>
    </div>

    <div class="flex flex-col xl:flex-row gap-6">
      <!-- Seat grid -->
      <div
        class="flex-1 bg-white dark:bg-gray-800 rounded-xl border
          border-gray-200 dark:border-gray-700 p-6"
      >
        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-20">
          <n-spin size="large" />
        </div>

        <template v-else>
          <!-- Stage -->
          <div class="mb-6">
            <div
              class="mx-auto max-w-sm h-10
                rounded-b-[50%] stage-gradient
                flex items-center justify-center
                border-b-4 border-blue-400/50"
            >
              <span
                class="text-xs font-bold
                  tracking-[0.3em] text-blue-600
                  dark:text-blue-400 uppercase"
              >
                Stage
              </span>
            </div>
          </div>

          <!-- Seat rows -->
          <div class="space-y-2 overflow-x-auto p-4">
            <div
              v-for="row in sortedRows"
              :key="row"
              class="flex items-center gap-2 justify-center min-w-fit"
            >
              <span
                class="w-6 text-center text-xs
                  font-bold text-gray-400
                  dark:text-gray-500 shrink-0"
              >
                {{ row }}
              </span>
              <div class="flex gap-1">
                <SeatIcon
                  v-for="seat in filteredSeatsByRow.get(row)"
                  :key="seat.id"
                  :seat="seat"
                  :is-selected="seatsStore.selectedSeatId === seat.id"
                  :is-mine="false"
                  @click="handleSeatClick"
                />
              </div>
              <span
                class="w-6 text-center text-xs
                  font-bold text-gray-400
                  dark:text-gray-500 shrink-0"
              >
                {{ row }}
              </span>
            </div>
          </div>

          <!-- Legend -->
          <div
            class="mt-6 flex flex-wrap justify-center
              gap-4 text-xs text-gray-600 dark:text-gray-400"
          >
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded bg-amber-500" ></div>
              <span>VIP</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded bg-purple-500" ></div>
              <span>Premium</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded bg-blue-500" ></div>
              <span>Standard</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded bg-emerald-500" ></div>
              <span>Economy</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600 opacity-50" ></div>
              <span>Reserved</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600 opacity-30" ></div>
              <span>Confirmed</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Detail panel -->
      <div class="w-full xl:w-72 shrink-0">
        <div
          v-if="selectedSeat"
          class="bg-white dark:bg-gray-800 rounded-xl border
            border-gray-200 dark:border-gray-700
            p-5 sticky top-24"
        >
          <h3
            class="text-lg font-bold text-gray-900
              dark:text-white mb-3"
          >
            {{ selectedSeat.label }}
          </h3>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Row</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ selectedSeat.row }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Number</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ selectedSeat.number }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Category</span>
              <n-tag
                :type="
                  selectedSeat.category === 'VIP' ? 'warning'
                  : selectedSeat.category === 'PREMIUM' ? 'info'
                    : selectedSeat.category === 'STANDARD' ? 'primary'
                      : 'success'
                "
                size="small"
                round
              >
                {{ selectedSeat.category }}
              </n-tag>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Status</span>
              <n-tag
                :type="
                  selectedSeat.status === SeatStatus.AVAILABLE ? 'success'
                  : selectedSeat.status === SeatStatus.RESERVED ? 'warning'
                    : 'info'
                "
                size="small"
                round
              >
                {{ selectedSeat.status }}
              </n-tag>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Price</span>
              <span class="font-bold text-gray-900 dark:text-white">
                ${{ selectedSeat.price.toFixed(2) }}
              </span>
            </div>

            <!-- Reservation info -->
            <template v-if="reservationUser">
              <div
                class="border-t border-gray-200
                  dark:border-gray-700 pt-3 mt-3"
              >
                <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Reservation
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">
                    User ID
                  </span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ reservationUser.userId }}
                  </span>
                </div>
                <div
                  v-if="reservationUser.expiresAt"
                  class="flex justify-between mt-1"
                >
                  <span class="text-gray-500 dark:text-gray-400">
                    Expires
                  </span>
                  <span class="font-medium text-amber-600 dark:text-amber-400">
                    {{ new Date(reservationUser.expiresAt).toLocaleTimeString() }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div
          v-else
          class="rounded-xl border-2 border-dashed
            border-gray-300 dark:border-gray-700
            p-6 text-center"
        >
          <p class="text-sm text-gray-400 dark:text-gray-500">
            Click a seat to view details
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
