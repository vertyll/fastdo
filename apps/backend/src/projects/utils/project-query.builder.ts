import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GetAllProjectsSearchParams } from '../dto/get-all-projects-search-params.dto';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectQueryBuilder {
  buildQuery(
    repository: Repository<Project>,
    params: GetAllProjectsSearchParams,
  ): SelectQueryBuilder<Project> {
    const query = repository.createQueryBuilder('project');

    if (params.q) {
      query.andWhere('project.name LIKE :q', { q: `%${params.q}%` });
    }

    if (params.createdFrom && params.createdFrom !== '') {
      query.andWhere('project.createdAt >= :createdFrom', {
        createdFrom: params.createdFrom,
      });
    }

    if (params.createdTo && params.createdTo !== '') {
      query.andWhere('project.createdAt <= :createdTo', {
        createdTo: params.createdTo,
      });
    }

    if (params.updatedFrom && params.updatedFrom !== '') {
      query.andWhere('project.updatedAt >= :updatedFrom', {
        updatedFrom: params.updatedFrom,
      });
    }

    if (params.updatedTo && params.updatedTo !== '') {
      query.andWhere('project.updatedAt <= :updatedTo', {
        updatedTo: params.updatedTo,
      });
    }

    if (params.sortBy && params.orderBy) {
      query.orderBy(
        `project.${params.sortBy}`,
        params.orderBy.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      query.orderBy('project.createdAt', 'DESC');
    }

    return query;
  }
}
