import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../database/redis.module';

const IDEMPOTENCY_TTL = 86400; // 24 hours

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

    if (!idempotencyKey) {
      return next.handle();
    }

    const cached = await this.redis.get(idempotencyKey);

    if (cached) {
      const { statusCode, response: cachedResponse } = JSON.parse(cached);
      response.status(statusCode);
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(async (responseBody: unknown) => {
        const value = JSON.stringify({
          statusCode: response.statusCode,
          response: responseBody,
        });

        await this.redis.set(idempotencyKey, value, 'EX', IDEMPOTENCY_TTL, 'NX');
      }),
    );
  }
}
