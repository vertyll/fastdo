import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n/i18n.generated';
import { UserRoleRepository } from 'src/users/repositories/user-role.repository';
import { RoleEnum } from '../../common/enums/role.enum';
import { RoleDto } from '../dtos/role.dto';
import { Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async findRoleByCode(code: RoleEnum): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { code } });
  }

  public async addRoleToUser(userId: number, roleCode: RoleEnum): Promise<void> {
    const role = await this.findRoleByCode(roleCode);
    if (!role) {
      throw new NotFoundException(this.i18n.translate('messages.Roles.errors.roleNotFound', { args: { roleCode } }));
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
    return userRoles.map(userRole => userRole.role.code);
  }

  public async getAllRoles(): Promise<RoleDto[]> {
    const lang = I18nContext.current()?.lang || 'en';

    const roles = await this.roleRepository.findAllActive(lang);

    return roles.map(role => {
      const translation = role.translations?.find(t => t.language?.code === lang);
      return {
        id: role.id,
        code: role.code,
        name: translation?.name || role.code,
        description: translation?.description,
      };
    });
  }
}
