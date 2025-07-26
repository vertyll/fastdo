import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectStatus } from '../entities/project-status.entity';

@Injectable()
export class ProjectStatusRepository extends Repository<ProjectStatus> {
  constructor(private readonly dataSource: DataSource) {
    super(ProjectStatus, dataSource.createEntityManager());
  }
}
