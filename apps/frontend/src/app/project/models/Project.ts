import { ProjectRolePermissionEnum } from 'src/app/shared/enums/project-role-permission.enum';
import { File } from '../../core/models/File';

export type Project = {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  icon?: File | null;
  isActive: boolean;
  dateCreation: number;
  dateModification: number;
  type?: ProjectType;
  categories?: ProjectCategory[];
  statuses?: ProjectStatus[];
  projectUserRoles?: ProjectUserRole[];
  isExpanded?: boolean;
  editMode?: boolean;
  permissions?: ProjectRolePermissionEnum[];
};

export type ProjectType = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
};

export type ProjectCategory = {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
};

export type ProjectStatus = {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
};

export type ProjectUserRole = {
  id: number;
  user: User;
  projectRole: ProjectRole;
  dateAssigned?: string;
};

type ProjectRole = {
  id: number;
  code: string;
  name: string;
  description?: string;
};

type User = {
  id: number;
  email: string;
};
