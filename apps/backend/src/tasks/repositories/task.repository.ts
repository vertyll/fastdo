import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GetAllTasksSearchParams } from '../dtos/get-all-tasks-search-params.dto';
import { Task } from '../entities/task.entity';

@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(private readonly dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  public async findAllWithParams(
    params: GetAllTasksSearchParams,
    skip: number,
    take: number,
    userId?: number | null,
    projectId?: number,
  ): Promise<[Task[], number]> {
    const query = this.dataSource
      .createQueryBuilder(Task, 'task')
      .leftJoinAndSelect('task.project', 'project')
      .select([
        'task.id',
        'task.name',
        'task.isDone',
        'task.isUrgent',
        'task.dateCreation',
        'task.dateModification',
        'task.isPrivate',
        'project.id',
        'project.name',
      ]);

    if (projectId) {
      query.where('project.id = :projectId', { projectId });
    } else {
      query.where('(task.isPrivate = :isPrivate AND task.user.id = :userId)', {
        isPrivate: true,
        userId,
      });
    }

    if (params.q) {
      query.andWhere('task.name LIKE :q', { q: `%${params.q}%` });
    }

    if (params.is_done === 'true') {
      query.andWhere('task.isDone = :isDone', { isDone: true });
    } else if (params.is_done === 'false') {
      query.andWhere('task.isDone = :isDone', { isDone: false });
    }

    if (params.is_urgent === 'true') {
      query.andWhere('task.isUrgent = :isUrgent', { isUrgent: true });
    }

    if (params.sortBy && params.orderBy) {
      query.orderBy(
        `task.${params.sortBy}`,
        params.orderBy.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      query.orderBy('task.dateCreation', 'DESC');
    }

    if (params.createdFrom && params.createdFrom !== '') {
      query.andWhere('task.dateCreation >= :createdFrom', {
        createdFrom: params.createdFrom,
      });
    }

    if (params.createdTo && params.createdTo !== '') {
      query.andWhere('task.dateCreation <= :createdTo', {
        createdTo: params.createdTo,
      });
    }

    if (params.updatedFrom && params.updatedFrom !== '') {
      query.andWhere('task.dateModification >= :updatedFrom', {
        updatedFrom: params.updatedFrom,
      });
    }

    if (params.updatedTo && params.updatedTo !== '') {
      query.andWhere('task.dateModification <= :updatedTo', {
        updatedTo: params.updatedTo,
      });
    }

    query.skip(skip).take(take);

    return query.getManyAndCount();
  }
}
