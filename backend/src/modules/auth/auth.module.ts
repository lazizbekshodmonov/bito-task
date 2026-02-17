import { Global, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from '../user/repositories/user.repository';
import { AuthJwtService } from './services/auth-jwt.service';
import { JwtWebGuard } from './guards/jwt-web.guard';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('security.jwt.jwt_secret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthJwtService, UserRepository, JwtWebGuard],
  exports: [JwtModule, AuthService, AuthJwtService, JwtWebGuard],
})
export class AuthModule {}
