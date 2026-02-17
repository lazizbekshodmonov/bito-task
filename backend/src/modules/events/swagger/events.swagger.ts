import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function SeatUpdatedSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Event: seat:updated',
      description: `
**Namespace:** \`/seats\`
**Event:** \`seat:updated\`
**Direction:** Server → Client

Emitted when a seat status changes (reserve, confirm, cancel, expire).

**Payload:**
\`\`\`json
{
  "seatId": "uuid",
  "label": "A1",
  "status": "RESERVED | CONFIRMED | AVAILABLE",
  "expiresAt": "2025-01-01T00:02:00.000Z"
}
\`\`\`

**Connection:** \`io("ws://localhost:3000/seats")\`
`,
    }),
  );
}

export function SeatBulkUpdatedSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Event: seat:bulk-updated',
      description: `
**Namespace:** \`/seats\`
**Event:** \`seat:bulk-updated\`
**Direction:** Server → Client

Emitted when multiple seats expire at the same time (via cron job).

**Payload:**
\`\`\`json
[
  {
    "seatId": "uuid",
    "label": "A1",
    "status": "AVAILABLE"
  }
]
\`\`\`
`,
    }),
  );
}
