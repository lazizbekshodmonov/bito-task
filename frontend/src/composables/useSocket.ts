import { onMounted, onUnmounted } from "vue";
import { getSocket, disconnectSocket } from "@/plugins/socket.ts";
import { useSeatsStore } from "@/stores/seats.store.ts";
import { queryClient } from "@/utils/query-client.ts";

interface SeatUpdatePayload {
  seatId: string;
  label: string;
  status: string;
  expiresAt?: string;
}

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

    socket.on("seat:updated", (payload: SeatUpdatePayload) => {
      seatsStore.patchSeatFromSocket(payload.seatId, payload);
    });

    socket.on("seat:bulk-updated", (payloads: SeatUpdatePayload[]) => {
      for (const payload of payloads) {
        seatsStore.patchSeatFromSocket(payload.seatId, payload);
      }
    });
  });

  onUnmounted(() => {
    disconnectSocket();
  });
};
