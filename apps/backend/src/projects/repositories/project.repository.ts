import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GetAllProjectsSearchParams } from '../dtos/get-all-projects-search-params.dto';
import { ProjectUser } from '../entities/project-user.entity';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectRepository extends Repository<Project> {
  constructor(private readonly dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  public async findAllWithParams(
    params: GetAllProjectsSearchParams,
    skip: number,
    take: number,
    userId: number,
  ): Promise<[Project[], number]> {
    const query = this.dataSource.createQueryBuilder(Project, 'project')
      .innerJoin(ProjectUser, 'projectUser', 'projectUser.project.id = project.id')
      .where('projectUser.user.id = :userId', { userId });

    if (params.q) {
      query.andWhere('project.name LIKE :q', { q: `%${params.q}%` });
    }

    if (params.createdFrom && params.createdFrom !== '') {
      query.andWhere('project.dateCreation >= :createdFrom', {
        createdFrom: params.createdFrom,
      });
    }

    if (params.createdTo && params.createdTo !== '') {
      query.andWhere('project.dateCreation <= :createdTo', {
        createdTo: params.createdTo,
      });
    }

    if (params.updatedFrom && params.updatedFrom !== '') {
      query.andWhere('project.dateModification >= :updatedFrom', {
        updatedFrom: params.updatedFrom,
      });
    }

    if (params.updatedTo && params.updatedTo !== '') {
      query.andWhere('project.dateModification <= :updatedTo', {
        updatedTo: params.updatedTo,
      });
    }

    if (params.sortBy && params.orderBy) {
      query.orderBy(
        `project.${params.sortBy}`,
        params.orderBy.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      query.orderBy('project.dateCreation', 'DESC');
    }

    query.skip(skip).take(take);

    return query.getManyAndCount();
  }
}
