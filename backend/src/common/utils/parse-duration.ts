import { BadRequestException } from '@nestjs/common';

/**
 * Parses a human-readable duration string into milliseconds.
 *
 * @param duration - Duration string (e.g. "10s", "5m", "2h", "1d")
 * @returns The duration in milliseconds
 * @throws {BadRequestException} When the format is invalid
 */
export function parseDuration(duration: string): number {
  const regex = /^(\d+)([smhd])$/;
  const match = duration.match(regex);

  if (!match) {
    throw new BadRequestException(`Invalid duration format "${duration}". Use like: 10s, 5m, 2h, 1d`);
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  const multiplier: Record<string, number> = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  return value * multiplier[unit];
}
