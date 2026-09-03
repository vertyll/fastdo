export type Project = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isActive: boolean;
  typeId: string | null;
  iconFileId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  version: number | null;
  permissions: string[];
  isExpanded?: boolean;
  editMode?: boolean;
  hiddenWorkLogEnabled: boolean;
};

export type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isActive: boolean;
  iconFileId: string | null;
  typeId: string | null;
  memberCount: number;
  createdAt: string;
  version: number | null;
  permissions: string[];
};

export type ProjectDetails = {
  project: Project;
  type: ProjectType | null;
  members: ProjectMember[];
  categories: ProjectCategory[];
  statuses: ProjectStatus[];
  permissions: string[];
  currentUserId: string;
};

export enum ProjectTypeCodeEnum {
  TICKETS = 'TICKETS',
  BACKLOG = 'BACKLOG',
}

export type ProjectType = {
  id: string;
  code: ProjectTypeCodeEnum;
  name: string;
  description: string | null;
  isActive: boolean;
  version: number | null;
};

export type Translation = {
  language: string;
  name: string;
  description?: string | null;
};

export type ProjectCategory = {
  id: string;
  projectId: string;
  name: string;
  nameLanguage: string;
  color: string;
  isActive: boolean;
  translations: Translation[];
  version: number | null;
};

export type ProjectStatus = {
  id: string;
  projectId: string;
  name: string;
  nameLanguage: string;
  color: string;
  isActive: boolean;
  translations: Translation[];
  version: number | null;
};

export type ProjectRole = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  version: number | null;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  email: string;
  displayName: string;
  avatarFileId: string | null;
  roleId: string;
  roleCode: string;
  rolePermissions: string[];
  roleName: string;
  assignedAt: string;
  version: number | null;
};

export enum InvitationStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export type ProjectInvitation = {
  id: string;
  projectId: string;
  projectName: string | null;
  inviteeEmail: string;
  inviterId: string;
  roleId: string;
  status: InvitationStatusEnum;
  expiresAt: string;
  createdAt: string;
  version: number | null;
};

export type CreateProjectPayload = {
  name: string;
  description?: string | null;
  isPublic: boolean;
  typeId?: string | null;
  iconFileId?: string | null;
  hiddenWorkLogEnabled: boolean;
};

export type UpdateProjectPayload = CreateProjectPayload;

export enum ProjectSortFieldEnum {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export type GetAllProjectsSearchParams = {
  searchTerm?: string;
  typeId?: string;
  onlyActive?: boolean;
  includePublic?: boolean;
  sortBy?: ProjectSortFieldEnum;
  sortDescending?: boolean;
  page?: number;
  size?: number;
};
