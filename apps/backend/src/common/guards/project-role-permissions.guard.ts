import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ProjectUserRole } from '../../projects/entities/project-user-role.entity';
import { ProjectRolePermissionEnum } from '../../projects/enums/project-role-permission.enum';
import { PROJECT_ID_PARAM_KEY, PROJECT_ROLE_PERMISSIONS_KEY } from '../decorators/project-role-permissions.decorator';

@Injectable()
export class ProjectRolePermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<ProjectRolePermissionEnum[]>(PROJECT_ROLE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const projectIdParamKey = this.reflector.getAllAndOverride<string>(PROJECT_ID_PARAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || 'id';

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = Number(request.params[projectIdParamKey] || request.body[projectIdParamKey]);

    const userRole = await this.dataSource.getRepository(ProjectUserRole).findOne({
      where: {
        project: { id: projectId },
        user: { id: user.id },
      },
      relations: ['projectRole', 'projectRole.permissions'],
    });

    if (!userRole || !userRole.projectRole?.permissions) return false;

    const userPermissions = userRole.projectRole.permissions.map(p => p.code);
    
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }
}