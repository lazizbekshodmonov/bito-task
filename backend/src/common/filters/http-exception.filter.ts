import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../exceptions/app-exception';
import { getLocaleFromRequest } from '../utils/accept-language';
import { ERROR_MESSAGES } from '../localization/error-messages';
import { ErrorResponseDto, ValidationErrorDetail } from '../dto/error-response.dto';
import { GlobalError } from '../enums/global-error.enum';
import { AppExceptionCode } from '../localization/type';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Catches HTTP exceptions and returns a localized error response.
   *
   * @param exception - The thrown HTTP exception
   * @param host - The arguments host providing request/response context
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = exception.getStatus?.() ?? 500;
    const resBody = exception.getResponse();
    const locale = getLocaleFromRequest(request);
    let message = ERROR_MESSAGES.UNKNOWN_ERROR[locale];
    let code = 'UNKNOWN_ERROR' as AppExceptionCode;
    let details: ValidationErrorDetail[] | undefined = undefined;

    if (exception instanceof AppException) {
      code = exception.code;
      message = ERROR_MESSAGES[code][locale];
    } else if (exception instanceof BadRequestException) {
      const body = resBody as {
        message: ValidationErrorDetail[];
      };

      message = ERROR_MESSAGES.VALIDATION_FAILED[locale];
      code = GlobalError.VALIDATION_FAILED;
      details = body.message;
    } else if (typeof resBody === 'object' && resBody !== null) {
      const body = resBody as {
        message: string;
        code: AppExceptionCode;
        details: ValidationErrorDetail[];
      };

      message = body.message ?? message;
      code = body.code ?? code;
      details = body.details ?? undefined;
    } else {
      message = String(resBody);
    }

    if (message.includes('ENOENT')) {
      code = 'FILE_NOT_FOUND' as AppExceptionCode;
      message = ERROR_MESSAGES.FILE_NOT_FOUND?.[locale] ?? 'Requested file not found';
      details = undefined;
    }

    const errorResponse = new ErrorResponseDto({
      statusCode,
      message,
      code,
      locale,
      path: request.url,
      details,
    });

    response.status(statusCode).json(errorResponse);
  }
}
