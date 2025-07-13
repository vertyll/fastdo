import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { ProjectRolePermission } from '../../../../projects/entities/project-role-permission.entity';
import { ProjectRole } from '../../../../projects/entities/project-role.entity';
import { ProjectRolePermissionEnum } from '../../../../projects/enums/project-role-permission.enum';
import { ProjectRoleEnum } from '../../../../projects/enums/project-role.enum';
import { Environment } from '../../../config/types/app.config.type';
import { ISeeder } from '../interfaces/seeder.interface';
import { BaseSeederService } from '../services/base-seeder.service';
import { SeederFactoryService } from '../services/seeder-factory.service';

@Injectable()
@Seeder({
  environment: [Environment.DEVELOPMENT, Environment.PRODUCTION],
})
export class ProjectRoleToPermissionSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(ProjectRole) private readonly roleRepository: Repository<ProjectRole>,
    @InjectRepository(ProjectRolePermission) private readonly permissionRepository: Repository<ProjectRolePermission>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(ProjectRoleToPermissionSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const roles = await this.roleRepository.find({ relations: ['permissions'] });
      const permissions = await this.permissionRepository.find();

      const rolePermissionsMap: Record<ProjectRoleEnum, ProjectRolePermissionEnum[]> = {
        [ProjectRoleEnum.MANAGER]: [
          ProjectRolePermissionEnum.EDIT_PROJECT,
          ProjectRolePermissionEnum.DELETE_PROJECT,
          ProjectRolePermissionEnum.SHOW_TASKS,
          ProjectRolePermissionEnum.INVITE_USERS,
          ProjectRolePermissionEnum.MANAGE_MEMBERS,
          ProjectRolePermissionEnum.VIEW_PROJECT,
          ProjectRolePermissionEnum.MANAGE_TASKS,
        ],
        [ProjectRoleEnum.CLIENT]: [
          ProjectRolePermissionEnum.SHOW_TASKS,
          ProjectRolePermissionEnum.VIEW_PROJECT,
        ],
        [ProjectRoleEnum.MEMBER]: [
          ProjectRolePermissionEnum.SHOW_TASKS,
          ProjectRolePermissionEnum.VIEW_PROJECT,
        ],
      };

      for (const role of roles) {
        const permsForRole = rolePermissionsMap[role.code] || [];
        role.permissions = permissions.filter(p => permsForRole.includes(p.code));
        await this.roleRepository.save(role);
        this.baseSeeder.getLogger().log(`Assigned permissions to role: ${role.code}`);
      }
      this.baseSeeder.getLogger().log('Project role to permission mapping completed');
    });
  }
}
