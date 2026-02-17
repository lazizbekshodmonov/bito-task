import type { Request } from 'express';

/**
 * Extracts the client IP address from the request,
 * checking X-Forwarded-For header first then falling back to socket address.
 *
 * @param req - The Express request object
 * @returns The client IP address string
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string' && xForwardedFor.length > 0) {
    return xForwardedFor.split(',')[0].trim();
  }

  const ip = req.socket.remoteAddress ?? '';
  return ip.replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1') || 'unknown';
}
