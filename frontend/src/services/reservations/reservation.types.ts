export const enum ReservationStatus {
  RESERVED = "RESERVED",
  CONFIRMED = "CONFIRMED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface IReservationSeat {
  id: string;
  label: string;
  row: string;
  number: number;
  category: string;
  price: number;
  status: string;
}

export interface IReservation {
  id: string;
  seatId: string;
  userId: number;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  seat: IReservationSeat;
}
