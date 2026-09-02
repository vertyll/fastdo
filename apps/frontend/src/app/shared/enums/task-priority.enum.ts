export enum TaskPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriorityEnum, string> = {
  [TaskPriorityEnum.LOW]: 'Task.priorityLow',
  [TaskPriorityEnum.MEDIUM]: 'Task.priorityMedium',
  [TaskPriorityEnum.HIGH]: 'Task.priorityHigh',
};
