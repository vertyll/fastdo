import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectStatus } from '../entities/project-status.entity';

@Injectable()
export class ProjectStatusRepository extends Repository<ProjectStatus> {
  constructor(private readonly dataSource: DataSource) {
    super(ProjectStatus, dataSource.createEntityManager());
  }

  public async findByProjectId(projectId: number): Promise<ProjectStatus[]> {
    return this.find({
      where: { project: { id: projectId }, isActive: true },
      relations: ['project'],
    });
  }
}
