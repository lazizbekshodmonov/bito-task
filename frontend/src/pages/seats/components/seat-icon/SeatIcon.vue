<script setup lang="ts">
  import type { SeatIconProps } from "./seat-icon.types";
  import { SeatCategory, SeatStatus } from "@/services/seats/seat.types";

  const props = defineProps<SeatIconProps>();
  const emit = defineEmits<{ click: [id: string] }>();

  const categoryColor = computed(() => {
    switch (props.seat.category) {
      case SeatCategory.VIP:
        return "#F59E0B";
      case SeatCategory.PREMIUM:
        return "#8B5CF6";
      case SeatCategory.STANDARD:
        return "#3B82F6";
      case SeatCategory.ECONOMY:
        return "#10B981";
      default:
        return "#6B7280";
    }
  });

  const seatOpacity = computed(() => {
    if (props.seat.status === SeatStatus.CONFIRMED) return 0.3;
    if (props.seat.status === SeatStatus.RESERVED && !props.isMine) return 0.5;
    return 1;
  });

  const isReservedByOther = computed(
    () => props.seat.status === SeatStatus.RESERVED && !props.isMine
  );

  const isConfirmed = computed(() => props.seat.status === SeatStatus.CONFIRMED);

  const cursorClass = computed(() => {
    if (props.seat.status === SeatStatus.AVAILABLE || props.isMine) return "cursor-pointer";
    return "cursor-not-allowed";
  });
</script>

<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <div
        class="relative seat-hover"
        :class="[
          cursorClass,
          { 'seat-reserved-pulse': isReservedByOther },
          isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 rounded-md' : '',
        ]"
        @click="emit('click', seat.id)"
      >
        <svg
          width="40"
          height="44"
          viewBox="0 0 40 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :opacity="seatOpacity"
        >
          <!-- Backrest -->
          <path
            d="M6 4C6 2 8 0 10 0H30C32 0 34 2 34 4V18H6V4Z"
            :fill="categoryColor"
            :opacity="0.9"
          />
          <!-- Cushion -->
          <rect
            x="4"
            y="18"
            width="32"
            height="14"
            rx="3"
            :fill="categoryColor"
          />
          <!-- Left armrest -->
          <rect
            x="0"
            y="14"
            width="5"
            height="22"
            rx="2"
            :fill="categoryColor"
            :opacity="0.7"
          />
          <!-- Right armrest -->
          <rect
            x="35"
            y="14"
            width="5"
            height="22"
            rx="2"
            :fill="categoryColor"
            :opacity="0.7"
          />
          <!-- Legs -->
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

        <!-- Label on backrest -->
        <div
          class="absolute top-[3px] inset-x-0
            text-center text-[8px] font-bold
            text-white leading-none"
          style="text-shadow: 0 1px 2px rgba(0,0,0,0.5)"
        >
          {{ seat.label }}
        </div>

        <!-- Lock icon for confirmed (over label) -->
        <div
          v-if="isConfirmed"
          class="absolute inset-0 flex items-center
            justify-center"
        >
          <svg
            class="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
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
        </div>
      </div>
    </template>
    <div class="text-center text-xs">
      <div class="font-bold">{{ seat.label }}</div>
      <div>{{ seat.category }} - ${{ seat.price }}</div>
      <div class="capitalize">{{ seat.status.toLowerCase() }}</div>
    </div>
  </n-tooltip>
</template>
