import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Lifecycle hook that seeds the default admin user on module initialization.
   */
  async onModuleInit(): Promise<void> {
    await this.seedDefaultAdmin();
  }

  /**
   * Creates the default admin user from configuration if one does not already exist.
   */
  private async seedDefaultAdmin(): Promise<void> {
    const adminEmail = this.configService.get<string>('admin.email');
    const adminPassword = this.configService.get<string>('admin.password');
    const adminName = this.configService.get<string>('admin.name');

    if (!adminEmail || !adminPassword || !adminName) {
      this.logger.warn('Admin credentials not configured. Skipping admin seeding.');
      return;
    }

    const existingAdmin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      this.logger.log('Admin user already exists. Skipping seeding.');
      return;
    }

    const existingUserWithEmail = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingUserWithEmail) {
      this.logger.warn(`User with email ${adminEmail} already exists but is not an admin.`);
      return;
    }

    const adminUser = new UserEntity();
    adminUser.name = adminName;
    adminUser.email = adminEmail;
    adminUser.passwordHash = await bcrypt.hash(adminPassword, 10);
    adminUser.role = UserRole.ADMIN;
    adminUser.status = UserStatus.ACTIVE;

    await this.userRepository.save(adminUser);
    this.logger.log(`Default admin user created with email: ${adminEmail}`);
  }
}
