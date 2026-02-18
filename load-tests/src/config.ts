export const BASE_URL = process.env.BASE_URL || 'https://dsrs.powerapp.uz';
export const API = `${BASE_URL}/api/v1`;

export const RESERVATION_TTL_MS = 120_000; // 2 minutes
export const EXPIRE_WAIT_MS = 130_000;     // TTL + 10s buffer
