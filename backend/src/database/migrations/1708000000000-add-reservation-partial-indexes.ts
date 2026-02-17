import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservationPartialIndexes1708000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Double booking ga qarshi ASOSIY himoya
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_one_active_reservation_per_seat"
      ON "reservations" ("seat_id")
      WHERE "status" IN ('RESERVED', 'CONFIRMED')
    `);

    // Cron job uchun: expired reservationlarni tez topish
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_reserved_expiring"
      ON "reservations" ("expires_at")
      WHERE "status" = 'RESERVED'
    `);

    // User ning aktiv reservationini topish
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_active_reservation"
      ON "reservations" ("user_id")
      WHERE "status" IN ('RESERVED', 'CONFIRMED')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_one_active_reservation_per_seat"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_reserved_expiring"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_active_reservation"`);
  }
}