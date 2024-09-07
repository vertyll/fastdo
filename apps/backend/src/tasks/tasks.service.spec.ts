import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { TaskQueryBuilder } from './utils/task-query.builder';

describe('TasksService', () => {
  let service: TasksService;
  let mockRepository;
  let mockQueryBuilder;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockQueryBuilder = {
      buildQuery: jest.fn().mockReturnValue({
        getMany: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
        {
          provide: TaskQueryBuilder,
          useValue: mockQueryBuilder,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskDto = { name: 'New Task', projectId: 1 };
      const createdTask = { id: 1, ...taskDto };
      mockRepository.create.mockReturnValue(createdTask);
      mockRepository.save.mockResolvedValue(createdTask);

      expect(await service.create(taskDto)).toBe(createdTask);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createDto = { name: 'New Task', projectId: 1 };
      const result = { id: 1, ...createDto };
      mockRepository.create.mockReturnValue(result);
      mockRepository.save.mockResolvedValue(result);
      expect(await service.create(createDto)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = [{ id: 1, name: 'Test Task' }];
      mockQueryBuilder.buildQuery().getMany.mockResolvedValue(result);
      expect(await service.findAll({})).toBe(result);
    });
  });

  describe('findAllByProjectId', () => {
    it('should return tasks for a specific project', async () => {
      const result = [{ id: 1, name: 'Project Task' }];
      mockQueryBuilder.buildQuery().getMany.mockResolvedValue(result);
      expect(await service.findAllByProjectId(1, {})).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const result = { id: 1, name: 'Single Task' };
      mockRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.findOne(1)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { name: 'Updated Task' };
      const result = { id: 1, ...updateDto };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.update(1, updateDto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockRepository.delete.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.not.toThrow();
    });
  });

  describe('removeByProjectId', () => {
    it('should remove tasks by project id', async () => {
      mockRepository.delete.mockResolvedValue(undefined);
      await expect(service.removeByProjectId(1)).resolves.not.toThrow();
    });
  });
});
