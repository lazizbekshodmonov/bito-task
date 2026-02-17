import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { UserResponseDto } from '../dto';
import { ApiPaginatedResponse } from '../../../common/pagination/pagination-swagger.decorator';

/* ========================= PROFILE ========================= */

export function UserProfileSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get current user profile',
      description: `
Returns profile information of the currently authenticated user.
Authentication is based on access token.
`,
    }),
    ApiOkResponse({
      type: UserResponseDto,
      description: 'Authenticated user profile',
    }),
  );
}

/* ========================= CREATE USER ========================= */

export function UserCreateSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new user',
      description: `
Creates a new user in the system.
Only administrators are allowed to perform this action.
`,
    }),
    ApiCreatedResponse({
      type: UserResponseDto,
      description: 'User successfully created',
    }),
  );
}

/* ========================= FIND ALL USERS ========================= */

export function UserFindAllSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get list of users',
      description: `
Returns a paginated list of users.
Supports filtering, sorting and pagination.
`,
    }),

    ApiPaginatedResponse(UserResponseDto, 'Paginated list of users'),
  );
}

/* ========================= FIND ONE USER ========================= */

export function UserFindOneSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user by ID',
      description: 'Retrieve a single user by numeric ID',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the user',
    }),
    ApiOkResponse({
      type: UserResponseDto,
      description: 'User found',
    }),
  );
}

/* ========================= UPDATE USER ========================= */

export function UserUpdateSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user by ID',
      description: `
Updates user data.
Only allowed fields can be updated.
`,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the user',
    }),
    ApiOkResponse({
      description: 'User successfully updated',
    }),
  );
}

/* ========================= CHANGE ADMIN STATUS ========================= */

export function UserChangeAdminStatusSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Change admin isActive status',
      description: `
Changes the active status of an admin user.
Only super admins or authorized admins can perform this action.
`,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the admin',
    }),
    ApiOkResponse({
      description: 'Admin status successfully updated',
    }),
  );
}

/* ========================= DELETE USER ========================= */

export function UserDeleteSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user by ID',
      description: `
Deletes a user by ID.
Only administrators are allowed to perform this action.
`,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the user',
    }),
    ApiOkResponse({
      description: 'User successfully deleted',
    }),
  );
}
