import { ref } from "vue";
import { getMyReservations } from "@/services/reservations/reservation.service.ts";
import { ReservationStatus } from "@/services/reservations/reservation.types";

const useReservationsPage = () => {
  const activeTab = ref("ALL");

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: getMyReservations,
  });

  const filteredReservations = computed(() => {
    const list = reservations.value || [];
    if (activeTab.value === "ALL") return list;
    if (activeTab.value === "ACTIVE") {
      return list.filter(
        (r) => r.status === ReservationStatus.RESERVED || r.status === ReservationStatus.CONFIRMED
      );
    }
    if (activeTab.value === "PAST") {
      return list.filter(
        (r) => r.status === ReservationStatus.EXPIRED || r.status === ReservationStatus.CANCELLED
      );
    }
    return list;
  });

  const tabs = [
    { key: "ALL", label: "All" },
    { key: "ACTIVE", label: "Active" },
    { key: "PAST", label: "Past" },
  ];

  const totalCount = computed(() => reservations.value?.length || 0);

  return {
    activeTab,
    tabs,
    reservations: filteredReservations,
    totalCount,
    isLoading,
  };
};

export default useReservationsPage;
