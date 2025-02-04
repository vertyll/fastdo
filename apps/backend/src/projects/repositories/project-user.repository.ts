import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectUser } from '../entities/project-user.entity';

@Injectable()
export class ProjectUserRepository extends Repository<ProjectUser> {
  constructor(private readonly dataSource: DataSource) {
    super(ProjectUser, dataSource.createEntityManager());
  }
}
