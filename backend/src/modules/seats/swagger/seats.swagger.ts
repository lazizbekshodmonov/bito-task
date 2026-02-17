import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SeatResponseDto } from '../dto/seat-response.dto';

export function SeatFindAllSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all seats',
      description: `
Returns all seats with their active reservations.
Active reservations are those with status RESERVED or CONFIRMED and not yet expired.
No authentication required.
`,
    }),
    ApiOkResponse({
      type: [SeatResponseDto],
      description: 'List of all seats with active reservations',
    }),
  );
}
