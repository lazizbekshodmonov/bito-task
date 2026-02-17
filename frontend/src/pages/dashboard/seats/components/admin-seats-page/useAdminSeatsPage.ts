import { ref } from "vue";
import { getAllSeats } from "@/services/seats/seat.service.ts";
import { SeatCategory, SeatStatus } from "@/services/seats/seat.types";
import { useSeatsStore } from "@/stores/seats.store.ts";
import { useSocket } from "@/composables/useSocket.ts";

const useAdminSeatsPage = () => {
  const seatsStore = useSeatsStore();

  useSocket();

  const categoryFilter = ref<string>("ALL");
  const statusFilter = ref<string>("ALL");

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

  const statuses = [
    { key: "ALL", label: "All" },
    { key: SeatStatus.AVAILABLE, label: "Available" },
    { key: SeatStatus.RESERVED, label: "Reserved" },
    { key: SeatStatus.CONFIRMED, label: "Confirmed" },
  ];

  const filteredSeatsByRow = computed(() => {
    const map = new Map<string, typeof seatsStore.seats>();
    for (const seat of seatsStore.seats) {
      if (categoryFilter.value !== "ALL" && seat.category !== categoryFilter.value) continue;
      if (statusFilter.value !== "ALL" && seat.status !== statusFilter.value) continue;
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

  const stats = computed(() => seatsStore.stats);
  const selectedSeat = computed(() => seatsStore.selectedSeat);

  const handleSeatClick = (seatId: string) => {
    seatsStore.selectSeat(seatsStore.selectedSeatId === seatId ? null : seatId);
  };

  return {
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
  };
};

export default useAdminSeatsPage;
