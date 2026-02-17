import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { PaginationResponseDto } from '../../../common/pagination/pagination-response.dto';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';
import { AppException } from '../../../common/exceptions/app-exception';
import { UserError } from '../enums/user-error.enum';
import { Pagination } from '../../../common/pagination/pagination.helper';
import { UserChangeStatusDto, UserCreateDto, UserProfileResponseDto, UserRequestQueryDto, UserResponseDto, UserUpdateDto } from '../dto';
import type { JwtPayload } from '../../auth/auth.types';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createAdmin(createUserDto: UserCreateDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByUsername(createUserDto.email);
    if (existingUser) {
      throw new AppException(UserError.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const entity = UserMapper.toCreateEntity(createUserDto, UserRole.ADMIN);
    entity.passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const saved = await this.userRepository.save(entity);

    return UserMapper.toDto(saved);
  }

  async createUser(createUserDto: UserCreateDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByUsername(createUserDto.email);
    if (existingUser) {
      throw new AppException(UserError.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const entity = UserMapper.toCreateEntity(createUserDto, UserRole.USER);
    entity.passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const saved = await this.userRepository.save(entity);

    return UserMapper.toDto(saved);
  }

  async findAllAdmins(query: UserRequestQueryDto): Promise<PaginationResponseDto<UserResponseDto>> {
    const [userEntityList, total] = await this.userRepository.findOfPagination({ ...query, role: UserRole.ADMIN });

    return Pagination.of(query, total, userEntityList.map(UserMapper.toDto));
  }

  async findAllUsers(query: UserRequestQueryDto): Promise<PaginationResponseDto<UserResponseDto>> {
    const [userEntityList, total] = await this.userRepository.findOfPagination({ ...query, role: UserRole.USER });

    return Pagination.of(query, total, userEntityList.map(UserMapper.toDto));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return UserMapper.toDto(user);
  }

  async getProfile(jwtPayload: JwtPayload): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: jwtPayload.sub } });

    if (!user) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const dto = new UserProfileResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.status = user.status;

    return dto;
  }

  async findByUsername(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async updateAdmin(id: number, currentUserId: number, updateUserDto: UserUpdateDto): Promise<void> {
    const userEntity = await this.userRepository.findOne({ where: { id, role: UserRole.ADMIN } });
    if (!userEntity) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (currentUserId === id) {
      throw new AppException(UserError.SELF_UPDATE_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    if (updateUserDto.email && updateUserDto.email !== userEntity.email) {
      const existingUser = await this.userRepository.findByUsername(updateUserDto.email);
      if (existingUser) {
        throw new AppException(UserError.ALREADY_EXISTS, HttpStatus.CONFLICT);
      }
    }

    const updatedUserEntity = UserMapper.toUpdateEntity(updateUserDto, userEntity);
    await this.userRepository.update({ id }, updatedUserEntity);
  }

  async updateUser(id: number, updateUserDto: UserUpdateDto): Promise<void> {
    const userEntity = await this.userRepository.findOne({ where: { id, role: UserRole.USER } });
    if (!userEntity) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (updateUserDto.email && updateUserDto.email !== userEntity.email) {
      const existingUser = await this.userRepository.findByUsername(updateUserDto.email);
      if (existingUser) {
        throw new AppException(UserError.ALREADY_EXISTS, HttpStatus.CONFLICT);
      }
    }

    const updatedUserEntity = UserMapper.toUpdateEntity(updateUserDto, userEntity);
    await this.userRepository.update({ id }, updatedUserEntity);
  }

  async changeStatus(currentUserId: number, id: number, role: UserRole, dto: UserChangeStatusDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id, role } });
    if (!user) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (role === UserRole.ADMIN && currentUserId === user.id) {
      throw new AppException(UserError.SELF_UPDATE_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    const updatedEntity = new UserEntity();
    updatedEntity.status = dto.status;

    await this.userRepository.update({ id }, updatedEntity);
  }

  async deleteAdmin(id: number, currentUserId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id, role: UserRole.ADMIN } });
    if (!user) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (user.id === currentUserId) {
      throw new AppException(UserError.SELF_DELETE_FORBIDDEN, HttpStatus.FORBIDDEN);
    }

    await this.userRepository.softDelete({ id: user.id });
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id, role: UserRole.USER } });
    if (!user) {
      throw new AppException(UserError.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this.userRepository.softDelete({ id: user.id });
  }
}
