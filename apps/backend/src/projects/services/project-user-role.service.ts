import { Injectable } from '@nestjs/common';
import { AssignProjectRoleDto, UpdateProjectRoleDto } from '../dtos/project-user-role.dto';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { ProjectUserRoleRepository } from '../repositories/project-user-role.repository';

@Injectable()
export class ProjectUserRoleService {
  constructor(
    private readonly projectUserRoleRepository: ProjectUserRoleRepository,
  ) {}

  public async assignRole(assignProjectRoleDto: AssignProjectRoleDto): Promise<ProjectUserRole> {
    const { projectId, userId, role } = assignProjectRoleDto;

    const existingRole = await this.projectUserRoleRepository.findByProjectAndUser(projectId, userId);

    if (existingRole) {
      existingRole.projectRole = { id: role } as any;
      return this.projectUserRoleRepository.save(existingRole);
    }

    const newRole = this.projectUserRoleRepository.create({
      project: { id: projectId } as any,
      user: { id: userId } as any,
      projectRole: { id: role } as any,
    });

    return this.projectUserRoleRepository.save(newRole);
  }

  public async updateRole(
    projectId: number,
    userId: number,
    updateProjectRoleDto: UpdateProjectRoleDto,
  ): Promise<ProjectUserRole> {
    const existingRole = await this.projectUserRoleRepository.findByProjectAndUser(projectId, userId);

    if (!existingRole) {
      throw new Error('User role not found in this project');
    }

    existingRole.projectRole = { id: updateProjectRoleDto.role } as any;
    return this.projectUserRoleRepository.save(existingRole);
  }

  public async removeRole(projectId: number, userId: number): Promise<void> {
    const existingRole = await this.projectUserRoleRepository.findByProjectAndUser(projectId, userId);

    if (existingRole) {
      await this.projectUserRoleRepository.remove(existingRole);
    }
  }

  public async getProjectRoles(projectId: number): Promise<ProjectUserRole[]> {
    return this.projectUserRoleRepository.findByProjectId(projectId);
  }

  public async getUserRoles(userId: number): Promise<ProjectUserRole[]> {
    return this.projectUserRoleRepository.findByUserId(userId);
  }

  public async getUserRoleInProject(projectId: number, userId: number): Promise<number | null> {
    const userRole = await this.projectUserRoleRepository.findByProjectAndUser(projectId, userId);
    return userRole ? userRole.projectRole.id : null;
  }
}
