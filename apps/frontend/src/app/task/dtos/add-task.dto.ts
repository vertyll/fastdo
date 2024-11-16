export type AddTaskDto = {
  name: string;
  isDone: boolean;
  isUrgent: boolean;
  projectId?: number;
};
