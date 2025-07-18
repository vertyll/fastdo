import { UserWithRoleDto } from './user-with-role.dto';

export type AddProjectDto = {
  name: string;
  description?: string;
  isPublic?: boolean;
  typeId?: number;
  categories?: string[];
  statuses?: string[];
  userEmails?: string[];
  usersWithRoles?: UserWithRoleDto[];
};
