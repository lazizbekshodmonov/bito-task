import { Body, Controller, HttpCode, HttpStatus, Post, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthLoginDto, AuthRegisterDto, TokensResponseDto } from '../dto';
import { AuthLoginSwaggerDoc, AuthRefreshSwaggerDoc, AuthRegisterSwaggerDoc } from '../swagger/auth.swagger';
import { AppException } from '../../../common/exceptions/app-exception';
import { AuthError } from '../enums/auth-error.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @AuthRegisterSwaggerDoc()
  async register(@Body() dto: AuthRegisterDto): Promise<{ message: string }> {
    await this.authService.register(dto);
    return { message: 'Registered successfully!' };
  }

  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  @AuthLoginSwaggerDoc()
  adminLogin(@Body() dto: AuthLoginDto): Promise<TokensResponseDto> {
    return this.authService.adminLogin(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @AuthLoginSwaggerDoc()
  login(@Body() dto: AuthLoginDto): Promise<TokensResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @AuthRefreshSwaggerDoc()
  refresh(@Headers('x-refresh-token') refreshToken: string): Promise<TokensResponseDto> {
    if (!refreshToken) {
      throw new AppException(AuthError.TOKEN_INVALID_OR_EXPIRED, HttpStatus.BAD_REQUEST);
    }
    return this.authService.refresh(refreshToken);
  }
}