import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseUuidEntity } from '../../../common/entities/base.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { SeatEntity } from '../../seats/entities/seat.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('reservations')
@Index('IDX_reservation_seat_status', ['seatId', 'status'])
@Index('IDX_reservation_user_status', ['userId', 'status'])
export class ReservationEntity extends BaseUuidEntity {
  @Column({ name: 'seat_id', type: 'uuid' })
  seatId: string;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ReservationStatus,
    enumName: 'reservation_status_enum',
    default: ReservationStatus.RESERVED,
  })
  status: ReservationStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, nullable: true })
  idempotencyKey: string | null;

  @ManyToOne(() => SeatEntity, (seat) => seat.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seat_id' })
  seat: SeatEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @BeforeInsert()
  setDefaultExpiresAt() {
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    }
  }

  get isExpired(): boolean {
    return this.expiresAt.getTime() < Date.now();
  }

  get isActive(): boolean {
    return (this.status === ReservationStatus.RESERVED || this.status === ReservationStatus.CONFIRMED) && !this.isExpired;
  }

  get remainingMs(): number {
    return Math.max(0, this.expiresAt.getTime() - Date.now());
  }
}
