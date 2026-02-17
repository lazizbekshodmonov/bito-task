import { Injectable } from '@nestjs/common';
import { SeatEntity } from '../entities/seat.entity';
import { SeatRepository } from '../repositories/seat.repository';

@Injectable()
export class SeatsService {
  constructor(private readonly seatRepository: SeatRepository) {}

  async findAll(): Promise<SeatEntity[]> {
    return this.seatRepository.findAllOrdered();
  }

  async findAllWithActiveReservation(): Promise<SeatEntity[]> {
    return this.seatRepository.findAllWithActiveReservation();
  }
}
