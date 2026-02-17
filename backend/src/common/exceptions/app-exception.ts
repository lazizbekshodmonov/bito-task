import { HttpException, HttpStatus } from '@nestjs/common';
import { AppExceptionCode } from '../localization/type';

export class AppException extends HttpException {
  constructor(
    public readonly code: AppExceptionCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code }, status);
  }
}
