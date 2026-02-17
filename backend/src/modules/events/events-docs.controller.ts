import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeatUpdatedSwaggerDoc, SeatBulkUpdatedSwaggerDoc } from './swagger/events.swagger';

@ApiTags('WebSocket Events (docs only)')
@Controller('ws-docs')
export class EventsDocsController {
  @Get('seat-updated')
  @SeatUpdatedSwaggerDoc()
  seatUpdated(): string {
    return 'This endpoint is for documentation only';
  }

  @Get('seat-bulk-updated')
  @SeatBulkUpdatedSwaggerDoc()
  seatBulkUpdated(): string {
    return 'This endpoint is for documentation only';
  }
}
