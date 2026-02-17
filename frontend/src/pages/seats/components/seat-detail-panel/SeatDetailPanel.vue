<script setup lang="ts">
  import type { SeatDetailPanelProps } from "./seat-detail-panel.types";
  import useSeatDetailPanel from "./useSeatDetailPanel";
  import { SeatStatus, SeatCategory } from "@/services/seats/seat.types";
  import { useCountdown } from "@/composables/useCountdown.ts";

  const props = defineProps<SeatDetailPanelProps>();
  const { loading, handleReserve, handleConfirm, handleCancel } = useSeatDetailPanel();

  const activeReservation = computed(() => {
    return props.seat.reservations?.find(
      (r) => r.status === "RESERVED" || r.status === "CONFIRMED"
    ) || null;
  });

  const { formatted, isExpired } = useCountdown(
    () => activeReservation.value?.expiresAt ?? null
  );

  const categoryBadgeClass = computed(() => {
    switch (props.seat.category) {
      case SeatCategory.VIP:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case SeatCategory.PREMIUM:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case SeatCategory.STANDARD:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case SeatCategory.ECONOMY:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  });
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl
      shadow-xl border border-gray-200
      dark:border-gray-700 p-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ seat.label }}</h3>
      <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="categoryBadgeClass">
        {{ seat.category }}
      </span>
    </div>

    <!-- Price -->
    <div class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
      ${{ seat.price.toFixed(2) }}
    </div>

    <!-- Status info -->
    <div class="mb-6">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Row {{ seat.row }}, Seat {{ seat.number }}
      </div>
    </div>

    <!-- AVAILABLE -->
    <template v-if="seat.status === SeatStatus.AVAILABLE">
      <n-button
        type="primary"
        block
        size="large"
        :loading="loading"
        @click="handleReserve(seat.id)"
      >
        Reserve This Seat
      </n-button>
    </template>

    <!-- RESERVED (mine) -->
    <template v-else-if="seat.status === SeatStatus.RESERVED && isMine">
      <div class="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
        <div class="text-sm text-amber-600 dark:text-amber-400 mb-1">Time remaining</div>
        <div class="text-2xl font-mono font-bold text-amber-700 dark:text-amber-300">
          {{ isExpired ? "Expired" : formatted }}
        </div>
      </div>
      <div class="flex gap-3">
        <n-button
          type="primary"
          class="flex-1"
          size="large"
          :loading="loading"
          :disabled="isExpired"
          @click="activeReservation && handleConfirm(activeReservation.id, seat.id)"
        >
          Confirm
        </n-button>
        <n-button
          type="error"
          ghost
          class="flex-1"
          size="large"
          :loading="loading"
          @click="activeReservation && handleCancel(activeReservation.id, seat.id)"
        >
          Cancel
        </n-button>
      </div>
    </template>

    <!-- RESERVED (other) -->
    <template v-else-if="seat.status === SeatStatus.RESERVED && !isMine">
      <div class="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">This seat is being reserved</p>
      </div>
    </template>

    <!-- CONFIRMED -->
    <template v-else-if="seat.status === SeatStatus.CONFIRMED">
      <div class="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-center">
        <div class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7
                3.24 7 6v2H6c-1.1 0-2 .9-2
                2v10c0 1.1.9 2 2 2h12c1.1 0
                2-.9 2-2V10c0-1.1-.9-2-2-2zm-6
                9c-1.1 0-2-.9-2-2s.9-2 2-2 2
                .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71
                1.39-3.1 3.1-3.1 1.71 0 3.1
                1.39 3.1 3.1v2z"
            />
          </svg>
          <p class="text-sm text-gray-500 dark:text-gray-400">Seat taken</p>
        </div>
      </div>
    </template>
  </div>
</template>
