import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { ApiPaginatedResponse } from 'src/common/types/api-responses.interface';
import { CustomClsStore } from 'src/core/config/types/app.config.type';
import { ProjectCategory } from 'src/projects/entities/project-category.entity';
import { ProjectRole } from 'src/projects/entities/project-role.entity';
import { ProjectStatus } from 'src/projects/entities/project-status.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { CreateTaskCommentDto } from '../dtos/create-task-comment.dto';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { GetAllTasksSearchParams } from '../dtos/get-all-tasks-search-params.dto';
import { UpdateTaskCommentDto } from '../dtos/update-task-comment.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskComment } from '../entities/task-comment.entity';
import { TaskPriority } from '../entities/task-priority.entity';
import { Task } from '../entities/task.entity';
import { ITasksService } from '../interfaces/tasks-service.interface';
import { TaskRepository } from '../repositories/task.repository';

@Injectable()
export class TasksService implements ITasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cls: ClsService<CustomClsStore>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const userId = this.cls.get('user').userId;

    const taskData: any = {
      description: createTaskDto.description,
      additionalDescription: createTaskDto.additionalDescription,
      priceEstimation: createTaskDto.priceEstimation || 0,
      workedTime: createTaskDto.workedTime || 0,
      createdBy: { id: userId } as User,
      project: { id: createTaskDto.projectId } as Project,
    };

    if (createTaskDto.accessRoleId) {
      taskData.accessRole = { id: createTaskDto.accessRoleId } as ProjectRole;
    }

    if (createTaskDto.assignedUserIds && createTaskDto.assignedUserIds.length > 0) {
      taskData.assignedUsers = createTaskDto.assignedUserIds.map(id => ({ id } as User));
    } else {
      taskData.assignedUsers = [{ id: userId } as User];
    }

    if (createTaskDto.categoryIds && createTaskDto.categoryIds.length > 0) {
      taskData.categories = createTaskDto.categoryIds.map(id => ({ id } as ProjectCategory));
    }

    if (createTaskDto.statusId) {
      taskData.status = { id: createTaskDto.statusId } as ProjectStatus;
    }

    if (createTaskDto.priorityId) {
      taskData.priority = { id: createTaskDto.priorityId } as TaskPriority;
    }

    return this.taskRepository.save(taskData);
  }

  public async findAll(params: GetAllTasksSearchParams): Promise<ApiPaginatedResponse<Task>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize, userId);

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  public async findAllByProjectId(
    projectId: number,
    params: GetAllTasksSearchParams,
  ): Promise<ApiPaginatedResponse<Task>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;

    const [items, total] = await this.taskRepository.findAllWithParams(params, skip, pageSize, null, projectId);

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  public findOne(id: number): Promise<Task> {
    return this.taskRepository.findOneOrFail({
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
        'comments',
        'comments.author',
      ],
    });
  }

  public async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description;
    if (updateTaskDto.additionalDescription !== undefined) {
      task.additionalDescription = updateTaskDto.additionalDescription;
    }
    if (updateTaskDto.priceEstimation !== undefined) task.priceEstimation = updateTaskDto.priceEstimation;
    if (updateTaskDto.workedTime !== undefined) task.workedTime = updateTaskDto.workedTime;
    if (updateTaskDto.accessRoleId !== undefined) {
      task.accessRole = updateTaskDto.accessRoleId ? { id: updateTaskDto.accessRoleId } as ProjectRole : undefined;
    }

    if (updateTaskDto.assignedUserIds !== undefined) {
      task.assignedUsers = updateTaskDto.assignedUserIds.map(id => ({ id } as User));
    }

    if (updateTaskDto.categoryIds !== undefined) {
      task.categories = updateTaskDto.categoryIds.map(id => ({ id } as ProjectCategory));
    }

    if (updateTaskDto.statusId !== undefined) {
      task.status = updateTaskDto.statusId ? { id: updateTaskDto.statusId } as ProjectStatus : null;
    }

    if (updateTaskDto.priorityId !== undefined) {
      task.priority = { id: updateTaskDto.priorityId } as TaskPriority;
    }

    task.dateModification = new Date();

    return this.taskRepository.save(task);
  }

  public async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  public async removeByProjectId(projectId: number): Promise<void> {
    await this.taskRepository.delete({ project: { id: projectId } });
  }

  public async createComment(taskId: number, createCommentDto: CreateTaskCommentDto): Promise<TaskComment> {
    const userId = this.cls.get('user').userId;

    const comment = new TaskComment();
    comment.content = createCommentDto.content;
    comment.task = { id: taskId } as Task;
    comment.author = { id: userId } as User;

    // TODO: Handle attachments if provided in createCommentDto

    return this.taskRepository.manager.save(TaskComment, comment);
  }

  public async getTaskComments(taskId: number): Promise<TaskComment[]> {
    return this.taskRepository.manager.find(TaskComment, {
      where: { task: { id: taskId } },
      relations: ['author', 'commentAttachments'],
      order: { dateCreation: 'ASC' },
    });
  }

  public async removeComment(commentId: number): Promise<void> {
    const userId = this.cls.get('user').userId;

    const comment = await this.taskRepository.manager.findOne(TaskComment, {
      where: { id: commentId },
      relations: ['author', 'task'],
    });

    if (!comment) {
      throw new Error(this.i18n.t('messages.Tasks.errors.commentNotFound'));
    }

    // TODO: In the future, project owners/admins could also delete comments
    if (comment.author.id !== userId) {
      throw new Error(this.i18n.t('messages.Tasks.errors.commentNotYourOwn'));
    }

    await this.taskRepository.manager.delete(TaskComment, commentId);
  }

  public async updateComment(commentId: number, updateCommentDto: UpdateTaskCommentDto): Promise<TaskComment> {
    const userId = this.cls.get('user').userId;

    const comment = await this.taskRepository.manager.findOne(TaskComment, {
      where: { id: commentId },
      relations: ['author', 'task'],
    });

    if (!comment) {
      throw new Error(this.i18n.t('messages.Tasks.errors.commentNotFound'));
    }

    if (comment.author.id !== userId) {
      throw new Error(this.i18n.t('messages.Tasks.errors.commentNotYourOwn'));
    }

    comment.content = updateCommentDto.content;
    comment.dateModification = new Date();

    // TODO: Handle attachments if provided in updateCommentDto

    return this.taskRepository.manager.save(TaskComment, comment);
  }
}
