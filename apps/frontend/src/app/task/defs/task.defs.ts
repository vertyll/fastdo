import { TaskPriorityEnum } from '../../shared/enums/task-priority.enum';

export type Task = {
  id: string;
  projectId: string;
  number: number;
  name: string;
  description: string | null;
  priority: TaskPriorityEnum;
  priceEstimation: number;
  workedMinutes: number;
  statusId: string | null;
  categoryIds: string[];
  assigneeIds: string[];
  accessRoleId: string | null;
  attachmentIds: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number | null;
};

export type TaskUserView = {
  id: string;
  displayName: string;
  avatarFileId: string | null;
};

export type TaskCategoryView = {
  id: string;
  name: string;
  nameLanguage: string;
  color: string;
};

export type TaskListItem = {
  id: string;
  projectId: string;
  number: number;
  name: string;
  priority: TaskPriorityEnum;
  statusId: string | null;
  statusName: string | null;
  statusColor: string | null;
  categories: TaskCategoryView[];
  assignees: TaskUserView[];
  commentCount: number;
  workedMinutes: number;
  createdAt: string;
  version: number | null;
};

export type TaskDetails = {
  task: Task;
  statusName: string | null;
  categories: TaskCategoryView[];
  assignees: TaskUserView[];
  createdBy: TaskUserView | null;
  comments: TaskComment[];
  permissions: string[];
  hiddenWorkLogEnabled: boolean;
};

export type WorkLogEntry = {
  id: string;
  taskId: string;
  author: TaskUserView;
  minutes: number;
  workedOn: string;
  description: string | null;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
  version: number | null;
};

export type WorkLogPayload = {
  minutes: number;
  workedOn: string;
  description: string | null;
  hidden: boolean;
};

export type TaskComment = {
  id: string;
  taskId: string;
  author: TaskUserView;
  content: string;
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
  version: number | null;
};

export type CreateTaskPayload = {
  name: string;
  description?: string | null;
  priority: TaskPriorityEnum;
  statusId?: string | null;
  categoryIds?: string[];
  assigneeIds?: string[];
  priceEstimation?: number;
  accessRoleId?: string | null;
  attachmentIds?: string[];
};

export type UpdateTaskPayload = CreateTaskPayload;

export type CreateCommentPayload = {
  content: string;
  attachmentIds?: string[];
};

export enum TaskSortFieldEnum {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  PRIORITY = 'PRIORITY',
  NAME = 'NAME',
}

export type GetAllTasksSearchParams = {
  searchTerm?: string;
  statusId?: string;
  categoryId?: string;
  assigneeId?: string;
  priority?: TaskPriorityEnum;
  onlyActive?: boolean;
  sortBy?: TaskSortFieldEnum;
  sortDescending?: boolean;
  page?: number;
  size?: number;
};

export type WorkLogVisibility = 'ALL' | 'HIDDEN' | 'VISIBLE';

export type WorkLogPage = {
  content: WorkLogEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalMinutes: number;
};
