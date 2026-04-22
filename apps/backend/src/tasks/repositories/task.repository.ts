import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { GetAllTasksSearchParamsDto } from '../dtos/get-all-tasks-search-params.dto';
import { Task } from '../entities/task.entity';
import { TaskSortByEnum } from '../enums/task-sort-by.enum';

const ACCESS_WHERE = `(
          (
            project.isPublic = true
            AND NOT EXISTS (
              SELECT 1 FROM project_user_role pur2 WHERE pur2.project_id = project.id AND pur2.user_id = :userId
            )
            AND task.access_role_id IS NULL
          )
          OR (
            project.isPublic = false
            AND pur.user_id = :userId
            AND task.access_role_id IS NULL
          )
          OR (
            pur.project_role_id = (SELECT id FROM project_role WHERE code = 'manager')
            OR (task.access_role_id IS NOT NULL AND pur.project_role_id = task.access_role_id)
            OR task.createdBy.id = :userId
          )
          OR (
            pur.project_role_id = (SELECT id FROM project_role WHERE code = 'client')
            AND (
              task.access_role_id IS NULL
              OR task.access_role_id = (SELECT id FROM project_role WHERE code = 'client')
              OR task.access_role_id = (SELECT id FROM project_role WHERE code = 'member')
            )
          )
        )`;

const SORT_COLUMN_MAP: Record<string, string> = {
  [TaskSortByEnum.DATE_CREATION]: 'task.dateCreation',
  [TaskSortByEnum.DATE_MODIFICATION]: 'task.dateModification',
  [TaskSortByEnum.DESCRIPTION]: 'task.description',
  [TaskSortByEnum.ID]: 'task.id',
};

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
      .leftJoinAndSelect('priority.translations', 'priorityTranslations')
      .leftJoinAndSelect('priorityTranslations.language', 'priorityLanguage')
      .leftJoinAndSelect('task.categories', 'categories')
      .leftJoinAndSelect('categories.translations', 'categoriesTranslations')
      .leftJoinAndSelect('categoriesTranslations.language', 'categoriesLanguage')
      .leftJoinAndSelect('task.status', 'status')
      .leftJoinAndSelect('status.translations', 'statusTranslations')
      .leftJoinAndSelect('statusTranslations.language', 'statusLanguage')
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
        'priorityTranslations.id',
        'priorityTranslations.name',
        'priorityTranslations.description',
        'priorityLanguage.id',
        'priorityLanguage.code',
        'categories.id',
        'categoriesTranslations.id',
        'categoriesTranslations.name',
        'categoriesTranslations.description',
        'categoriesLanguage.id',
        'categoriesLanguage.code',
        'status.id',
        'status.color',
        'statusTranslations.id',
        'statusTranslations.name',
        'statusTranslations.description',
        'statusLanguage.id',
        'statusLanguage.code',
        'accessRole.id',
      ]);

    this.applyAccessScope(query, userId, projectId);
    this.applyAttributeFilters(query, params);
    this.applySorting(query, params);
    this.applyDateFilters(query, params);

    query.skip(skip).take(take);

    return await query.getManyAndCount();
  }

  private applyAccessScope(query: SelectQueryBuilder<Task>, userId?: number | null, projectId?: number): void {
    if (userId) {
      query.leftJoin('project_user_role', 'pur', 'pur.project_id = project.id AND pur.user_id = :userId', { userId });
    }

    if (projectId && userId) {
      query.where(`project.id = :projectId AND ${ACCESS_WHERE}`, { projectId, userId });
    } else if (userId) {
      query.where(ACCESS_WHERE, { userId });
    } else if (projectId) {
      query.where('project.id = :projectId', { projectId });
    }
  }

  private applyAttributeFilters(query: SelectQueryBuilder<Task>, params: GetAllTasksSearchParamsDto): void {
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
  }

  private applySorting(query: SelectQueryBuilder<Task>, params: GetAllTasksSearchParamsDto): void {
    if (!params.sortBy || !params.orderBy) {
      query.orderBy('task.dateCreation', 'DESC');
      return;
    }

    const orderDirection = params.orderBy.toUpperCase() as 'ASC' | 'DESC';
    const column = SORT_COLUMN_MAP[params.sortBy];

    if (column) {
      query.orderBy(column, orderDirection);
    } else {
      query.orderBy('task.dateCreation', 'DESC');
    }
  }

  private applyDateFilters(query: SelectQueryBuilder<Task>, params: GetAllTasksSearchParamsDto): void {
    if (params.createdFrom && params.createdFrom !== '') {
      query.andWhere('task.dateCreation >= :createdFrom', { createdFrom: params.createdFrom });
    }

    if (params.createdTo && params.createdTo !== '') {
      query.andWhere('task.dateCreation <= :createdTo', { createdTo: params.createdTo });
    }

    if (params.updatedFrom && params.updatedFrom !== '') {
      query.andWhere('task.dateModification >= :updatedFrom', { updatedFrom: params.updatedFrom });
    }

    if (params.updatedTo && params.updatedTo !== '') {
      query.andWhere('task.dateModification <= :updatedTo', { updatedTo: params.updatedTo });
    }
  }
}
