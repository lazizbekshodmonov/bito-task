import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ISeat } from "@/services/seats/seat.types";
import { SeatStatus } from "@/services/seats/seat.types";

export const useSeatsStore = defineStore("seats", () => {
  const seats = ref<ISeat[]>([]);
  const selectedSeatId = ref<string | null>(null);

  const seatsByRow = computed(() => {
    const map = new Map<string, ISeat[]>();
    for (const seat of seats.value) {
      const row = seat.row;
      if (!map.has(row)) map.set(row, []);
      map.get(row)!.push(seat);
    }
    for (const [, rowSeats] of map) {
      rowSeats.sort((a, b) => a.number - b.number);
    }
    return map;
  });

  const selectedSeat = computed(() => {
    if (!selectedSeatId.value) return null;
    return seats.value.find((s) => s.id === selectedSeatId.value) || null;
  });

  const stats = computed(() => {
    const total = seats.value.length;
    const available = seats.value.filter((s) => s.status === SeatStatus.AVAILABLE).length;
    const reserved = seats.value.filter((s) => s.status === SeatStatus.RESERVED).length;
    const confirmed = seats.value.filter((s) => s.status === SeatStatus.CONFIRMED).length;
    return { total, available, reserved, confirmed };
  });

  const setSeats = (newSeats: ISeat[]) => {
    seats.value = newSeats;
  };

  const updateSeat = (updatedSeat: ISeat) => {
    const index = seats.value.findIndex((s) => s.id === updatedSeat.id);
    if (index !== -1) {
      seats.value[index] = updatedSeat;
    }
  };

  const bulkUpdateSeats = (updatedSeats: ISeat[]) => {
    for (const updated of updatedSeats) {
      updateSeat(updated);
    }
  };

  const patchSeatLocally = (seatId: string, patch: Partial<ISeat>) => {
    const index = seats.value.findIndex((s) => s.id === seatId);
    if (index === -1) return () => {};

    const oldSeat = { ...seats.value[index] };
    seats.value[index] = { ...oldSeat, ...patch };

    return () => {
      const rollbackIndex = seats.value.findIndex((s) => s.id === seatId);
      if (rollbackIndex !== -1) {
        seats.value[rollbackIndex] = oldSeat;
      }
    };
  };

  const patchSeatFromSocket = (seatId: string, patch: { status: string }) => {
    const index = seats.value.findIndex((s) => s.id === seatId);
    if (index === -1) return;

    seats.value[index] = { ...seats.value[index], status: patch.status as ISeat["status"] };
  };

  const selectSeat = (id: string | null) => {
    selectedSeatId.value = id;
  };

  return {
    seats,
    selectedSeatId,
    seatsByRow,
    selectedSeat,
    stats,
    setSeats,
    updateSeat,
    bulkUpdateSeats,
    patchSeatLocally,
    patchSeatFromSocket,
    selectSeat,
  };
});
