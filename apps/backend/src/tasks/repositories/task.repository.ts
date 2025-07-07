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
      .leftJoinAndSelect('task.assignedUsers', 'assignedUsers')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.priority', 'priority')
      .leftJoinAndSelect('task.categories', 'categories')
      .leftJoinAndSelect('task.status', 'status')
      .select([
        'task.id',
        'task.description',
        'task.additionalDescription',
        'task.priceEstimation',
        'task.workedTime',
        'task.accessRole',
        'task.dateCreation',
        'task.dateModification',
        'project.id',
        'project.name',
        'assignedUsers.id',
        'assignedUsers.email',
        'createdBy.id',
        'createdBy.email',
        'priority.id',
        'priority.code',
        'priority.color',
        'categories.id',
        'status.id',
      ]);

    if (projectId) {
      query.where('project.id = :projectId', { projectId });
    } else if (userId) {
      query.where('(assignedUsers.id = :userId OR task.createdBy.id = :userId)', { userId });
    }

    if (params.q) {
      query.andWhere('(task.description LIKE :q OR task.additionalDescription LIKE :q)', { q: `%${params.q}%` });
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
