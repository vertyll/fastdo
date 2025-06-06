export interface ITasksFacade {
  removeByProjectId(projectId: number): Promise<void>;
}
