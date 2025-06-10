export interface ITasksService {
  removeByProjectId(projectId: number): Promise<void>;
}
