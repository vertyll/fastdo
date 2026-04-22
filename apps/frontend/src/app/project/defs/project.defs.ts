import { ProjectRolePermissionEnum } from 'src/app/shared/enums/project-role-permission.enum';
import { File } from '../../core/defs/core.defs';

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
  user: ProjectUserRoleUser;
  projectRole: ProjectUserRoleRole;
  dateAssigned?: string;
};

export type ProjectUserRoleRole = {
  id: number;
  code: string;
  name: string;
  description?: string;
};

export type ProjectUserRoleUser = {
  id: number;
  email: string;
};

export type GetAllProjectsSearchParams = {
  q: string;
  sortBy: 'dateCreation' | 'name' | 'dateModification';
  orderBy: 'desc' | 'asc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  typeIds?: number[];
  page?: number;
  pageSize?: number;
};
