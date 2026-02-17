import { UserEntity } from '../entities/user.entity';
import { UserCreateDto, UserResponseDto, UserUpdateDto } from '../dto';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

export class UserMapper {
  /**
   * Converts a user entity to a response DTO.
   *
   * @param entity - The user entity
   * @returns The user response DTO
   */
  public static toDto(this: void, entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.role = entity.role;
    dto.status = entity.status;

    return dto;
  }

  /**
   * Converts a creation DTO to a user entity.
   *
   * @param dto - The user creation DTO
   * @param role - The role to assign to the user
   * @returns A new user entity
   */
  public static toCreateEntity(this: void, dto: UserCreateDto, role: UserRole): UserEntity {
    const user = new UserEntity();
    user.name = dto.name;
    user.email = dto.email;
    user.role = role;
    user.passwordHash = dto.password;
    user.status = UserStatus.ACTIVE;
    return user;
  }

  /**
   * Merges an update DTO with an existing user entity.
   *
   * @param dto - The user update DTO
   * @param entity - The existing user entity
   * @returns A user entity with updated fields
   */
  public static toUpdateEntity(dto: UserUpdateDto, entity: UserEntity): UserEntity {
    const user = new UserEntity();
    user.name = dto.name ?? entity.name;
    user.email = dto.email ?? entity.email;
    return user;
  }
}
