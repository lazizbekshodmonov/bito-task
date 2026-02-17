import type { ISeat } from "@/services/seats/seat.types";

export interface SeatDetailPanelProps {
  seat: ISeat;
  isMine: boolean;
}
