import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { UserResponseDto } from '../dto';
import { ApiPaginatedResponse } from '../../../common/pagination/pagination-swagger.decorator';

/* ========================= CREATE ADMIN ========================= */

export function AdminCreateSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new administrator',
      description: `
Creates a new administrator in the system.
Only existing administrators are allowed to perform this action.
The role will be automatically set to ADMIN.
`,
    }),
    ApiCreatedResponse({
      type: UserResponseDto,
      description: 'Administrator successfully created',
    }),
  );
}

/* ========================= FIND ALL ADMINS ========================= */

export function AdminFindAllSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get list of administrators',
      description: `
Returns a paginated list of administrators.
Supports filtering, sorting and pagination.
`,
    }),
    ApiPaginatedResponse(UserResponseDto, 'Paginated list of administrators'),
  );
}

/* ========================= FIND ONE ADMIN ========================= */

export function AdminFindOneSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get administrator by ID',
      description: 'Retrieve a single administrator by numeric ID',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the administrator',
    }),
    ApiOkResponse({
      type: UserResponseDto,
      description: 'Administrator found',
    }),
  );
}

/* ========================= UPDATE ADMIN ========================= */

export function AdminUpdateSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update administrator by ID',
      description: `
Updates administrator data.
Cannot update your own account.
`,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the administrator',
    }),
    ApiOkResponse({
      description: 'Administrator successfully updated',
    }),
  );
}

/* ========================= CHANGE ADMIN STATUS ========================= */

export function AdminChangeStatusSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Change administrator status',
      description: `
Changes the active status of an administrator.
Cannot change your own status.
`,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the administrator',
    }),
    ApiNoContentResponse({
      description: 'Administrator status successfully updated',
    }),
  );
}

/* ========================= DELETE ADMIN ========================= */

export function AdminDeleteSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete administrator by ID',
      description: `
Deletes an administrator by ID.
Cannot delete your own account.
`,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'Numeric ID of the administrator',
    }),
    ApiOkResponse({
      description: 'Administrator successfully deleted',
    }),
  );
}
