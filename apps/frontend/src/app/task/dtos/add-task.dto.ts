export type AddTaskDto = {
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
