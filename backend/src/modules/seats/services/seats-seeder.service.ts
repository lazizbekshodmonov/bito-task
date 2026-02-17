import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeatRepository } from '../repositories/seat.repository';
import { SeatCategory } from '../enums/seat-category.enum';
import { SeatStatus } from '../enums/seat-status.enum';
import { SeatEntity } from '../entities/seat.entity';

const ROW_CONFIG: { rows: string[]; category: SeatCategory; price: number }[] = [
  { rows: ['A', 'B'], category: SeatCategory.VIP, price: 1000 },
  { rows: ['C', 'D'], category: SeatCategory.PREMIUM, price: 750 },
  { rows: ['E', 'F'], category: SeatCategory.STANDARD, price: 500 },
  { rows: ['G', 'H'], category: SeatCategory.ECONOMY, price: 300 },
];

const SEATS_PER_ROW = 10;

@Injectable()
export class SeatsSeederService implements OnModuleInit {
  private readonly logger = new Logger(SeatsSeederService.name);

  constructor(
    private readonly seatRepository: SeatRepository,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingCount = await this.seatRepository.count();

    if (existingCount > 0) {
      this.logger.log(`Seats already seeded (${existingCount} found). Skipping.`);
      return;
    }

    const seats: Partial<SeatEntity>[] = [];

    for (const { rows, category, price } of ROW_CONFIG) {
      for (const row of rows) {
        for (let num = 1; num <= SEATS_PER_ROW; num++) {
          seats.push({
            label: `${row}${num}`,
            row,
            number: num,
            status: SeatStatus.AVAILABLE,
            category,
            price,
          });
        }
      }
    }

    await this.seatRepository.save(seats);
    this.logger.log(`Seeded ${seats.length} seats`);

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner
      .query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_one_active_reservation_per_seat"
         ON "reservations" ("seat_id")
         WHERE "status" IN ('RESERVED', 'CONFIRMED')`,
      )
      .catch(() => this.logger.warn('Partial index UQ_one_active_reservation_per_seat: reservations table may not exist yet'));

    await queryRunner
      .query(
        `CREATE INDEX IF NOT EXISTS "IDX_reserved_expiring"
         ON "reservations" ("expires_at")
         WHERE "status" = 'RESERVED'`,
      )
      .catch(() => this.logger.warn('Partial index IDX_reserved_expiring: reservations table may not exist yet'));

    await queryRunner
      .query(
        `CREATE INDEX IF NOT EXISTS "IDX_user_active_reservation"
         ON "reservations" ("user_id")
         WHERE "status" IN ('RESERVED', 'CONFIRMED')`,
      )
      .catch(() => this.logger.warn('Partial index IDX_user_active_reservation: reservations table may not exist yet'));

    await queryRunner.release();

    this.logger.log('Seed completed');
  }
}
