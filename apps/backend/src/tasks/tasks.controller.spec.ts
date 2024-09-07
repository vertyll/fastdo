import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let mockTasksService;

  beforeEach(async () => {
    mockTasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllByProjectId: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskDto = { name: 'New Task', projectId: 1 };
      const createdTask = { id: 1, ...taskDto };
      mockTasksService.create.mockResolvedValue(createdTask);

      expect(await controller.create(taskDto)).toBe(createdTask);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const result = [{ id: 1, name: 'Test Task' }];
      mockTasksService.findAll.mockResolvedValue(result);
      expect(await controller.findAll({})).toBe(result);
    });
  });

  describe('findAllByProjectId', () => {
    it('should return tasks for a specific project', async () => {
      const result = [{ id: 1, name: 'Project Task' }];
      mockTasksService.findAllByProjectId.mockResolvedValue(result);
      expect(await controller.findAllByProjectId('1', {})).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const result = { id: 1, name: 'Single Task' };
      mockTasksService.findOne.mockResolvedValue(result);
      expect(await controller.findOne('1')).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { name: 'Updated Task' };
      const result = { id: 1, ...updateDto };
      mockTasksService.update.mockResolvedValue(result);
      expect(await controller.update('1', updateDto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      const result = undefined;
      mockTasksService.remove.mockResolvedValue(result);
      expect(await controller.remove('1')).toBe(result);
    });
  });
});
