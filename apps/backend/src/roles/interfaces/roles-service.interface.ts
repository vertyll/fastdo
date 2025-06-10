export interface IRolesService {
  getUserRoles(userId: number): Promise<string[]>;
}
