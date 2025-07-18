import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private readonly dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findAllActive(lang: string): Promise<Role[]> {
    return this.createQueryBuilder('role')
      .leftJoinAndSelect('role.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language', 'language.code = :lang', { lang })
      .where('role.isActive = :isActive', { isActive: true })
      .getMany();
  }
}
