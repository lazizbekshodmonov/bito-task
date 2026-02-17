import { onMounted, onUnmounted } from "vue";
import { getSocket, disconnectSocket } from "@/plugins/socket.ts";
import { useSeatsStore } from "@/stores/seats.store.ts";
import { queryClient } from "@/utils/query-client.ts";
import type { ISeat } from "@/services/seats/seat.types";

export const useSocket = () => {
  const seatsStore = useSeatsStore();

  onMounted(() => {
    const socket = getSocket();
    socket.connect();

    let isFirstConnect = true;

    socket.on("connect", () => {
      if (!isFirstConnect) {
        queryClient.invalidateQueries({ queryKey: ["seats"] });
        queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      }
      isFirstConnect = false;
    });

    socket.on("seat:updated", (seat: ISeat) => {
      seatsStore.updateSeat(seat);
    });

    socket.on("seat:bulk-updated", (seats: ISeat[]) => {
      seatsStore.bulkUpdateSeats(seats);
    });
  });

  onUnmounted(() => {
    disconnectSocket();
  });
};
