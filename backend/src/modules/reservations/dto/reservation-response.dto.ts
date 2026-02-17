import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../enums/reservation-status.enum';

export class ReservationResponseDto {
  @ApiProperty({ description: 'Reservation ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'Seat ID', example: '660e8400-e29b-41d4-a716-446655440000' })
  seatId: string;

  @ApiProperty({ description: 'User ID', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Reservation status', enum: ReservationStatus, example: ReservationStatus.RESERVED })
  status: ReservationStatus;

  @ApiProperty({ description: 'Expiration time', example: '2025-01-01T00:02:00.000Z' })
  expiresAt: Date;

  @ApiPropertyOptional({ description: 'Idempotency key', example: 'unique-key-123' })
  idempotencyKey: string | null;

  @ApiProperty({ description: 'Created at', example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2025-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Seat details' })
  seat?: unknown;
}
