import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './services/reservations.service';
import { ExpirationService } from './services/expiration.service';
import { ReservationRepository } from './repositories/reservation.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ExpirationService, ReservationRepository],
  exports: [ReservationsService, ReservationRepository],
})
export class ReservationsModule {}
