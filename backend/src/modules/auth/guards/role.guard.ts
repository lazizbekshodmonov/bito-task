import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../auth.types';
import { AppException } from '../../../common/exceptions/app-exception';
import { AuthError } from '../enums/auth-error.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!user) throw new AppException(AuthError.PERMISSION_DENIED, HttpStatus.FORBIDDEN);

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new AppException(AuthError.PERMISSION_DENIED, HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
