import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, EntityManager } from 'typeorm';
import { ReservationEntity } from '../entities/reservation.entity';
import { SeatEntity } from '../../seats/entities/seat.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { SeatStatus } from '../../seats/enums/seat-status.enum';
import { EventsGateway } from '../../events/events.gateway';
import { SeatUpdatePayload } from '../../events/events.gateway';
import { ReservationRepository } from '../repositories/reservation.repository';

@Injectable()
export class ExpirationService {
  private readonly logger = new Logger('CRON JOB');

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventsGateway: EventsGateway,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleExpiredReservations(): Promise<void> {
    const expiredReservations = await this.reservationRepository.findExpiredReserved();

    if (expiredReservations.length === 0) return;

    this.logger.log(`Found ${expiredReservations.length} expired reservations`);

    const updates: SeatUpdatePayload[] = [];

    for (const reservation of expiredReservations) {
      try {
        await this.dataSource.transaction('SERIALIZABLE', async (manager: EntityManager) => {
          const lockedReservation = await manager
            .createQueryBuilder(ReservationEntity, 'reservation')
            .setLock('pessimistic_write')
            .where('reservation.id = :id', { id: reservation.id })
            .getOne();

          if (!lockedReservation || lockedReservation.status !== ReservationStatus.RESERVED) {
            return;
          }

          lockedReservation.status = ReservationStatus.EXPIRED;
          await manager.save(ReservationEntity, lockedReservation);

          const seat = await manager.findOne(SeatEntity, {
            where: { id: lockedReservation.seatId },
          });

          if (seat && seat.status === SeatStatus.RESERVED) {
            seat.status = SeatStatus.AVAILABLE;
            await manager.save(SeatEntity, seat);
            updates.push({
              seatId: seat.id,
              label: seat.label,
              status: seat.status,
            });
          }
        });
      } catch (error) {
        this.logger.error(`Failed to expire reservation ${reservation.id}`, (error as Error).stack);
      }
    }

    if (updates.length > 0) {
      this.eventsGateway.emitBulkSeatUpdate(updates);
    }
  }

}
