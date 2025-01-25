import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../generated/i18n/i18n.generated';
import { UserRoleRepository } from '../users/repositories/user-role.repository';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async findRoleByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  public async addRoleToUser(userId: number, roleName: string): Promise<void> {
    const role = await this.findRoleByName(roleName);
    if (!role) {
      throw new NotFoundException(
        this.i18n.translate('messages.Roles.errors.roleNotFound', { args: { roleName } }),
      );
    }
    const userRole = this.userRoleRepository.create({
      user: { id: userId },
      role: { id: role.id },
    });
    await this.userRoleRepository.save(userRole);
  }

  public async getUserRoles(userId: number): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { user: { id: userId } },
      relations: ['role'],
    });
    return userRoles.map(userRole => userRole.role.name);
  }
}
