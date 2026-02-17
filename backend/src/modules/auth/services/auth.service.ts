import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../../user/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../user/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { parseDuration } from '../../../common/utils/parse-duration';
import { AppException } from '../../../common/exceptions/app-exception';
import { UserError } from '../../user/enums/user-error.enum';
import { AuthError } from '../enums/auth-error.enum';
import { JwtPayload, StringValue } from '../auth.types';
import { AuthLoginDto, AuthRegisterDto, TokensResponseDto } from '../dto';
import { UserStatus } from '../../../common/enums/user-status.enum';
import { AuthJwtService } from './auth-jwt.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly accessExpiresIn: StringValue;
  private readonly refreshExpiresIn: StringValue;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly jwtService: AuthJwtService,
  ) {
    this.jwtSecret = this.configService.get<string>('security.jwt.jwt_secret', '');
    this.accessExpiresIn = this.configService.get<StringValue>('security.jwt.access_expires_in', '1d');
    this.refreshExpiresIn = this.configService.get<StringValue>('security.jwt.refresh_expires_in', '7d');
  }

  async adminLogin(dto: AuthLoginDto) {
    const user = await this.userRepository.findByUsername(dto.email);

    if (!user) throw new AppException(UserError.NOT_FOUND, HttpStatus.BAD_REQUEST);

    if (user.status === UserStatus.INACTIVE) {
      throw new AppException(UserError.INACTIVE, HttpStatus.BAD_REQUEST);
    }

    if (user.role !== UserRole.ADMIN) {
      throw new AppException(AuthError.PERMISSION_DENIED, HttpStatus.FORBIDDEN);
    }

    if (!user.passwordHash) {
      throw new AppException(AuthError.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new AppException(AuthError.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);

    return this.generateTokens({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  async login(dto: AuthLoginDto) {
    const user = await this.userRepository.findByUsername(dto.email);

    if (!user) throw new AppException(UserError.NOT_FOUND, HttpStatus.BAD_REQUEST);

    if (user.status === UserStatus.INACTIVE) {
      throw new AppException(UserError.INACTIVE, HttpStatus.BAD_REQUEST);
    }

    if (!user.passwordHash) {
      throw new AppException(AuthError.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new AppException(AuthError.INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);

    return this.generateTokens({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  async register(dto: AuthRegisterDto): Promise<void> {
    const existingUser = await this.userRepository.findByUsername(dto.email);
    if (existingUser) {
      throw new AppException(AuthError.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    await this.userService.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
  }

  async refresh(refreshToken: string): Promise<TokensResponseDto> {
    const jwtPayload = await this.jwtService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findOne({ where: { id: jwtPayload.sub } });

    if (!user || user.status === UserStatus.INACTIVE) {
      throw new AppException(UserError.INACTIVE, HttpStatus.BAD_REQUEST);
    }

    return this.generateTokens({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }

  private generateTokens(payload: JwtPayload): TokensResponseDto {
    if (!this.jwtSecret || !this.accessExpiresIn || !this.refreshExpiresIn) {
      throw new AppException(AuthError.TOKEN_INVALID_OR_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    const accessToken = this.jwtService.accessTokenGenerate(payload);
    const refreshToken = this.jwtService.refreshTokenGenerate(payload);

    const accessExpiresAt = new Date(Date.now() + parseDuration(this.accessExpiresIn));
    const refreshExpiresAt = new Date(Date.now() + parseDuration(this.refreshExpiresIn));

    return new TokensResponseDto(accessToken, refreshToken, accessExpiresAt, refreshExpiresAt);
  }
}