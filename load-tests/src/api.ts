import axios, { AxiosError, AxiosResponse } from 'axios';
import { API } from './config.js';

const client = axios.create({
  baseURL: API,
  timeout: 30_000,
  validateStatus: () => true, // never throw on HTTP status
});

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Seat {
  id: string;
  label: string;
  row: string;
  number: number;
  status: 'AVAILABLE' | 'RESERVED' | 'CONFIRMED';
  category: string;
  price: number;
  reservations?: Reservation[];
}

export interface Reservation {
  id: string;
  seatId: string;
  userId: number;
  status: 'RESERVED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  idempotencyKey: string | null;
  createdAt: string;
  updatedAt: string;
  seat?: Seat;
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
}

// ─── Auth ────────────────────────────────────────────────────

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<ApiResponse> {
  const res = await client.post('/auth/register', { name, email, password });
  return { status: res.status, data: res.data };
}

export async function login(
  email: string,
  password: string,
): Promise<ApiResponse<AuthTokens>> {
  const res = await client.post('/auth/login', { email, password });
  return { status: res.status, data: res.data };
}

// ─── Seats ───────────────────────────────────────────────────

export async function getSeats(token: string): Promise<ApiResponse<Seat[]>> {
  const res = await client.get('/seats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, data: res.data };
}

// ─── Reservations ────────────────────────────────────────────

export async function reserve(
  token: string,
  seatId: string,
  idempotencyKey?: string,
): Promise<ApiResponse<Reservation>> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  const res = await client.post('/reservations/reserve', { seatId }, { headers });
  return { status: res.status, data: res.data };
}

export async function confirm(
  token: string,
  reservationId: string,
): Promise<ApiResponse<Reservation>> {
  const res = await client.post(
    '/reservations/confirm',
    { reservationId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return { status: res.status, data: res.data };
}

export async function cancel(
  token: string,
  reservationId: string,
): Promise<ApiResponse<Reservation>> {
  const res = await client.post(
    '/reservations/cancel',
    { reservationId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return { status: res.status, data: res.data };
}

export async function getMyReservations(
  token: string,
): Promise<ApiResponse<Reservation[]>> {
  const res = await client.get('/reservations/my', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status, data: res.data };
}

// ─── Helpers ─────────────────────────────────────────────────

export async function registerAndLogin(
  name: string,
  email: string,
  password: string,
): Promise<string> {
  const regRes = await register(name, email, password);
  if (regRes.status !== 201 && regRes.status !== 409) {
    throw new Error(`Register failed for ${email}: ${regRes.status} ${JSON.stringify(regRes.data)}`);
  }
  const loginRes = await login(email, password);
  if (loginRes.status !== 200 && loginRes.status !== 201) {
    throw new Error(`Login failed for ${email}: ${loginRes.status} ${JSON.stringify(loginRes.data)}`);
  }
  return loginRes.data.accessToken;
}

export function findAvailableSeats(seats: Seat[]): Seat[] {
  return seats.filter((s) => s.status === 'AVAILABLE');
}
