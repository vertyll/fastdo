import { File } from '../../core/file/models/File';

export type Project = {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  icon?: File;
  isActive: boolean;
  dateCreation: number;
  dateModification: number;
  type?: ProjectType;
  categories?: ProjectCategory[];
  statuses?: ProjectStatus[];
  userRoles?: ProjectUserRole[];
  currentUserRole?: string;
  isExpanded?: boolean;
  editMode?: boolean;
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
  user: {
    id: number;
    email: string;
  };
  projectRole: {
    id: number;
    code: string;
    name: string;
    description?: string;
  };
  dateAssigned?: string;
};

export enum ProjectRoleEnum {
  MANAGER = 'manager',
  CLIENT = 'client',
  MEMBER = 'member',
}

export enum ProjectTypeEnum {
  TICKETS = 'tickets',
  BACKLOG = 'backlog',
}

export type SimpleProjectType = {
  id: number;
  name: string;
  description?: string;
};

export type SimpleProjectCategory = {
  id: number;
  name: string;
  color: string;
};

export type SimpleProjectStatus = {
  id: number;
  name: string;
  color: string;
};
