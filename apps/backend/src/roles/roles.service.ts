import { Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "./entities/role.entity";
import { RoleRepository } from "./repositories/role.repository";
import { UserRoleRepository } from "../users/repositories/user-role.repository";

@Injectable()
export class RolesService {
  constructor(
    private rolesRepository: RoleRepository,
    private userRoleRepository: UserRoleRepository
  ) {}

  async findRoleByName(name: string): Promise<Role | undefined> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  async addRoleToUser(userId: number, roleName: string): Promise<void> {
    const role = await this.findRoleByName(roleName);
    if (!role) {
      throw new NotFoundException(`Role ${roleName} does not exist`);
    }
    const userRole = this.userRoleRepository.create({
      user: { id: userId },
      role: { id: role.id },
    });
    await this.userRoleRepository.save(userRole);
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { user: { id: userId } },
      relations: ["role"],
    });
    return userRoles.map((userRole) => userRole.role.name);
  }
}