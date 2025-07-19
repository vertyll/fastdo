import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { ApiPaginatedResponse } from 'src/common/types/api-responses.interface';
import { CustomClsStore } from 'src/core/config/types/app.config.type';
import { FileFacade } from 'src/core/file/facade/file.facade';
import { ProjectCategory } from 'src/projects/entities/project-category.entity';
import { ProjectRole } from 'src/projects/entities/project-role.entity';
import { ProjectStatus } from 'src/projects/entities/project-status.entity';
import { Project } from 'src/projects/entities/project.entity';
import { ProjectRolePermissionEnum } from 'src/projects/enums/project-role-permission.enum';
import { ProjectRoleEnum } from 'src/projects/enums/project-role.enum';
import { User } from 'src/users/entities/user.entity';
import { DataSource, EntityManager, In } from 'typeorm';
import { TranslationDto } from '../../common/dtos/translation.dto';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { CreateTaskCommentDto } from '../dtos/create-task-comment.dto';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { GetAllTasksSearchParamsDto } from '../dtos/get-all-tasks-search-params.dto';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { UpdateTaskCommentDto } from '../dtos/update-task-comment.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskAttachment } from '../entities/task-attachment.entity';
import { TaskCommentAttachment } from '../entities/task-comment-attachment.entity';
import { TaskComment } from '../entities/task-comment.entity';
import { TaskPriority } from '../entities/task-priority.entity';
import { Task } from '../entities/task.entity';
import { ITasksService } from '../interfaces/tasks-service.interface';
import { TaskRepository } from '../repositories/task.repository';
import { TaskData } from '../types/tasks.types';

