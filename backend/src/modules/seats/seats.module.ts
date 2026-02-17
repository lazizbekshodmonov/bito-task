import { Module } from '@nestjs/common';
import { SeatsController } from './seats.controller';
import { SeatsService } from './services/seats.service';
import { SeatRepository } from './repositories/seat.repository';
import { SeatsSeederService } from './services/seats-seeder.service';

@Module({
  controllers: [SeatsController],
  providers: [SeatsService, SeatRepository, SeatsSeederService],
  exports: [SeatsService, SeatRepository],
})
export class SeatsModule {}
