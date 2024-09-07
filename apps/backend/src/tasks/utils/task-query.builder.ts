import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GetAllTasksSearchParams } from '../dto/get-all-tasks-search-params.dto';
import { Task } from '../entities/task.entity';

@Injectable()
export class TaskQueryBuilder {
  buildQuery(
    repository: Repository<Task>,
    params: GetAllTasksSearchParams,
    projectId?: number,
  ): SelectQueryBuilder<Task> {
    const query = repository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .select([
        'task.id',
        'task.name',
        'task.done',
        'task.urgent',
        'task.createdAt',
        'task.updatedAt',
        'project.id',
        'project.name',
      ]);

    if (projectId) {
      query.where('project.id = :projectId', { projectId });
    }

    if (params.q) {
      query.andWhere('task.name LIKE :q', { q: `%${params.q}%` });
    }

    if (params.done_like === 'true') {
      query.andWhere('task.done = :done', { done: true });
    } else if (params.done_like === 'false') {
      query.andWhere('task.done = :done', { done: false });
    }

    if (params.urgent_like === 'true') {
      query.andWhere('task.urgent = :urgent', { urgent: true });
    }

    if (params.sortBy && params.orderBy) {
      query.orderBy(
        `task.${params.sortBy}`,
        params.orderBy.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      query.orderBy('task.createdAt', 'DESC');
    }

    if (params.createdFrom && params.createdFrom !== '') {
      query.andWhere('task.createdAt >= :createdFrom', {
        createdFrom: params.createdFrom,
      });
    }

    if (params.createdTo && params.createdTo !== '') {
      query.andWhere('task.createdAt <= :createdTo', {
        createdTo: params.createdTo,
      });
    }

    if (params.updatedFrom && params.updatedFrom !== '') {
      query.andWhere('task.updatedAt >= :updatedFrom', {
        updatedFrom: params.updatedFrom,
      });
    }

    if (params.updatedTo && params.updatedTo !== '') {
      query.andWhere('task.updatedAt <= :updatedTo', {
        updatedTo: params.updatedTo,
      });
    }

    return query;
  }
}
