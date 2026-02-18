import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConsoleLogger, ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression from 'compression';
import type { Request, Response, NextFunction } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

function shouldCompress(req: Request, res: Response) {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
}

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'DSRS',
    }),
  });

  const configService = app.get(ConfigService);

  const allowedOrigins = configService.get<string[]>('cors.allowed-origins', ['*']);
  const port = configService.get<number>('server.port', 3000);
  const apiDocPath = configService.get<string>('server.api_doc_path', '/api-docs');
  const appDomain = configService.get<string>('app.domain', `http://localhost:${port}`);

  app.useStaticAssets(join(__dirname, '..', 'public/assets'));

  app.use(helmet());
  app.use(compression({ filter: shouldCompress }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages: { field: string; errors: string[] }[] = [];

        const collectErrors = (errs: typeof errors, prefix = '') => {
          for (const err of errs) {
            const field = prefix ? `${prefix}.${err.property}` : err.property;
            if (err.constraints) {
              messages.push({ field, errors: Object.values(err.constraints) });
            }
            if (err.children && err.children.length > 0) {
              collectErrors(err.children, field);
            }
          }
        };

        collectErrors(errors);
        return new BadRequestException(messages);
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token', 'Idempotency-Key'],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });

  setupSwagger(app, configService);

  await app.listen(port, '0.0.0.0', () => {
    console.log(`Application is running on: ${appDomain}`);
    console.log(`Swagger docs available at: ${appDomain}${apiDocPath}`);
  });
}

if (require.main === module) {
  bootstrap();
}
