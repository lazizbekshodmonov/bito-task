import { PaginationRequestDto } from '../../../common/pagination/pagination-request.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../../common/enums/user-status.enum';

export class UserRequestQueryDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description: 'Filter by user status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Search by user name or email',
    example: '',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
