import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AppException } from '../../../common/exceptions/app-exception';
import { AuthError } from '../enums/auth-error.enum';
import { AuthJwtService } from '../services/auth-jwt.service';

@Injectable()
export class JwtWebGuard implements CanActivate {
  constructor(private readonly jwtService: AuthJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppException(AuthError.ACCESS_TOKEN_INVALID_OR_EXPIRED, HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.slice(7);
    const payload = await this.jwtService.verifyAccessToken(token);

    request.user = payload;
    return true;
  }
}