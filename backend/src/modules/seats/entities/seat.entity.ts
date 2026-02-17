import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';
import { BaseUuidEntity } from '../../../common/entities/base.entity';
import { SeatStatus } from '../enums/seat-status.enum';
import { SeatCategory } from '../enums/seat-category.enum';
import { ReservationEntity } from '../../reservations/entities/reservation.entity';

@Entity('seats')
@Unique(['label'])
@Unique(['row', 'number'])
@Index('IDX_seat_status', ['status'])
@Index('IDX_seat_category', ['category'])
export class SeatEntity extends BaseUuidEntity {
  @Column({ name: 'label', type: 'varchar', length: 10 })
  label: string;

  @Column({ name: 'row', type: 'varchar', length: 5 })
  row: string;

  @Column({ name: 'number', type: 'smallint' })
  number: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SeatStatus,
    enumName: 'seat_status_enum',
    default: SeatStatus.AVAILABLE,
  })
  status: SeatStatus;

  @Column({
    name: 'category',
    type: 'enum',
    enum: SeatCategory,
    enumName: 'seat_category_enum',
    default: SeatCategory.STANDARD,
  })
  category: SeatCategory;

  @Column({ name: 'price', type: 'integer' })
  price: number;

  @OneToMany(() => ReservationEntity, (reservation) => reservation.seat)
  reservations: ReservationEntity[];
}
