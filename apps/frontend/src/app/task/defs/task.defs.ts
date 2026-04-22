import { File } from '../../core/defs/core.defs';
import { ProjectCategory, ProjectStatus } from '../../project/defs/project.defs';
import { ProjectRole } from '../../shared/types/entities.type';

export type Task = {
  id: number;
  description: string;
  additionalDescription?: string;
  priceEstimation: number; // 0-100 where 100 = 1 hour
  workedTime: number; // 0-100 where 100 = 1 hour
  accessRole?: ProjectRole;
  dateCreation: string;
  dateModification: string;
  project?: TaskProject | null;
  assignedUsers: TaskUser[];
  createdBy: TaskUser;
  priority: TaskPriority;
  categories: ProjectCategory[];
  status?: ProjectStatus | null;
  attachments: File[];
  comments: TaskComment[];
};

export type TaskProject = {
  id: number;
  name: string;
  categories: ProjectCategory[];
  statuses: ProjectStatus[];
};

export type TaskUser = {
  id: number;
  email: string;
};

export type TaskPriority = {
  id: number;
  name: string;
  color: string;
  code: TaskPriorityCodeEnum;
};

export type TaskComment = {
  id: number;
  content: string;
  dateCreation: string;
  dateModification: string;
  author: TaskUser;
  attachments: File[];
};

export enum TaskPriorityCodeEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export type TaskPayload = {
  description: string;
  additionalDescription?: string;
  priceEstimation?: number;
  workedTime?: number;
  accessRoleId?: number;
  projectId: number;
  priorityId?: number;
  categoryIds?: number[];
  statusId?: number;
  assignedUserIds?: number[];
  attachmentIds?: string[];
};

export type GetAllTasksSearchParams = {
  q: string;
  sortBy: 'dateCreation' | 'dateModification' | 'description' | 'id';
  orderBy: 'desc' | 'asc';
  priorityIds?: number[];
  categoryIds?: number[];
  statusIds?: number[];
  assignedUserIds?: number[];
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  pageSize?: number;
};
