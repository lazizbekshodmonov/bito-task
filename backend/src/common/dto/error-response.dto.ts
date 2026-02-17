import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDetail {
  @ApiProperty({
    description: 'The field that caused the validation error',
    example: 'email',
  })
  field: string;

  @ApiProperty({
    description: 'List of validation error messages related to this field',
    example: ['email must be a valid email address'],
  })
  errors: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Localized user-friendly error message',
    example: 'Maʼlumotlarni tekshirishda xatolik yuz berdi.',
  })
  message: string;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty({ example: 'uz' })
  locale: string;

  @ApiProperty({ example: '/api/v1/auth/send-otp' })
  path: string;

  @ApiProperty({ example: '2025-10-28T12:30:45.000Z' })
  timestamp: string;

  @ApiProperty({
    description: 'Detailed list of validation errors (only for validation failures)',
    type: [ValidationErrorDetail],
    required: false,
    example: [
      {
        field: 'email',
        errors: ['email must be a valid email address'],
      },
    ],
  })
  details?: ValidationErrorDetail[];

  constructor(params: Partial<ErrorResponseDto>) {
    Object.assign(this, {
      timestamp: new Date().toISOString(),
      locale: 'uz',
      ...params,
    });
  }
}
