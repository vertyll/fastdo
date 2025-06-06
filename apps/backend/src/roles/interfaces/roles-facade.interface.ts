export interface IRolesFacade {
  getUserRoles(userId: number): Promise<string[]>;
}
