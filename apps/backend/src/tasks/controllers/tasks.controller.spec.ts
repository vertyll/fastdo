import { Test, TestingModule } from '@nestjs/testing';
import { ApiPaginatedResponse } from '../../common/types/api-responses.interface';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskPriority } from '../entities/task-priority.entity';
import { Task } from '../entities/task.entity';
import { TaskPriorityEnum } from '../enums/task-priority.enum';
import { TasksService } from '../services/tasks.service';
import { TasksController } from './tasks.controller';

describe('TasksController', () => {
  let controller: TasksController;
  let mockTasksService: jest.Mocked<TasksService>;

  beforeEach(async () => {
    mockTasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllByProjectId: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskDto: CreateTaskDto = {
        description: 'New Task Description',
        projectId: 1,
      };

      const mockPriority: TaskPriority = {
        id: 1,
        code: TaskPriorityEnum.LOW,
        color: '#green',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        translations: [],
      } as TaskPriority;

      const mockProject: Project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        isPublic: false,
        icon: null,
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        type: null,
        tasks: [],
        projectUsers: [],
        projectUserRoles: [],
        categories: [],
        statuses: [],
      } as Project;

      const createdTask: Task = {
        id: 1,
        description: taskDto.description,
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: mockProject,
        assignedUsers: [],
        createdBy: {} as User,
        priority: mockPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      mockTasksService.create.mockResolvedValue(createdTask);
      expect(await controller.create(taskDto)).toEqual(createdTask);
    });
  });

  describe('findAll', () => {
    it('should return a paginated response of tasks', async () => {
      const mockPriority: TaskPriority = {
        id: 1,
        code: TaskPriorityEnum.LOW,
        color: '#green',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        translations: [],
      } as TaskPriority;

      const result: ApiPaginatedResponse<Task> = {
        items: [
          {
            id: 1,
            description: 'Test Task Description',
            additionalDescription: undefined,
            priceEstimation: 0,
            workedTime: 0,
            accessRole: undefined,
            dateCreation: new Date(),
            dateModification: new Date(),
            project: {} as Project,
            assignedUsers: [],
            createdBy: {} as User,
            priority: mockPriority,
            categories: [],
            status: null,
            taskAttachments: [],
            comments: [],
          } as Task,
        ],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
      mockTasksService.findAll.mockResolvedValue(result);
      expect(await controller.findAll({})).toEqual(result);
    });
  });

  describe('findAllByProjectId', () => {
    it('should return tasks for a specific project', async () => {
      const mockPriority: TaskPriority = {
        id: 1,
        code: TaskPriorityEnum.LOW,
        color: '#green',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        translations: [],
      } as TaskPriority;

      const mockProject: Project = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        isPublic: false,
        icon: null,
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        type: null,
        tasks: [],
        projectUsers: [],
        projectUserRoles: [],
        categories: [],
        statuses: [],
      } as Project;

      const result: ApiPaginatedResponse<Task> = {
        items: [
          {
            id: 1,
            description: 'Project Task Description',
            additionalDescription: undefined,
            priceEstimation: 0,
            workedTime: 0,
            accessRole: undefined,
            dateCreation: new Date(),
            dateModification: new Date(),
            project: mockProject,
            assignedUsers: [],
            createdBy: {} as User,
            priority: mockPriority,
            categories: [],
            status: null,
            taskAttachments: [],
            comments: [],
          } as Task,
        ],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
      mockTasksService.findAllByProjectId.mockResolvedValue(result);
      expect(await controller.findAllByProjectId('1', {})).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const mockUser: User = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedPassword',
        refreshTokens: [],
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        userRoles: [],
        isEmailConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        dateTermsAcceptance: new Date(),
        datePrivacyPolicyAcceptance: new Date(),
        avatar: null,
        emailChangeToken: null,
        pendingEmail: null,
        emailChangeTokenExpiry: null,
        projectUsers: [],
        projectUserRoles: [],
        emailHistories: [],
      } as User;

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
        id: 1,
        description: 'Single Task Description',
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: {} as Project,
        assignedUsers: [],
        createdBy: mockUser,
        priority: mockPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      mockTasksService.findOne.mockResolvedValue(result);
      expect(await controller.findOne('1')).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto: UpdateTaskDto = { description: 'Updated Task Description' };
      const mockUser: User = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedPassword',
        refreshTokens: [],
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        userRoles: [],
        isEmailConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        dateTermsAcceptance: new Date(),
        datePrivacyPolicyAcceptance: new Date(),
        avatar: null,
        emailChangeToken: null,
        pendingEmail: null,
        emailChangeTokenExpiry: null,
        projectUsers: [],
        projectUserRoles: [],
        emailHistories: [],
      } as User;

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
        id: 1,
        description: updateDto.description!,
        additionalDescription: undefined,
        priceEstimation: 0,
        workedTime: 0,
        accessRole: undefined,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: {} as Project,
        assignedUsers: [],
        createdBy: mockUser,
        priority: mockPriority,
        categories: [],
        status: null,
        taskAttachments: [],
        comments: [],
      } as Task;

      mockTasksService.update.mockResolvedValue(result);
      expect(await controller.update('1', updateDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      await controller.remove('1');
      expect(mockTasksService.remove).toHaveBeenCalledWith(1);
    });
  });
});
