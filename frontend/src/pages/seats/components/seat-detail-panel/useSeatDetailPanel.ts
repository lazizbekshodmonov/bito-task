import { ref } from "vue";
import { reserveSeat, confirmReservation, cancelReservation } from "@/services/reservations/reservation.service.ts";
import { handleError } from "@/utils/handleError.ts";
import { message } from "@/utils/discrete.ts";
import { useSeatsStore } from "@/stores/seats.store.ts";
import { SeatStatus } from "@/services/seats/seat.types.ts";
import type { AxiosError } from "axios";
import type { IBaseException } from "@/types/exception.ts";

const useSeatDetailPanel = () => {
  const queryClient = useQueryClient();
  const seatsStore = useSeatsStore();
  const loading = ref(false);

  let reserveKey = "";

  const handleReserve = async (seatId: string) => {
    if (loading.value) return;
    if (!reserveKey) reserveKey = crypto.randomUUID();
    loading.value = true;

    const rollback = seatsStore.patchSeatLocally(seatId, { status: SeatStatus.RESERVED });

    try {
      await reserveSeat(seatId, reserveKey);
      message?.success("Seat reserved! Complete payment before timer expires.");
      reserveKey = "";
      await queryClient.invalidateQueries({ queryKey: ["seats"] });
      await queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    } catch (error) {
      rollback();
      handleError(error as AxiosError<IBaseException>);
    } finally {
      loading.value = false;
    }
  };

  const handleConfirm = async (reservationId: string, seatId: string) => {
    loading.value = true;

    const rollback = seatsStore.patchSeatLocally(seatId, { status: SeatStatus.CONFIRMED });

    try {
      await confirmReservation(reservationId);
      message?.success("Reservation confirmed!");
      await queryClient.invalidateQueries({ queryKey: ["seats"] });
      await queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    } catch (error) {
      rollback();
      handleError(error as AxiosError<IBaseException>);
    } finally {
      loading.value = false;
    }
  };

  const handleCancel = async (reservationId: string, seatId: string) => {
    loading.value = true;

    const rollback = seatsStore.patchSeatLocally(seatId, { status: SeatStatus.AVAILABLE });

    try {
      await cancelReservation(reservationId);
      message?.success("Reservation cancelled.");
      await queryClient.invalidateQueries({ queryKey: ["seats"] });
      await queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    } catch (error) {
      rollback();
      handleError(error as AxiosError<IBaseException>);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    handleReserve,
    handleConfirm,
    handleCancel,
  };
};

export default useSeatDetailPanel;
