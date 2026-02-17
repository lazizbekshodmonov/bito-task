import { getAllSeats } from "@/services/seats/seat.service.ts";
import { useSeatsStore } from "@/stores/seats.store.ts";
import { useSocket } from "@/composables/useSocket.ts";

const useDashboardPage = () => {
  const seatsStore = useSeatsStore();

  useSocket();

  const { isLoading } = useQuery({
    queryKey: ["seats"],
    queryFn: async () => {
      const seats = await getAllSeats();
      seatsStore.setSeats(seats);
      return seats;
    },
  });

  const stats = computed(() => seatsStore.stats);

  const statCards = computed(() => [
    {
      label: "Total Seats",
      value: stats.value.total,
      color: "bg-blue-500",
      icon: "M4 18v3h3v-3h10v3h3v-3h1a1 1 0 001-1V5a1 1 0 00-1-1H3a1 1 0 00-1 1v12a1 1 0 001 1h1zm2-6h12v5H6v-5z",
    },
    {
      label: "Available",
      value: stats.value.available,
      color: "bg-emerald-500",
      icon: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    },
    {
      label: "Reserved",
      value: stats.value.reserved,
      color: "bg-amber-500",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    },
    {
      label: "Confirmed",
      value: stats.value.confirmed,
      color: "bg-purple-500",
      icon: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
    },
  ]);

  const seatsByRow = computed(() => {
    const map = new Map<string, typeof seatsStore.seats>();
    for (const seat of seatsStore.seats) {
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
    return [...seatsByRow.value.keys()].sort();
  });

  const selectedSeat = computed(() => seatsStore.selectedSeat);

  const handleSeatClick = (seatId: string) => {
    seatsStore.selectSeat(seatsStore.selectedSeatId === seatId ? null : seatId);
  };

  return {
    isLoading,
    seatsStore,
    statCards,
    seatsByRow,
    sortedRows,
    selectedSeat,
    handleSeatClick,
  };
};

export default useDashboardPage;
