import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { DeleteResult, Repository } from 'typeorm';

import { I18nService } from 'nestjs-i18n';

import { ApiPaginatedResponse } from 'src/common/types/api-responses.interface';
import { Project } from 'src/projects/entities/project.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskPriority } from '../entities/task-priority.entity';
import { Task } from '../entities/task.entity';
import { TaskPriorityEnum } from '../enums/task-priority.enum';
import { TaskRepository } from '../repositories/task.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockPriorityRepository: jest.Mocked<Repository<TaskPriority>>;
  let mockClsService: jest.Mocked<ClsService>;
  let mockI18nService: jest.Mocked<I18nService>;

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      findAllWithParams: jest.fn(),
    } as any;

    mockPriorityRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    } as any;

    mockClsService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    mockI18nService = {
      t: jest.fn((key: string) => key),
      translate: jest.fn((key: string) => key),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: mockTaskRepository },
        { provide: getRepositoryToken(TaskPriority), useValue: mockPriorityRepository },
        { provide: ClsService, useValue: mockClsService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    mockClsService.get.mockReturnValue({ userId: 1 });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createDto: CreateTaskDto = { description: 'New Task Description', projectId: 1 };

      const mockPriority: TaskPriority = {
        id: 1,
        code: TaskPriorityEnum.LOW,
        color: '#green',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        translations: [],
      } as TaskPriority;

      const result: Task = {
        id: expect.any(Number),
        description: createDto.description,
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: expect.any(Date),
        dateModification: expect.any(Date),
        project: { id: 1 } as Project,
        assignedUsers: [],
        createdBy: { id: 1 } as any,
        priority: mockPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      mockTaskRepository.create.mockReturnValue(result);
      mockTaskRepository.save.mockResolvedValue(result);

      expect(await service.create(createDto)).toEqual(result);
      expect(mockClsService.get).toHaveBeenCalledWith('user');
    });
  });

  describe('findAll', () => {
    it('should return a paginated response of tasks', async () => {
      const mockTask: Task = {
        id: expect.any(Number),
        description: 'Test Task Description',
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: {} as Project,
        assignedUsers: [],
        createdBy: {} as any,
        priority: {} as TaskPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      const result: ApiPaginatedResponse<Task> = {
        items: [mockTask],
        pagination: {
          total: 1,
          page: 0,
          pageSize: 10,
          totalPages: 1,
        },
      };

      mockTaskRepository.findAllWithParams.mockResolvedValue([result.items, result.pagination.total]);

      const searchParams = { priorityIds: [], categoryIds: [], statusIds: [], assignedUserIds: [] };
      expect(await service.findAll(searchParams)).toEqual(result);
      // W findAll nie jest wywoływany mockClsService.get('user'), więc usuwam ten expect
      expect(mockTaskRepository.findAllWithParams).toHaveBeenCalledWith(
        searchParams,
        0,
        10,
        null,
      );
    });
  });

  describe('findAllByProjectId', () => {
    it('should return tasks for a specific project', async () => {
      const mockTask: Task = {
        id: expect.any(Number),
        description: 'Project Task Description',
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: {} as Project,
        assignedUsers: [],
        createdBy: {} as any,
        priority: {} as TaskPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      const result: ApiPaginatedResponse<Task> = {
        items: [mockTask],
        pagination: {
          total: 1,
          page: 0,
          pageSize: 10,
          totalPages: 1,
        },
      };
      mockTaskRepository.findAllWithParams.mockResolvedValue([result.items, result.pagination.total]);
      const searchParams = { priorityIds: [], categoryIds: [], statusIds: [], assignedUserIds: [] };
      expect(await service.findAllByProjectId(1, searchParams)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const result: Task = {
        id: expect.any(Number),
        description: 'Single Task Description',
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: {} as Project,
        assignedUsers: [],
        createdBy: {} as any,
        priority: {} as TaskPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;
      mockTaskRepository.findOneOrFail.mockResolvedValue(result);
      const expectedResult = {
        ...result,
        priority: { translations: [] },
      };
      expect(await service.findOne(1)).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto: UpdateTaskDto = { description: 'Updated Task Description' };
      const existingTask: Task = {
        id: 1,
        description: 'Old Description',
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: {} as Project,
        assignedUsers: [],
        createdBy: {} as any,
        priority: {} as TaskPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      const updatedTaskFull: Task = {
        ...existingTask,
        description: updateDto.description!,
        dateModification: expect.any(Date),
        priority: {
          id: 1,
          code: TaskPriorityEnum.LOW,
          color: '#green',
          isActive: true,
          dateCreation: expect.any(Date),
          dateModification: expect.any(Date),
          translations: [],
        },
      } as Task;

      mockTaskRepository.findOneOrFail.mockResolvedValue(existingTask);
      mockTaskRepository.save.mockResolvedValue(updatedTaskFull);

      const result = await service.update(1, updateDto);

      expect(mockTaskRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(mockTaskRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        description: updateDto.description,
      }));
      expect(result).toEqual(
        expect.objectContaining({
          ...updatedTaskFull,
          priority: expect.objectContaining({ translations: [] }),
        })
      );
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskToRemove: Task = {
        id: 1,
        description: 'Task to remove',
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: {} as Project,
        assignedUsers: [],
        createdBy: {} as any,
        priority: {} as TaskPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      mockTaskRepository.findOneOrFail.mockResolvedValue(taskToRemove);
      mockTaskRepository.remove.mockResolvedValue(taskToRemove);

      await service.remove(1);

      expect(mockTaskRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(mockTaskRepository.remove).toHaveBeenCalledWith(taskToRemove);
    });
  });

  describe('removeByProjectId', () => {
    it('should remove tasks by project id', async () => {
      const deleteResult: DeleteResult = { raw: [], affected: 1 };
      mockTaskRepository.delete.mockResolvedValue(deleteResult);
      await expect(service.removeByProjectId(1)).resolves.not.toThrow();
    });
  });
});
