import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Request } from 'express';
import { getClientIp } from '../common/utils/client-ip';
import { ConfigService } from '@nestjs/config';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

const logger = new Logger('Swagger');

export function setupSwagger(app: INestApplication, configService: ConfigService): void {
  const port = configService.get<number>('server.port', 3000);
  const swaggerUI = configService.get<boolean>('server.swagger_ui', false);
  const apiDocPath = configService.get<string>('server.api_doc_path', '/api-docs');
  const appName = configService.get<string>('app.name', 'Swagger documentation');
  const appDomain = configService.get<string>('app.domain', `http://localhost:${port}`);

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(`${appName} API documentation`)
    .setVersion('1.0')
    .addServer(appDomain, 'Staging server')
    .addServer(`http://localhost:${port}`, 'Local Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token (obtained from /auth/login)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addGlobalParameters({
      name: 'Accept-Language',
      in: 'header',
      required: false,
      schema: {
        type: 'string',
        enum: ['uz', 'ru', 'en', 'cyr'],
        default: 'uz',
      },
      description: 'Preferred language for responses',
    })
    .addGlobalResponse({
      status: '4XX',
      type: ErrorResponseDto,
    })
    .addTag('Auth', 'User registration, login, and account management')
    .addTag('Users')
    .addTag('Seats', 'Seat listing and availability')
    .addTag('Reservations', 'Seat reservation, confirmation, and cancellation')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup(apiDocPath, app, document, {
    patchDocumentOnRequest: logSwaggerRequest,
    customSiteTitle: 'Seat Reservation API',
    ui: swaggerUI,
    explorer: false,
    customfavIcon: '/logo.svg',
    customCss: `
  .swagger-ui .topbar {
    display: none;
  }

  .swagger-ui .info {
    margin: 30px 0;
  }

  .swagger-ui .info .title {
    font-size: 36px;
    display: flex;
    align-items: center;
  }
    `,
  });
}

function logSwaggerRequest<TRequest = any, TResponse = any>(req: TRequest, res: TResponse, document: OpenAPIObject): OpenAPIObject {
  const request = req as Request;
  const ip = getClientIp(request);
  const method = request.method;
  const url = request.originalUrl;

  logger.log(`${method} ${url} - IP: ${ip}`);
  return document;
}
