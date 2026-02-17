import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiGoneResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ReservationResponseDto } from '../dto/reservation-response.dto';

export function ReserveSwaggerDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Reserve a seat',
      description: `
Reserves a seat for the authenticated user for 2 minutes.
Uses SERIALIZABLE transaction with pessimistic lock to prevent double-booking.
Supports idempotency via \`Idempotency-Key\` header.
`,
    }),
    ApiHeader({
      name: 'Idempotency-Key',
      required: false,
      description: 'Unique key to prevent duplicate reservations',
    }),
    ApiCreatedResponse({
      type: ReservationResponseDto,
      description: 'Seat reserved successfully',
    }),
    ApiNotFoundResponse({ description: 'Seat not found' }),
    ApiConflictResponse({ description: 'Seat is not available' }),
  );
}

export function ConfirmSwaggerDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Confirm reservation',
      description: `
Confirms a RESERVED reservation before it expires.
Only the reservation owner can confirm.
If already confirmed, returns the reservation (idempotent).
`,
    }),
    ApiOkResponse({
      type: ReservationResponseDto,
      description: 'Reservation confirmed successfully',
    }),
    ApiNotFoundResponse({ description: 'Reservation not found' }),
    ApiForbiddenResponse({ description: 'Reservation belongs to another user' }),
    ApiConflictResponse({ description: 'Reservation cannot be confirmed' }),
    ApiGoneResponse({ description: 'Reservation has expired' }),
  );
}

export function CancelSwaggerDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Cancel reservation',
      description: `
Cancels a reservation and releases the seat.
Only the reservation owner can cancel.
If already cancelled or expired, returns the reservation (idempotent).
`,
    }),
    ApiOkResponse({
      type: ReservationResponseDto,
      description: 'Reservation cancelled successfully',
    }),
    ApiNotFoundResponse({ description: 'Reservation not found' }),
    ApiForbiddenResponse({ description: 'Reservation belongs to another user' }),
  );
}

export function FindMyReservationsSwaggerDoc() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get my reservations',
      description: 'Returns all reservations of the authenticated user, ordered by creation date (newest first).',
    }),
    ApiOkResponse({
      type: [ReservationResponseDto],
      description: 'List of user reservations with seat details',
    }),
  );
}
