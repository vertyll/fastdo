import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { ProjectUserRole } from '../../projects/entities/project-user-role.entity';
import { ProjectRoleEnum } from '../../projects/enums/project-role.enum';
import { PROJECT_ID_PARAM_KEY, PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator';

@Injectable()
export class ProjectRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRoleEnum[]>(PROJECT_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const projectIdParamKey = this.reflector.getAllAndOverride<string>(PROJECT_ID_PARAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || 'id';

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = Number(request.params[projectIdParamKey] || request.body[projectIdParamKey]);

    if (user.roles?.includes('ADMIN')) return true;

    const userRole = await this.dataSource.getRepository(ProjectUserRole).findOne({
      where: {
        project: { id: projectId },
        user: { id: user.id },
      },
      relations: ['projectRole'],
    });
    const projectRoleType: ProjectRoleEnum | undefined = userRole?.projectRole?.code;
    return projectRoleType ? requiredRoles.includes(projectRoleType) : false;
  }
}
