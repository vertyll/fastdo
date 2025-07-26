import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectCategory } from '../entities/project-category.entity';

@Injectable()
export class ProjectCategoryRepository extends Repository<ProjectCategory> {
  constructor(private readonly dataSource: DataSource) {
    super(ProjectCategory, dataSource.createEntityManager());
  }
}
