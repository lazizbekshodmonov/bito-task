import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get<string>('database.postgres.host'),
          port: config.get<number>('database.postgres.port'),
          username: config.get<string>('database.postgres.username'),
          password: config.get<string>('database.postgres.password'),
          database: config.get<string>('database.postgres.name'),
          autoLoadEntities: true,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: config.get<boolean>('database.postgres.synchronize'),
          timezone: 'Z',
          extra: {
            max: 20,
            connectionTimeoutMillis: 5000,
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
