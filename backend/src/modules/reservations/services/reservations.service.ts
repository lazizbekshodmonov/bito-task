import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SeatEntity } from '../../seats/entities/seat.entity';
import { ReservationEntity } from '../entities/reservation.entity';
import { SeatStatus } from '../../seats/enums/seat-status.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { ReservationError } from '../enums/reservation-error.enum';
import { EventsGateway } from '../../events/events.gateway';
import { AppException } from '../../../common/exceptions/app-exception';
import { ReservationRepository } from '../repositories/reservation.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventsGateway: EventsGateway,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async reserveSeat(seatId: string, userId: number, idempotencyKey?: string): Promise<ReservationEntity> {
    return this.dataSource.transaction('SERIALIZABLE', async (manager: EntityManager) => {
      const seat = await manager
        .createQueryBuilder(SeatEntity, 'seat')
        .setLock('pessimistic_write')
        .where('seat.id = :seatId', { seatId })
        .getOne();

      if (!seat) {
        throw new AppException(ReservationError.SEAT_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Lazy expiration: agar seat RESERVED lekin aktiv reservation muddati tugagan
      if (seat.status === SeatStatus.RESERVED) {
        const activeReservation = await manager.findOne(ReservationEntity, {
          where: { seatId, status: ReservationStatus.RESERVED },
        });

        if (activeReservation && activeReservation.expiresAt < new Date()) {
          activeReservation.status = ReservationStatus.EXPIRED;
          await manager.save(ReservationEntity, activeReservation);
          seat.status = SeatStatus.AVAILABLE;
          await manager.save(SeatEntity, seat);
        }
      }

      if (seat.status !== SeatStatus.AVAILABLE) {
        throw new AppException(ReservationError.SEAT_NOT_AVAILABLE, HttpStatus.CONFLICT);
      }

      const reservation = manager.create(ReservationEntity, {
        seatId,
        userId,
        status: ReservationStatus.RESERVED,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        idempotencyKey: idempotencyKey || null,
      });

      const savedReservation = await manager.save(ReservationEntity, reservation);

      seat.status = SeatStatus.RESERVED;
      await manager.save(SeatEntity, seat);

      this.eventsGateway.emitSeatUpdate({
        seatId: seat.id,
        label: seat.label,
        status: seat.status,
        expiresAt: savedReservation.expiresAt.toISOString(),
      });

      return savedReservation;
    });
  }

  async confirmReservation(reservationId: string, userId: number): Promise<ReservationEntity> {
    return this.dataSource.transaction('SERIALIZABLE', async (manager: EntityManager) => {
      const reservation = await manager
        .createQueryBuilder(ReservationEntity, 'reservation')
        .setLock('pessimistic_write')
        .where('reservation.id = :reservationId', { reservationId })
        .getOne();

      if (!reservation) {
        throw new AppException(ReservationError.RESERVATION_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (reservation.userId !== userId) {
        throw new AppException(ReservationError.RESERVATION_NOT_YOURS, HttpStatus.FORBIDDEN);
      }

      // Idempotent: agar allaqachon CONFIRMED
      if (reservation.status === ReservationStatus.CONFIRMED) {
        return reservation;
      }

      if (reservation.status !== ReservationStatus.RESERVED) {
        throw new AppException(ReservationError.RESERVATION_CANNOT_BE_CONFIRMED, HttpStatus.CONFLICT);
      }

      // Agar muddati tugagan bo'lsa
      if (reservation.expiresAt < new Date()) {
        reservation.status = ReservationStatus.EXPIRED;
        await manager.save(ReservationEntity, reservation);

        const seat = await manager.findOne(SeatEntity, { where: { id: reservation.seatId } });
        if (seat) {
          seat.status = SeatStatus.AVAILABLE;
          await manager.save(SeatEntity, seat);
          this.eventsGateway.emitSeatUpdate({
            seatId: seat.id,
            label: seat.label,
            status: seat.status,
          });
        }

        throw new AppException(ReservationError.RESERVATION_EXPIRED, HttpStatus.GONE);
      }

      reservation.status = ReservationStatus.CONFIRMED;
      const savedReservation = await manager.save(ReservationEntity, reservation);

      const seat = await manager.findOne(SeatEntity, { where: { id: reservation.seatId } });
      if (seat) {
        seat.status = SeatStatus.CONFIRMED;
        await manager.save(SeatEntity, seat);
        this.eventsGateway.emitSeatUpdate({
          seatId: seat.id,
          label: seat.label,
          status: seat.status,
        });
      }

      return savedReservation;
    });
  }

  async cancelReservation(reservationId: string, userId: number): Promise<ReservationEntity> {
    return this.dataSource.transaction('SERIALIZABLE', async (manager: EntityManager) => {
      const reservation = await manager
        .createQueryBuilder(ReservationEntity, 'reservation')
        .setLock('pessimistic_write')
        .where('reservation.id = :reservationId', { reservationId })
        .getOne();

      if (!reservation) {
        throw new AppException(ReservationError.RESERVATION_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (reservation.userId !== userId) {
        throw new AppException(ReservationError.RESERVATION_NOT_YOURS, HttpStatus.FORBIDDEN);
      }

      // Idempotent: agar allaqachon EXPIRED yoki CANCELLED
      if (reservation.status === ReservationStatus.EXPIRED || reservation.status === ReservationStatus.CANCELLED) {
        return reservation;
      }

      reservation.status = ReservationStatus.CANCELLED;
      const savedReservation = await manager.save(ReservationEntity, reservation);

      const seat = await manager.findOne(SeatEntity, { where: { id: reservation.seatId } });
      if (seat) {
        seat.status = SeatStatus.AVAILABLE;
        await manager.save(SeatEntity, seat);
        this.eventsGateway.emitSeatUpdate({
          seatId: seat.id,
          label: seat.label,
          status: seat.status,
        });
      }

      return savedReservation;
    });
  }

  async findMyReservations(userId: number): Promise<ReservationEntity[]> {
    return this.reservationRepository.findByUser(userId);
  }
}