@Injectable()
export class TasksService implements ITasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cls: ClsService<CustomClsStore>,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly fileFacade: FileFacade,
    private readonly dataSource: DataSource,
  ) {}

  public async findAll(params: GetAllTasksSearchParamsDto): Promise<ApiPaginatedResponse<TaskResponseDto>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize, userId);

    const mappedItems = items.map(task => this.mapTaskToResponseDto(task));

    const hasMore = items.length === pageSize && (skip + pageSize) < total;

    return {
      items: mappedItems,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore,
      },
    };
  }

  public async findAllByProjectId(
    projectId: number,
    params: GetAllTasksSearchParamsDto,
  ): Promise<ApiPaginatedResponse<TaskResponseDto>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize, userId, projectId);

    const mappedItems = items.map(task => this.mapTaskToResponseDto(task));

    const hasMore = items.length === pageSize && (skip + pageSize) < total;

    return {
      items: mappedItems,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore,
      },
    };
  }

  public async findOne(id: number): Promise<TaskResponseDto> {
    const userId = this.cls.get('user').userId;
    const task = await this.taskRepository.findOneOrFail({
      where: { id },
      relations: [
        'project',
        'project.projectUserRoles',
        'project.projectUserRoles.user',
        'project.projectUserRoles.projectRole',
        'assignedUsers',
        'createdBy',
        'priority',
        'priority.translations',
        'categories',
        'categories.translations',
        'status',
        'status.translations',
        'accessRole',
        'accessRole.translations',
        'taskAttachments',
        'taskAttachments.file',
        'comments',
        'comments.author',
        'comments.commentAttachments',
        'comments.commentAttachments.file',
      ],
    });
    this.validateTaskAccess(task, userId);
    return this.mapTaskToResponseDto(task);
  }

  public async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userId = this.cls.get('user').userId;
      const taskData: TaskData = {
        description: createTaskDto.description,
        additionalDescription: createTaskDto.additionalDescription,
        priceEstimation: createTaskDto.priceEstimation || 0,
        workedTime: createTaskDto.workedTime || 0,
        createdBy: { id: userId } as User,
        project: { id: createTaskDto.projectId } as Project,
      };

      if (createTaskDto.accessRoleId) taskData.accessRole = { id: createTaskDto.accessRoleId } as ProjectRole;
      if (createTaskDto.assignedUserIds && createTaskDto.assignedUserIds?.length > 0) {
        taskData.assignedUsers = createTaskDto.assignedUserIds.map(id => ({ id } as User));
      } else {
        taskData.assignedUsers = [{ id: userId } as User];
      }
      if (createTaskDto.categoryIds && createTaskDto.categoryIds?.length > 0) {
        taskData.categories = createTaskDto.categoryIds.map(id => ({ id } as ProjectCategory));
      }
      if (createTaskDto.statusId) taskData.status = { id: createTaskDto.statusId } as ProjectStatus;
      if (createTaskDto.priorityId) taskData.priority = { id: createTaskDto.priorityId } as TaskPriority;

      const transactionalTaskRepository = queryRunner.manager.getRepository(Task);
      const savedTask = await transactionalTaskRepository.save(taskData);

      await this.processTaskAttachments(savedTask, createTaskDto.attachments, queryRunner.manager);

      await queryRunner.commitTransaction();
      return savedTask;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private validateTaskAccess(task: Task, userId: number): void {
    if (task.project && Array.isArray(task.project.projectUserRoles)) {
      const isCreator = task.createdBy && task.createdBy.id === userId;
      const isAssigned = Array.isArray(task.assignedUsers) && task.assignedUsers.some(u => u.id === userId);
      const userRole = task.project.projectUserRoles.find(ur => ur.user && ur.user.id === userId)?.projectRole;
      const isManager = userRole && userRole.code === ProjectRoleEnum.MANAGER;
      const isClient = userRole && userRole.code === ProjectRoleEnum.CLIENT;
      const isMember = userRole && userRole.code === ProjectRoleEnum.MEMBER;
      const hasRole = userRole && task.accessRole && userRole.id === task.accessRole.id;
      const hasManageTasksPermission = task.project.projectUserRoles.some(
        ur =>
          ur.user && ur.user.id === userId && Array.isArray(ur.projectRole.permissions)
          && ur.projectRole.permissions.some(p => p.code === ProjectRolePermissionEnum.MANAGE_TASKS),
      );

      // Manager sees everything
      if (isManager || hasManageTasksPermission) return;
      // Task creator sees everything
      if (isCreator || isAssigned) return;
      // If role is assigned, user can see tasks with that role
      if (hasRole) return;
      // Client sees tasks with accessRole null, client, member
      if (isClient) {
        if (
          !task.accessRole
          || (task.accessRole.code === ProjectRoleEnum.CLIENT)
          || (task.accessRole.code === ProjectRoleEnum.MEMBER)
        ) {
          return;
        }
      }
      // Team member sees tasks with accessRole null, member
      if (isMember) {
        if (!task.accessRole || task.accessRole.code === ProjectRoleEnum.MEMBER) {
          return;
        }
      }
      // User without role in public project sees only tasks with accessRole null
      const hasNoRole = !userRole;
      if (hasNoRole && task.project.isPublic && !task.accessRole) {
        return;
      }
      throw new Error(this.i18n.t('messages.Tasks.errors.accessDeniedToTask'));
    }
  }

  public async update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalTaskRepository = queryRunner.manager.getRepository(Task);
      const userId = this.cls.get('user').userId;

      const task = await transactionalTaskRepository.findOneOrFail({
        where: { id },
        relations: [
          'project',
          'assignedUsers',
          'createdBy',
          'accessRole',
          'taskAttachments',
          'taskAttachments.file',
        ],
      });

      this.validateTaskAccess(task, userId);

      Object.assign(task, {
        description: updateTaskDto.description ?? task.description,
        additionalDescription: updateTaskDto.additionalDescription ?? task.additionalDescription,
        priceEstimation: updateTaskDto.priceEstimation ?? task.priceEstimation,
        workedTime: updateTaskDto.workedTime ?? task.workedTime,
        dateModification: new Date(),
      });

      if (updateTaskDto.accessRoleId !== undefined) {
        if (updateTaskDto.accessRoleId === null) {
          task.accessRole = null;
        } else if (updateTaskDto.accessRoleId) {
          task.accessRole = { id: updateTaskDto.accessRoleId } as ProjectRole;
        }
      }
      if (updateTaskDto.assignedUserIds !== undefined) {
        task.assignedUsers = updateTaskDto.assignedUserIds.map(id => ({ id } as User));
      }
      if (updateTaskDto.categoryIds !== undefined) {
        task.categories = updateTaskDto.categoryIds.map(id => ({ id } as ProjectCategory));
      }
      if (updateTaskDto.statusId !== undefined) {
        task.status = updateTaskDto.statusId ? ({ id: updateTaskDto.statusId } as ProjectStatus) : null;
      }
      if (updateTaskDto.priorityId !== undefined) {
        task.priority = { id: updateTaskDto.priorityId } as TaskPriority;
      }

      if (updateTaskDto.attachmentsToDelete && updateTaskDto.attachmentsToDelete?.length > 0) {
        const idsToDelete = updateTaskDto.attachmentsToDelete;
        await this.processTaskAttachmentDeletion(task, idsToDelete, queryRunner.manager);
        if (task.taskAttachments) {
          task.taskAttachments = task.taskAttachments.filter(
            attachment => !idsToDelete.includes(attachment.file.id),
          );
        }
      }

      await transactionalTaskRepository.save(task);

      await this.processTaskAttachments(task, updateTaskDto.attachments, queryRunner.manager);

      const updatedTask = await transactionalTaskRepository.findOneOrFail({
        where: { id },
        relations: [
          'project',
          'assignedUsers',
          'createdBy',
          'priority',
          'priority.translations',
          'categories',
          'categories.translations',
          'status',
          'status.translations',
          'accessRole',
          'accessRole.translations',
          'taskAttachments',
          'taskAttachments.file',
          'comments',
          'comments.author',
          'comments.commentAttachments',
          'comments.commentAttachments.file',
        ],
      });

      await queryRunner.commitTransaction();
      return this.mapTaskToResponseDto(updatedTask);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalTaskRepository = queryRunner.manager.getRepository(Task);
      const userId = this.cls.get('user').userId;
      const task = await transactionalTaskRepository.findOneOrFail({
        where: { id },
        relations: ['project', 'createdBy', 'assignedUsers', 'accessRole'],
      });
      this.validateTaskAccess(task, userId);

      // TODO: delete attachments from disk
      await transactionalTaskRepository.remove(task);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async batchDelete(taskIds: number[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalTaskRepository = queryRunner.manager.getRepository(Task);
      const userId = this.cls.get('user').userId;

      const tasks = await transactionalTaskRepository.find({
        where: { id: In(taskIds) },
        relations: ['project', 'createdBy', 'assignedUsers', 'accessRole'],
      });

      if (tasks.length !== taskIds.length) {
        throw new Error('Some tasks not found');
      }
      tasks.forEach(task => this.validateTaskAccess(task, userId));

      await transactionalTaskRepository.remove(tasks);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async removeByProjectId(projectId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalTaskRepository = queryRunner.manager.getRepository(Task);
      await transactionalTaskRepository.delete({ project: { id: projectId } });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async createComment(taskId: number, createCommentDto: CreateTaskCommentDto): Promise<TaskComment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalCommentRepo = queryRunner.manager.getRepository(TaskComment);
      const userId = this.cls.get('user').userId;

      const comment = new TaskComment();
      comment.content = createCommentDto.content;
      comment.task = { id: taskId } as Task;
      comment.author = { id: userId } as User;

      const savedComment = await transactionalCommentRepo.save(comment);

      await this.processTaskCommentAttachments(savedComment, taskId, createCommentDto.attachments, queryRunner.manager);

      await queryRunner.commitTransaction();
      return savedComment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async removeComment(commentId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalCommentRepo = queryRunner.manager.getRepository(TaskComment);
      const userId = this.cls.get('user').userId;

      const comment = await transactionalCommentRepo.findOne({
        where: { id: commentId },
        relations: ['author', 'task'],
      });
      if (!comment) throw new Error(this.i18n.t('messages.Tasks.errors.commentNotFound'));
      if (comment.author.id !== userId) throw new Error(this.i18n.t('messages.Tasks.errors.commentNotYourOwn'));

      // TODO: delete attachments from disk
      await transactionalCommentRepo.delete(commentId);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async updateComment(commentId: number, updateCommentDto: UpdateTaskCommentDto): Promise<TaskComment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalCommentRepo = queryRunner.manager.getRepository(TaskComment);
      const userId = this.cls.get('user').userId;

      const comment = await transactionalCommentRepo.findOneOrFail({
        where: { id: commentId },
        relations: ['author', 'task', 'commentAttachments', 'commentAttachments.file'],
      });
      if (comment.author.id !== userId) {
        throw new Error(this.i18n.t('messages.Tasks.errors.commentNotYourOwn'));
      }

      comment.content = updateCommentDto.content;
      comment.dateModification = new Date();

      if (updateCommentDto.attachmentsToDelete && updateCommentDto.attachmentsToDelete?.length > 0) {
        const idsToDelete = updateCommentDto.attachmentsToDelete;
        await this.processTaskCommentAttachmentDeletion(comment, idsToDelete, queryRunner.manager);
        if (comment.commentAttachments) {
          comment.commentAttachments = comment.commentAttachments.filter(
            attachment => !idsToDelete.includes(attachment.file.id),
          );
        }
      }

      await transactionalCommentRepo.save(comment);

      if (updateCommentDto.attachments && updateCommentDto.attachments.length > 0) {
        await this.processTaskCommentAttachments(
          comment,
          comment.task.id,
          updateCommentDto.attachments,
          queryRunner.manager,
        );
      }

      const updatedComment = await transactionalCommentRepo.findOneOrFail({
        where: { id: commentId },
        relations: ['author', 'task', 'commentAttachments', 'commentAttachments.file'],
      });

      await queryRunner.commitTransaction();

      return updatedComment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async processTaskAttachments(
    task: Task,
    attachments: any[] | undefined,
    manager: EntityManager,
  ): Promise<void> {
    if (!attachments || attachments.length === 0) return;

    const attachmentRepo = manager.getRepository(TaskAttachment);

    const attachmentPromises = attachments.map(async file => {
      const uploadedFile = await this.fileFacade.upload(file, { path: `tasks/${task.id}` });
      const taskAttachment = new TaskAttachment();
      taskAttachment.task = task;
      taskAttachment.file = { id: uploadedFile.id } as any;
      return attachmentRepo.save(taskAttachment);
    });
    await Promise.all(attachmentPromises);
  }

  private async processTaskCommentAttachments(
    taskComment: TaskComment,
    taskId: number,
    attachments: any[] | undefined,
    manager: EntityManager,
  ): Promise<void> {
    if (!attachments || attachments.length === 0) return;

    const commentAttachmentRepo = manager.getRepository(TaskCommentAttachment);

    const attachmentPromises = attachments.map(async file => {
      const uploadedFile = await this.fileFacade.upload(file, { path: `tasks/${taskId}/comments/${taskComment.id}` });
      const commentAttachment = new TaskCommentAttachment();
      commentAttachment.comment = taskComment;
      commentAttachment.file = { id: uploadedFile.id } as any;
      return commentAttachmentRepo.save(commentAttachment);
    });
    await Promise.all(attachmentPromises);
  }

  private async processTaskAttachmentDeletion(
    task: Task,
    attachmentIds: string[],
    manager: EntityManager,
  ): Promise<void> {
    if (!attachmentIds || attachmentIds.length === 0) return;

    const attachmentRepo = manager.getRepository(TaskAttachment);
    const attachments = await attachmentRepo.find({
      where: { task: { id: task.id }, file: { id: In(attachmentIds) } },
      relations: ['file'],
    });

    const deletePromises = attachments.map(async attachment => {
      await this.fileFacade.delete(attachment.file.id);
      await attachmentRepo.remove(attachment);
    });
    await Promise.all(deletePromises);
  }

  private async processTaskCommentAttachmentDeletion(
    taskComment: TaskComment,
    attachmentIds: string[],
    manager: EntityManager,
  ): Promise<void> {
    if (!attachmentIds || attachmentIds.length === 0) return;

    const commentAttachmentRepo = manager.getRepository(TaskCommentAttachment);
    const attachments = await commentAttachmentRepo.find({
      where: { comment: { id: taskComment.id }, file: { id: In(attachmentIds) } },
      relations: ['file'],
    });

    const deletePromises = attachments.map(async attachment => {
      await this.fileFacade.delete(attachment.file.id);
      await commentAttachmentRepo.remove(attachment);
    });
    await Promise.all(deletePromises);
  }

  private mapTaskToResponseDto(task: Task): TaskResponseDto {
    const mapTranslations = this.mapTranslations;
    const accessRole = task.accessRole
      ? { ...task.accessRole, translations: mapTranslations(task.accessRole.translations) }
      : undefined;
    const priority = task.priority
      ? { ...task.priority, translations: mapTranslations(task.priority.translations) }
      : undefined;
    const categories = Array.isArray(task.categories)
      ? task.categories.map(cat => ({ ...cat, translations: mapTranslations(cat.translations) }))
      : [];
    const status = task.status
      ? { ...task.status, translations: mapTranslations(task.status.translations) }
      : null;

    const taskAttachments = Array.isArray(task.taskAttachments)
      ? task.taskAttachments.map(attachment => attachment.file)
      : [];

    const comments = Array.isArray(task.comments)
      ? task.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        dateCreation: comment.dateCreation,
        dateModification: comment.dateModification,
        author: comment.author,
        attachments: Array.isArray(comment.commentAttachments)
          ? comment.commentAttachments.map(attachment => attachment.file)
          : [],
      }))
      : [];

    return {
      id: task.id,
      description: task.description,
      additionalDescription: task.additionalDescription,
      priceEstimation: task.priceEstimation,
      workedTime: task.workedTime,
      accessRole,
      dateCreation: task.dateCreation,
      dateModification: task.dateModification,
      project: task.project,
      assignedUsers: task.assignedUsers,
      createdBy: task.createdBy,
      priority,
      categories,
      status,
      attachments: taskAttachments,
      comments: comments,
    };
  }

  private mapTranslations(translations: any[]): TranslationDto[] {
    if (!translations) return [];
    return translations.map(t => ({
      lang: t.language?.code || t.lang || '',
      name: t.name,
      description: t.description ?? undefined,
    }));
  }
}
