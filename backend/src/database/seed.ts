import { DataSource } from 'typeorm';
import { SeatEntity } from '../modules/seats/entities/seat.entity';
import { ReservationEntity } from '../modules/reservations/entities/reservation.entity';
import { UserEntity } from '../modules/user/entities/user.entity';
import { SeatCategory } from '../modules/seats/enums/seat-category.enum';
import { SeatStatus } from '../modules/seats/enums/seat-status.enum';
import { loadYamlConfig } from '../config/load-yaml.config';

const rowConfig: { rows: string[]; category: SeatCategory; price: number }[] = [
  { rows: ['A', 'B'], category: SeatCategory.VIP, price: 1000 },
  { rows: ['C', 'D'], category: SeatCategory.PREMIUM, price: 750 },
  { rows: ['E', 'F'], category: SeatCategory.STANDARD, price: 500 },
  { rows: ['G', 'H'], category: SeatCategory.ECONOMY, price: 300 },
];

const SEATS_PER_ROW = 10;

async function seed() {
  const config = loadYamlConfig() as Record<string, unknown>;
  const dbConfig = config['database'] as Record<string, Record<string, unknown>>;
  const pg = dbConfig['postgres'];

  const dataSource = new DataSource({
    type: 'postgres',
    host: pg['host'] as string,
    port: pg['port'] as number,
    username: pg['username'] as string,
    password: pg['password'] as string,
    database: pg['name'] as string,
    entities: [SeatEntity, ReservationEntity, UserEntity],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const seatRepo = dataSource.getRepository(SeatEntity);

  const existingCount = await seatRepo.count();
  if (existingCount > 0) {
    console.log(`Already seeded (${existingCount} seats found). Skipping.`);
    await dataSource.destroy();
    return;
  }

  const seats: Partial<SeatEntity>[] = [];

  for (const { rows, category, price } of rowConfig) {
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

  await seatRepo.save(seats);
  console.log(`Seeded ${seats.length} seats`);

  // Partial indexes yaratish
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner
    .query(
      `
    CREATE UNIQUE INDEX IF NOT EXISTS "UQ_one_active_reservation_per_seat"
    ON "reservations" ("seat_id")
    WHERE "status" IN ('RESERVED', 'CONFIRMED')
  `,
    )
    .catch(() => console.log('Partial index UQ_one_active_reservation_per_seat: reservations table may not exist yet'));

  await queryRunner
    .query(
      `
    CREATE INDEX IF NOT EXISTS "IDX_reserved_expiring"
    ON "reservations" ("expires_at")
    WHERE "status" = 'RESERVED'
  `,
    )
    .catch(() => console.log('Partial index IDX_reserved_expiring: reservations table may not exist yet'));

  await queryRunner
    .query(
      `
    CREATE INDEX IF NOT EXISTS "IDX_user_active_reservation"
    ON "reservations" ("user_id")
    WHERE "status" IN ('RESERVED', 'CONFIRMED')
  `,
    )
    .catch(() => console.log('Partial index IDX_user_active_reservation: reservations table may not exist yet'));

  await queryRunner.release();

  await dataSource.destroy();
  console.log('Seed completed');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
