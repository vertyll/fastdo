import { Test, TestingModule } from '@nestjs/testing';
import { ApiPaginatedResponse } from '../../common/types/api-responses.interface';
import { ProjectListResponseDto } from '../dtos/project-list-response.dto';
import { Project } from '../entities/project.entity';
import { ProjectManagementService } from '../services/projects-managment.service';
import { ProjectsService } from '../services/projects.service';
import { ProjectsController } from './projects.controller';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let mockProjectsService: jest.Mocked<ProjectsService>;
  let mockProjectManagementService: jest.Mocked<ProjectManagementService>;

  beforeEach(async () => {
    mockProjectsService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    mockProjectManagementService = {
      removeProjectWithTasks: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
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
    it('should return a paginated response of projects', async () => {
      const query = {
        typeIds: [],
        categoryIds: [],
        statusIds: [],
        userIds: [],
        search: undefined,
        page: 1,
        pageSize: 10,
        sort: undefined,
      };
      const result: ApiPaginatedResponse<ProjectListResponseDto> = {
        items: [
          {
            id: 1,
            name: 'Test Project',
            dateCreation: new Date(),
            dateModification: null,
            description: null,
            isPublic: false,
            icon: null,
            isActive: false,
            type: null,
            categories: [],
            statuses: [],
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
      mockProjectsService.findAll.mockResolvedValue(result);

      expect(await controller.getAll(query)).toEqual(result);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = { name: 'New Project' };
      const result: Project = {
        id: 1,
        ...createDto,
        dateCreation: new Date(),
        dateModification: null,
        tasks: [],
        description: null,
        isPublic: false,
        icon: null,
        isActive: false,
        type: null,
        projectUserRoles: [],
        categories: [],
        statuses: [],
      };
      mockProjectsService.create.mockResolvedValue(result);
      expect(await controller.create(createDto)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const result: Project = {
        id: 1,
        name: 'Single Project',
        dateCreation: new Date(),
        dateModification: null,
        tasks: [],
        description: null,
        isPublic: false,
        icon: null,
        isActive: false,
        type: null,
        projectUserRoles: [],
        categories: [],
        statuses: [],
      };
      mockProjectsService.findOne.mockResolvedValue(result);
      expect(await controller.findOne('1')).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { name: 'Updated Project' };
      const result: Project = {
        id: 1,
        ...updateDto,
        dateCreation: new Date(),
        dateModification: new Date(),
        tasks: [],
        description: null,
        isPublic: false,
        icon: null,
        isActive: false,
        type: null,
        projectUserRoles: [],
        categories: [],
        statuses: [],
      };
      mockProjectsService.update.mockResolvedValue(result);
      expect(await controller.update('1', updateDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a project with its tasks', async () => {
      await controller.remove('1');
      expect(
        mockProjectManagementService.removeProjectWithTasks,
      ).toHaveBeenCalledWith(1);
    });
  });
});
