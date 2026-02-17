import { Request } from 'express';

/**
 * Extracts the locale from the Accept-Language header of the request.
 *
 * @param req - The Express request object
 * @returns The detected locale, defaults to 'uz'
 */
export function getLocaleFromRequest(req?: Request): 'uz' | 'ru' | 'en' | 'cyr' {
  const header = req?.headers['accept-language'];
  if (!header) return 'uz';
  if (header.startsWith('uz')) return 'uz';
  if (header.startsWith('ru')) return 'ru';
  if (header.startsWith('en')) return 'en';
  if (header.startsWith('cyr')) return 'cyr';
  return 'uz';
}
