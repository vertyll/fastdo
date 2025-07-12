import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GetAllTasksSearchParamsDto } from '../dtos/get-all-tasks-search-params.dto';
import { Task } from '../entities/task.entity';

@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(private readonly dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  public async findAllWithParams(
    params: GetAllTasksSearchParamsDto,
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
      .leftJoinAndSelect('task.accessRole', 'accessRole')
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
        'accessRole.id',
      ]);

    if (userId) {
      query.leftJoin('project_user_role', 'pur', 'pur.project_id = project.id AND pur.user_id = :userId', { userId });
    }

    if (projectId && userId) {
      query.where(
        `project.id = :projectId AND (
        pur.project_role_id = (SELECT id FROM project_role WHERE code = 'manager')
        OR (task.access_role_id IS NOT NULL AND pur.project_role_id = task.access_role_id)
        OR task.createdBy.id = :userId
      )`,
        { projectId, userId },
      );
    } else if (userId) {
      query.where(
        `(
        pur.project_role_id = (SELECT id FROM project_role WHERE code = 'manager')
        OR (task.access_role_id IS NOT NULL AND pur.project_role_id = task.access_role_id)
        OR task.createdBy.id = :userId
      )`,
        { userId },
      );
    } else if (projectId) {
      query.where('project.id = :projectId', { projectId });
    }

    if (params.priorityIds && params.priorityIds.length > 0) {
      query.andWhere('priority.id IN (:...pirorityIds)', { pirorityIds: params.priorityIds });
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
      query.andWhere('categories.id IN (:...categoryIds)', { categoryIds: params.categoryIds });
    }

    if (params.statusIds && params.statusIds.length > 0) {
      query.andWhere('status.id IN (:...statusIds)', { statusIds: params.statusIds });
    }

    if (params.assignedUserIds && params.assignedUserIds.length > 0) {
      query.andWhere('assignedUsers.id IN (:...assignedUserIds)', { assignedUserIds: params.assignedUserIds });
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

    const result = await query.getManyAndCount();

    return result;
  }
}
