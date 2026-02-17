import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRequestQueryDto } from '../dto';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address to search for
   * @returns The user entity or null if not found
   */
  async findByUsername(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email } });
  }

  /**
   * Retrieves a paginated list of users with optional filtering by status, role, and search term.
   *
   * @param query - The pagination and filter parameters
   * @returns A tuple of user entities and total count
   */
  async findOfPagination(query: UserRequestQueryDto): Promise<[UserEntity[], number]> {
    const { page = 1, size = 10, search, status, role } = query;

    const qb = this.createQueryBuilder('user')
      .orderBy('user.id', 'ASC')
      .skip((page - 1) * size)
      .take(size);

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (search) {
      qb.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search.trim()}%`,
      });
    }

    return qb.getManyAndCount();
  }
}
