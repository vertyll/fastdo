import { File } from '../../core/file/models/File';
import { ProjectCategory, ProjectStatus } from '../../project/models/Project';
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
  code: TaskPriorityCode;
};

export type TaskComment = {
  id: number;
  content: string;
  dateCreation: string;
  author: TaskUser;
  attachments: File[];
};

type TaskPriorityCode = 'low' | 'medium' | 'high';
