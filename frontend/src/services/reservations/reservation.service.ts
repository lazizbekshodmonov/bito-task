import httpClient from "@/utils/http-client.ts";
import type { IReservation } from "./reservation.types";

export const reserveSeat = async (seatId: string, idempotencyKey: string) => {
  const response = await httpClient<IReservation>({
    method: "POST",
    url: "reservations/reserve",
    data: { seatId },
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return response.data;
};

export const confirmReservation = async (reservationId: string) => {
  const response = await httpClient<IReservation>({
    method: "POST",
    url: "reservations/confirm",
    data: { reservationId },
  });
  return response.data;
};

export const cancelReservation = async (reservationId: string) => {
  const response = await httpClient<IReservation>({
    method: "POST",
    url: "reservations/cancel",
    data: { reservationId },
  });
  return response.data;
};

export const getMyReservations = async () => {
  const response = await httpClient<IReservation[]>({
    method: "GET",
    url: "reservations/my",
  });
  return response.data;
};
