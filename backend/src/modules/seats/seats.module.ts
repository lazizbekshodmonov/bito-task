import { Module } from '@nestjs/common';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { SeatRepository } from './repositories/seat.repository';

@Module({
  controllers: [SeatsController],
  providers: [SeatsService, SeatRepository],
  exports: [SeatsService, SeatRepository],
})
export class SeatsModule {}