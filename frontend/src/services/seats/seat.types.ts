export const enum SeatCategory {
  VIP = "VIP",
  PREMIUM = "PREMIUM",
  STANDARD = "STANDARD",
  ECONOMY = "ECONOMY",
}

export const enum SeatStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  CONFIRMED = "CONFIRMED",
}

export interface ISeatReservation {
  id: string;
  userId: number;
  status: string;
  expiresAt: string | null;
}

export interface ISeat {
  id: string;
  label: string;
  row: string;
  number: number;
  category: SeatCategory;
  status: SeatStatus;
  price: number;
  createdAt: string;
  updatedAt: string;
  reservations: ISeatReservation[];
}
