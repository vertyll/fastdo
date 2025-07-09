import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectType } from '../entities/project-type.entity';

@Injectable()
export class ProjectTypeRepository extends Repository<ProjectType> {
  constructor(private readonly dataSource: DataSource) {
    super(ProjectType, dataSource.createEntityManager());
  }
}
