import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Roles } from '../../auth/decorators';
import { JwtWebGuard, RolesGuard } from '../../auth/guards';
import type { JwtPayload } from '../../auth/auth.types';
import { UserService } from '../services/user.service';
import { UserRole } from '../enums/user-role.enum';
import { UserChangeStatusDto, UserCreateDto, UserProfileResponseDto, UserRequestQueryDto, UserResponseDto, UserUpdateDto } from '../dto';
import { PaginationResponseDto } from '../../../common/pagination/pagination-response.dto';
import { UserChangeAdminStatusSwaggerDoc, UserCreateSwaggerDoc, UserDeleteSwaggerDoc, UserFindAllSwaggerDoc, UserFindOneSwaggerDoc, UserProfileSwaggerDoc, UserUpdateSwaggerDoc } from '../swagger/user.swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtWebGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves the authenticated user's profile.
   *
   * @param jwtPayload - The authenticated user's JWT payload
   * @returns The user profile with role and company info
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UserProfileSwaggerDoc()
  profile(@AuthenticatedUser() jwtPayload: JwtPayload): Promise<UserProfileResponseDto> {
    return this.userService.getProfile(jwtPayload);
  }

  /**
   * Retrieves a paginated list of regular users (admin only).
   *
   * @param query - Pagination and filter parameters
   * @returns A paginated list of users
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @UserFindAllSwaggerDoc()
  findAll(@Query() query: UserRequestQueryDto): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.userService.findAllUsers(query);
  }

  /**
   * Creates a new regular user (admin only).
   *
   * @param dto - The user creation data
   * @returns The created user
   * @throws {AppException} When the email already exists
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @UserCreateSwaggerDoc()
  create(@Body() dto: UserCreateDto): Promise<UserResponseDto> {
    return this.userService.createUser(dto);
  }

  /**
   * Retrieves a single user by ID (admin only).
   *
   * @param id - The user ID
   * @returns The user details
   * @throws {AppException} When the user is not found
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @UserFindOneSwaggerDoc()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  /**
   * Changes the status of a user (admin only).
   *
   * @param id - The user ID
   * @param jwtPayload - The authenticated admin's JWT payload
   * @param dto - The status change data
   * @throws {AppException} When the user is not found
   */
  @Put('change-status/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @UserChangeAdminStatusSwaggerDoc()
  changeStatus(@Param('id', ParseIntPipe) id: number, @AuthenticatedUser() jwtPayload: JwtPayload, @Body() dto: UserChangeStatusDto): Promise<void> {
    return this.userService.changeStatus(jwtPayload.sub, id, UserRole.USER, dto);
  }

  /**
   * Updates a user's details (admin only).
   *
   * @param id - The user ID
   * @param dto - The update data
   * @throws {AppException} When the user is not found or email already exists
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @UserUpdateSwaggerDoc()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UserUpdateDto): Promise<void> {
    return this.userService.updateUser(id, dto);
  }

  /**
   * Soft-deletes a user (admin only).
   *
   * @param id - The user ID
   * @throws {AppException} When the user is not found
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @UserDeleteSwaggerDoc()
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
