import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../common/enums/user-status.enum';

export class UserChangeStatusDto {
  @ApiProperty({
    enum: UserStatus,
    description: 'User status',
    example: UserStatus.ACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
