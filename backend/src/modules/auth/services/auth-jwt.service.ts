import { JwtService } from '@nestjs/jwt';
import { JwtPayload, StringValue } from '../auth.types';
import { AppException } from '../../../common/exceptions/app-exception';
import { AuthError } from '../enums/auth-error.enum';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthJwtService {
  private readonly jwtSecret: string;
  private readonly accessExpiresIn: StringValue;
  private readonly refreshExpiresIn: StringValue;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('security.jwt.jwt_secret', '');
    this.accessExpiresIn = this.configService.get<StringValue>('security.jwt.access_expires_in', '1d');
    this.refreshExpiresIn = this.configService.get<StringValue>('security.jwt.refresh_expires_in', '7d');
  }
  /**
   * Verifies an access token and returns its payload.
   *
   * @param token - The JWT access token to verify
   * @returns The decoded JWT payload
   * @throws {AppException} When the token is invalid or expired
   */
  public async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtSecret,
      });
    } catch {
      throw new AppException(AuthError.ACCESS_TOKEN_INVALID_OR_EXPIRED, HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Verifies a refresh token and returns its payload.
   *
   * @param token - The JWT refresh token to verify
   * @returns The decoded JWT payload
   * @throws {AppException} When the token is invalid or expired
   */
  public async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtSecret,
      });
    } catch {
      throw new AppException(AuthError.TOKEN_INVALID_OR_EXPIRED, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Generates a signed JWT access token.
   *
   * @param payload - The JWT payload to encode
   * @returns The signed access token string
   */
  accessTokenGenerate(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.accessExpiresIn,
    });
  }

  /**
   * Generates a signed JWT refresh token.
   *
   * @param payload - The JWT payload to encode
   * @returns The signed refresh token string
   */
  refreshTokenGenerate(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.refreshExpiresIn,
    });
  }
}
