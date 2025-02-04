import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ApiPaginatedResponse } from '../common/interfaces/api-responses.interface';
import { Project } from '../projects/entities/project.entity';
import { Task } from './entities/task.entity';
import { TaskRepository } from './repositories/task.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockClsService: jest.Mocked<ClsService>;

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllWithParams: jest.fn(),
    } as any;

    mockClsService = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: mockTaskRepository },
        { provide: ClsService, useValue: mockClsService },
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
      const createDto = { name: 'New Task', projectId: 1 };
      const result = {
        id: expect.any(Number),
        ...createDto,
        isDone: false,
        isUrgent: false,
        dateCreation: expect.any(Date),
        dateModification: expect.any(Date),
        project: { id: 1 } as Project,
        user: { id: 1 },
      } as Task;

      mockTaskRepository.create.mockReturnValue(result);
      mockTaskRepository.save.mockResolvedValue(result);

      expect(await service.create(createDto)).toEqual(result);
      expect(mockClsService.get).toHaveBeenCalledWith('user');
    });

    it('should create a private task when no projectId is provided', async () => {
      const createDto = { name: 'Private Task' };
      const result = {
        id: expect.any(Number),
        ...createDto,
        isDone: false,
        isUrgent: false,
        isPrivate: true,
        dateCreation: expect.any(Date),
        dateModification: expect.any(Date),
        user: { id: 1 },
      } as Task;

      mockTaskRepository.create.mockReturnValue(result);
      mockTaskRepository.save.mockResolvedValue(result);

      expect(await service.create(createDto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return a paginated response of tasks', async () => {
      const result: ApiPaginatedResponse<Task> = {
        items: [
          { id: expect.any(Number), name: 'Test Task' } as Task,
        ],
        pagination: {
          total: 1,
          page: 0,
          pageSize: 10,
          totalPages: 1,
        },
      };

      mockTaskRepository.findAllWithParams.mockResolvedValue([result.items, result.pagination.total]);

      expect(await service.findAll({})).toEqual(result);
      expect(mockClsService.get).toHaveBeenCalledWith('user');
      expect(mockTaskRepository.findAllWithParams).toHaveBeenCalledWith(
        {},
        0,
        10,
        1,
      );
    });
  });

  describe('findAllByProjectId', () => {
    it('should return tasks for a specific project', async () => {
      const result: ApiPaginatedResponse<Task> = {
        items: [
          { id: expect.any(Number), name: 'Project Task' } as Task,
        ],
        pagination: {
          total: 1,
          page: 0,
          pageSize: 10,
          totalPages: 1,
        },
      };
      mockTaskRepository.findAllWithParams.mockResolvedValue([result.items, result.pagination.total]);
      expect(await service.findAllByProjectId(1, {})).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const result = { id: expect.any(Number), name: 'Single Task' } as Task;
      mockTaskRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.findOne(1)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { name: 'Updated Task' };
      const result = { id: expect.any(Number), ...updateDto } as Task;
      const updateResult: UpdateResult = { generatedMaps: [], raw: [], affected: 1 };
      mockTaskRepository.update.mockResolvedValue(updateResult);
      mockTaskRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.update(1, updateDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const deleteResult: DeleteResult = { raw: [], affected: 1 };
      mockTaskRepository.delete.mockResolvedValue(deleteResult);
      await expect(service.remove(1)).resolves.not.toThrow();
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
