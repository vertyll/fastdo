import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ProjectRoleEnum } from '../../projects/enums/project-role.enum';

export const PROJECT_ROLES_KEY = 'projectRoles';
export const PROJECT_ID_PARAM_KEY = 'projectIdParamKey';
export const ProjectRoles = (roles: ProjectRoleEnum | ProjectRoleEnum[], projectIdParamKey: string = 'id') => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return applyDecorators(
    SetMetadata(PROJECT_ROLES_KEY, rolesArray),
    SetMetadata(PROJECT_ID_PARAM_KEY, projectIdParamKey),
  );
};
