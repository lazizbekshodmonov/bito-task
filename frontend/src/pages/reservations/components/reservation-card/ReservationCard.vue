<script setup lang="ts">
  import type { ReservationCardProps } from "./reservation-card.types";
  import useReservationCard from "./useReservationCard";
  import { ReservationStatus } from "@/services/reservations/reservation.types";
  import { useCountdown } from "@/composables/useCountdown.ts";

  const props = defineProps<ReservationCardProps>();
  const { loading, handleConfirm, handleCancel } = useReservationCard();

  const { formatted, isExpired } = useCountdown(props.reservation.expiresAt);

  const categoryColor = computed(() => {
    switch (props.reservation.seat?.category) {
      case "VIP":
        return "#F59E0B";
      case "PREMIUM":
        return "#8B5CF6";
      case "STANDARD":
        return "#3B82F6";
      case "ECONOMY":
        return "#10B981";
      default:
        return "#6B7280";
    }
  });

  const statusConfig = computed(() => {
    switch (props.reservation.status) {
      case ReservationStatus.RESERVED:
        return { label: "Reserved", class: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
      case ReservationStatus.CONFIRMED:
        return { label: "Confirmed", class: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" };
      case ReservationStatus.EXPIRED:
        return { label: "Expired", class: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" };
      case ReservationStatus.CANCELLED:
        return { label: "Cancelled", class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" };
      default:
        return { label: props.reservation.status, class: "bg-gray-100 text-gray-600" };
    }
  });

  const isActive = computed(
    () => props.reservation.status === ReservationStatus.RESERVED || props.reservation.status === ReservationStatus.CONFIRMED
  );
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl
      border border-gray-200
      dark:border-gray-700 p-4 flex flex-col
      sm:flex-row items-start sm:items-center
      gap-4 transition-opacity"
    :class="{ 'opacity-60': !isActive }"
  >
    <!-- Seat icon -->
    <div class="shrink-0">
      <svg
        width="48"
        height="52"
        viewBox="0 0 40 44"
        fill="none"
      >
        <path
          d="M6 4C6 2 8 0 10 0H30C32 0
            34 2 34 4V18H6V4Z"
          :fill="categoryColor"
          :opacity="0.9"
        />
        <rect
          x="4"
          y="18"
          width="32"
          height="14"
          rx="3"
          :fill="categoryColor"
        />
        <rect
          x="0"
          y="14"
          width="5"
          height="22"
          rx="2"
          :fill="categoryColor"
          :opacity="0.7"
        />
        <rect
          x="35"
          y="14"
          width="5"
          height="22"
          rx="2"
          :fill="categoryColor"
          :opacity="0.7"
        />
        <rect
          x="8"
          y="34"
          width="3"
          height="10"
          rx="1"
          :fill="categoryColor"
          :opacity="0.5"
        />
        <rect
          x="29"
          y="34"
          width="3"
          height="10"
          rx="1"
          :fill="categoryColor"
          :opacity="0.5"
        />
      </svg>
      <div class="text-center text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
        {{ reservation.seat?.label }}
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="px-2 py-0.5 rounded text-xs font-semibold" :class="statusConfig.class">
          {{ statusConfig.label }}
        </span>
        <span
          class="text-xs text-gray-500
            dark:text-gray-400 px-2 py-0.5
            rounded bg-gray-100 dark:bg-gray-700"
        >
          {{ reservation.seat?.category }}
        </span>
      </div>
      <div class="text-lg font-bold text-gray-900 dark:text-white mt-1">
        ${{ reservation.seat?.price?.toFixed(2) }}
      </div>
      <div class="text-xs text-gray-400 dark:text-gray-500">
        Row {{ reservation.seat?.row }}, Seat {{ reservation.seat?.number }}
      </div>
    </div>

    <!-- Actions -->
    <div class="shrink-0 flex items-center gap-3">
      <template v-if="reservation.status === ReservationStatus.RESERVED">
        <div class="text-center mr-2">
          <div class="text-xs text-amber-600 dark:text-amber-400">Expires in</div>
          <div class="text-lg font-mono font-bold text-amber-700 dark:text-amber-300">
            {{ isExpired ? "Expired" : formatted }}
          </div>
        </div>
        <n-button
          type="primary"
          size="small"
          :loading="loading"
          :disabled="isExpired"
          @click="handleConfirm(reservation.id, reservation.seatId)"
        >
          Confirm
        </n-button>
        <n-button
          type="error"
          ghost
          size="small"
          :loading="loading"
          @click="handleCancel(reservation.id, reservation.seatId)"
        >
          Cancel
        </n-button>
      </template>

      <template v-else-if="reservation.status === ReservationStatus.CONFIRMED">
        <div class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span class="text-sm font-medium">Confirmed</span>
        </div>
      </template>
    </div>
  </div>
</template>
