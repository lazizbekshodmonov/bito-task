import { Injectable } from '@nestjs/common';
import { DataSource, LessThan, Repository } from 'typeorm';
import { ReservationEntity } from '../entities/reservation.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';

@Injectable()
export class ReservationRepository extends Repository<ReservationEntity> {
  constructor(private dataSource: DataSource) {
    super(ReservationEntity, dataSource.createEntityManager());
  }

  async findByUser(userId: number): Promise<ReservationEntity[]> {
    return this.find({
      where: { userId },
      relations: ['seat'],
      order: { createdAt: 'DESC' },
    });
  }

  async findExpiredReserved(): Promise<ReservationEntity[]> {
    return this.find({
      where: {
        status: ReservationStatus.RESERVED,
        expiresAt: LessThan(new Date()),
      },
      relations: ['seat'],
    });
  }
}