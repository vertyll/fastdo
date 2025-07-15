import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ProjectRolePermissionEnum } from '../../projects/enums/project-role-permission.enum';

export const PROJECT_ROLE_PERMISSIONS_KEY = 'projectPermissions';
export const PROJECT_ID_PARAM_KEY = 'projectIdParamKey';

export const ProjectRolePermissions = (
  permissions: ProjectRolePermissionEnum | ProjectRolePermissionEnum[],
  projectIdParamKey: string = 'id'
): ReturnType<typeof applyDecorators> => {
  const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
  return applyDecorators(
    SetMetadata(PROJECT_ROLE_PERMISSIONS_KEY, permissionsArray),
    SetMetadata(PROJECT_ID_PARAM_KEY, projectIdParamKey),
  );
};