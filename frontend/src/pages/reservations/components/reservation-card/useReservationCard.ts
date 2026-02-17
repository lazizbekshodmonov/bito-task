import { ref } from "vue";
import { confirmReservation, cancelReservation } from "@/services/reservations/reservation.service.ts";
import { handleError } from "@/utils/handleError.ts";
import { message } from "@/utils/discrete.ts";
import { useSeatsStore } from "@/stores/seats.store.ts";
import { SeatStatus } from "@/services/seats/seat.types.ts";
import type { AxiosError } from "axios";
import type { IBaseException } from "@/types/exception.ts";

const useReservationCard = () => {
  const queryClient = useQueryClient();
  const seatsStore = useSeatsStore();
  const loading = ref(false);

  const handleConfirm = async (reservationId: string, seatId: string) => {
    loading.value = true;

    const rollback = seatsStore.patchSeatLocally(seatId, { status: SeatStatus.CONFIRMED });

    try {
      await confirmReservation(reservationId);
      message?.success("Reservation confirmed!");
      await queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      await queryClient.invalidateQueries({ queryKey: ["seats"] });
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
      await queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      await queryClient.invalidateQueries({ queryKey: ["seats"] });
    } catch (error) {
      rollback();
      handleError(error as AxiosError<IBaseException>);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    handleConfirm,
    handleCancel,
  };
};

export default useReservationCard;
