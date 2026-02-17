import { ref } from "vue";
import { getAllSeats } from "@/services/seats/seat.service.ts";
import { SeatCategory } from "@/services/seats/seat.types";
import { useSeatsStore } from "@/stores/seats.store.ts";
import { useSocket } from "@/composables/useSocket.ts";

const useSeatsPage = () => {
  const seatsStore = useSeatsStore();
  const authStore = useAuthStore();

  useSocket();

  const activeFilter = ref<string>("ALL");

  const { isLoading } = useQuery({
    queryKey: ["seats"],
    queryFn: async () => {
      const seats = await getAllSeats();
      seatsStore.setSeats(seats);
      return seats;
    },
  });

  const categories = [
    { key: "ALL", label: "All" },
    { key: SeatCategory.VIP, label: "VIP" },
    { key: SeatCategory.PREMIUM, label: "Premium" },
    { key: SeatCategory.STANDARD, label: "Standard" },
    { key: SeatCategory.ECONOMY, label: "Economy" },
  ];

  const filteredSeatsByRow = computed(() => {
    const map = new Map<string, typeof seatsStore.seats>();
    for (const seat of seatsStore.seats) {
      if (activeFilter.value !== "ALL" && seat.category !== activeFilter.value) continue;
      const row = seat.row;
      if (!map.has(row)) map.set(row, []);
      map.get(row)!.push(seat);
    }
    for (const [, rowSeats] of map) {
      rowSeats.sort((a, b) => a.number - b.number);
    }
    return map;
  });

  const sortedRows = computed(() => {
    return [...filteredSeatsByRow.value.keys()].sort();
  });

  const selectedSeat = computed(() => seatsStore.selectedSeat);
  const userId = computed(() => authStore.user?.id);

  const isMySeat = (reservations: { userId: number; status: string }[] | undefined) => {
    if (!reservations?.length || !userId.value) return false;
    return reservations.some(
      (r) => r.userId === userId.value && (r.status === "RESERVED" || r.status === "CONFIRMED")
    );
  };

  const handleSeatClick = (seatId: string) => {
    seatsStore.selectSeat(seatsStore.selectedSeatId === seatId ? null : seatId);
  };

  return {
    isLoading,
    seatsStore,
    activeFilter,
    categories,
    filteredSeatsByRow,
    sortedRows,
    selectedSeat,
    isMySeat,
    handleSeatClick,
  };
};

export default useSeatsPage;
