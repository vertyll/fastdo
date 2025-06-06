import { Injectable } from '@nestjs/common';
import { IRolesFacade } from '../interfaces/roles-facade.interface';
import { RolesService } from '../roles.service';

@Injectable()
export class RolesFacadeService implements IRolesFacade {
  constructor(private readonly rolesService: RolesService) {}

  public async getUserRoles(userId: number): Promise<string[]> {
    return this.rolesService.getUserRoles(userId);
  }
}
