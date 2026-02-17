import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { TokensResponseDto } from '../dto';

export function AuthLoginSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'User login',
      description: 'Authenticate user with email and password. Returns access and refresh tokens.',
    }),
    ApiOkResponse({
      type: TokensResponseDto,
      description: 'Login successful. Tokens returned in response body.',
    }),
  );
}

export function AuthRefreshSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh access token',
      description: 'Pass refresh token via `X-Refresh-Token` header to get new tokens.',
    }),
    ApiOkResponse({
      type: TokensResponseDto,
      description: 'Token refreshed successfully.',
    }),
  );
}

export function AuthRegisterSwaggerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register new user',
      description: 'Register a new user with fullname, email and password.',
    }),
    ApiCreatedResponse({
      description: 'User registered successfully.',
    }),
  );
}