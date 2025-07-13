import { UserWithRoleDto } from './user-with-role.dto';

export type UpdateProjectDto = {
  name?: string;
  description?: string;
  isPublic?: boolean;
  typeId?: number;
  categories?: string[];
  statuses?: string[];
  isActive?: boolean;
  userEmails?: string[];
  usersWithRoles?: UserWithRoleDto[];
  icon?: File | null;
};
