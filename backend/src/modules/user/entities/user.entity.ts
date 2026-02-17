import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

@Entity('users')
@Unique(['email'])
export class UserEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'email', type: 'varchar', nullable: false })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ name: 'role', type: 'enum', enum: UserRole, enumName: 'user_role_enum', default: UserRole.USER })
  role: UserRole;

  @Column({ name: 'status', type: 'enum', enum: UserStatus, enumName: 'user_status_enum', default: UserStatus.ACTIVE })
  status: UserStatus;
}
