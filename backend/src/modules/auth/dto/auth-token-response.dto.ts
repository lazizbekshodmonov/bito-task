import { ApiProperty } from '@nestjs/swagger';

export class TokensResponseDto {
  @ApiProperty({
    description: 'JWT access token used for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token used to obtain a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration date (ISO format)',
    example: '2025-11-01T12:30:00.000Z',
  })
  accessExpiresAt: Date;

  @ApiProperty({
    description: 'Refresh token expiration date (ISO format)',
    example: '2025-12-01T12:30:00.000Z',
  })
  refreshExpiresAt: Date;

  constructor(accessToken: string, refreshToken: string, accessExpiresAt: Date, refreshExpiresAt: Date) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.accessExpiresAt = accessExpiresAt;
    this.refreshExpiresAt = refreshExpiresAt;
  }
}
