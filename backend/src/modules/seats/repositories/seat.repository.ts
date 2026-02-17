import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SeatEntity } from '../entities/seat.entity';
import { ReservationStatus } from '../../reservations/enums/reservation-status.enum';

@Injectable()
export class SeatRepository extends Repository<SeatEntity> {
  constructor(private dataSource: DataSource) {
    super(SeatEntity, dataSource.createEntityManager());
  }

  async findAllOrdered(): Promise<SeatEntity[]> {
    return this.find({
      order: { row: 'ASC', number: 'ASC' },
    });
  }

  async findAllWithActiveReservation(): Promise<SeatEntity[]> {
    return this.createQueryBuilder('seat')
      .leftJoinAndSelect(
        'seat.reservations',
        'reservation',
        'reservation.status IN (:...statuses) AND reservation.expires_at > NOW()',
        { statuses: [ReservationStatus.RESERVED, ReservationStatus.CONFIRMED] },
      )
      .orderBy('seat.row', 'ASC')
      .addOrderBy('seat.number', 'ASC')
      .getMany();
  }
}