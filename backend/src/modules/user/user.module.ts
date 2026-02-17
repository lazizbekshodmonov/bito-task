import { Global, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { AdminController } from './controllers/admin.controller';
import { UserRepository } from './repositories/user.repository';
import { AdminSeederService } from './services/admin-seeder.service';

@Global()
@Module({
  imports: [],
  controllers: [UserController, AdminController],
  providers: [UserService, UserRepository, AdminSeederService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
