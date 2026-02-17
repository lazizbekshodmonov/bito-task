import { createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { JwtPayload } from '../auth.types';
import { AppException } from '../../../common/exceptions/app-exception';
import { AuthError } from '../enums/auth-error.enum';

interface AuthenticatedRequest {
  user: JwtPayload;
}

export const AuthenticatedUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtPayload => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.user) {
    throw new AppException(AuthError.ACCESS_TOKEN_INVALID_OR_EXPIRED, HttpStatus.UNAUTHORIZED);
  }
  return request.user;
});
