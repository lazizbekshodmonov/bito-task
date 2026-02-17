import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Roles } from '../../auth/decorators';
import { JwtWebGuard, RolesGuard } from '../../auth/guards';
import type { JwtPayload } from '../../auth/auth.types';
import { UserService } from '../services/user.service';
import { UserRole } from '../enums/user-role.enum';
import { UserChangeStatusDto, UserCreateDto, UserRequestQueryDto, UserResponseDto, UserUpdateDto } from '../dto';
import { PaginationResponseDto } from '../../../common/pagination/pagination-response.dto';
import { AdminChangeStatusSwaggerDoc, AdminCreateSwaggerDoc, AdminDeleteSwaggerDoc, AdminFindAllSwaggerDoc, AdminFindOneSwaggerDoc, AdminUpdateSwaggerDoc } from '../swagger/admin.swagger';

@ApiTags('Administrators')
@ApiBearerAuth()
@UseGuards(JwtWebGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves a paginated list of admin users.
   *
   * @param query - Pagination and filter parameters
   * @returns A paginated list of admin users
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @AdminFindAllSwaggerDoc()
  findAll(@Query() query: UserRequestQueryDto): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.userService.findAllAdmins(query);
  }

  /**
   * Creates a new admin user.
   *
   * @param dto - The admin user creation data
   * @returns The created admin user
   * @throws {AppException} When the email already exists
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AdminCreateSwaggerDoc()
  create(@Body() dto: UserCreateDto): Promise<UserResponseDto> {
    return this.userService.createAdmin(dto);
  }

  /**
   * Retrieves a single admin user by ID.
   *
   * @param id - The admin user ID
   * @returns The admin user details
   * @throws {AppException} When the user is not found
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @AdminFindOneSwaggerDoc()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  /**
   * Changes the status of an admin user.
   *
   * @param id - The admin user ID
   * @param jwtPayload - The authenticated user's JWT payload
   * @param dto - The status change data
   * @throws {AppException} When the user is not found or self-update is attempted
   */
  @Put('change-status/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AdminChangeStatusSwaggerDoc()
  changeStatus(@Param('id', ParseIntPipe) id: number, @AuthenticatedUser() jwtPayload: JwtPayload, @Body() dto: UserChangeStatusDto): Promise<void> {
    return this.userService.changeStatus(jwtPayload.sub, id, UserRole.ADMIN, dto);
  }

  /**
   * Updates an admin user's details.
   *
   * @param id - The admin user ID
   * @param jwtPayload - The authenticated user's JWT payload
   * @param dto - The update data
   * @throws {AppException} When the user is not found or self-update is attempted
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @AdminUpdateSwaggerDoc()
  update(@Param('id', ParseIntPipe) id: number, @AuthenticatedUser() jwtPayload: JwtPayload, @Body() dto: UserUpdateDto): Promise<void> {
    return this.userService.updateAdmin(id, jwtPayload.sub, dto);
  }

  /**
   * Soft-deletes an admin user.
   *
   * @param id - The admin user ID
   * @param jwtPayload - The authenticated user's JWT payload
   * @throws {AppException} When the user is not found or self-delete is attempted
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @AdminDeleteSwaggerDoc()
  delete(@Param('id', ParseIntPipe) id: number, @AuthenticatedUser() jwtPayload: JwtPayload): Promise<void> {
    return this.userService.deleteAdmin(id, jwtPayload.sub);
  }
}
