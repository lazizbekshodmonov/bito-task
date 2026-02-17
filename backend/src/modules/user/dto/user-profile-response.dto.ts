import { UserRole } from '../enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../common/enums/user-status.enum';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: "User's full name",
    example: 'Ali Valiyev',
  })
  name: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    type: String,
    description: 'Email',
    example: 'alivaliyev@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;
}
