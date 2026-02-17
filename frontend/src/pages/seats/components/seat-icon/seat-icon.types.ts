import type { ISeat } from "@/services/seats/seat.types";

export interface SeatIconProps {
  seat: ISeat;
  isSelected: boolean;
  isMine: boolean;
}
