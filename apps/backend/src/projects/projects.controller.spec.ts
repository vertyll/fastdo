import { Test, TestingModule } from '@nestjs/testing';
import { ProjectManagementService } from './projects-managment.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockProjectsService;
  let mockProjectManagementService;

  beforeEach(async () => {
    mockProjectsService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockProjectManagementService = {
      removeProjectWithTasks: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: ProjectManagementService,
          useValue: mockProjectManagementService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of projects', async () => {
      const result = [{ id: 1, name: 'Test Project' }];
      mockProjectsService.findAll.mockResolvedValue(result);

      expect(await controller.getAll({})).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = { name: 'New Project' };
      const result = { id: 1, ...createDto };
      mockProjectsService.create.mockResolvedValue(result);
      expect(await controller.create(createDto)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const result = { id: 1, name: 'Single Project' };
      mockProjectsService.findOne.mockResolvedValue(result);
      expect(await controller.findOne('1')).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { name: 'Updated Project' };
      const result = { id: 1, ...updateDto };
      mockProjectsService.update.mockResolvedValue(result);
      expect(await controller.update('1', updateDto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a project with its tasks', async () => {
      const result = undefined;
      mockProjectManagementService.removeProjectWithTasks.mockResolvedValue(
        result,
      );
      expect(await controller.remove('1')).toBe(result);
    });
  });
});
