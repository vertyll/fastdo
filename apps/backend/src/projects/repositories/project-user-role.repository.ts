import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectUserRole } from '../entities/project-user-role.entity';

@Injectable()
export class ProjectUserRoleRepository extends Repository<ProjectUserRole> {
  constructor(private readonly dataSource: DataSource) {
    super(ProjectUserRole, dataSource.createEntityManager());
  }

  public async findByProjectId(projectId: number): Promise<ProjectUserRole[]> {
    return this.find({
      where: { project: { id: projectId } },
      relations: ['user', 'project'],
    });
  }

  public async findByUserId(userId: number): Promise<ProjectUserRole[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: ['user', 'project'],
    });
  }

  public async findByProjectAndUser(projectId: number, userId: number): Promise<ProjectUserRole | null> {
    return this.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
      relations: ['user', 'project'],
    });
  }
}
