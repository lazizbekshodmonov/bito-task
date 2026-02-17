import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiOperationOptions } from '@nestjs/swagger';
import { UserRole } from '../../user/enums/user-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => {
  const rolesText = `\n\n**Allowed roles:** ${roles.join(', ')}`;

  return applyDecorators(SetMetadata(ROLES_KEY, roles), (target: object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<object>) => {
    if (!descriptor?.value) return;

    const existingMetadata = (Reflect.getMetadata('swagger/apiOperation', descriptor.value) as SwaggerMetadata) || {};

    const existingDescription = existingMetadata.description || '';

    const updatedOptions: ApiOperationOptions = {
      ...existingMetadata,
      description: `${existingDescription}${rolesText}`,
    };

    ApiOperation(updatedOptions)(target, propertyKey as string | symbol, descriptor);
  });
};

interface SwaggerMetadata {
  description?: string;
  summary?: string;
  [key: string]: unknown;
}
