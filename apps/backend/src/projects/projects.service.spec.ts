import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { DataSource, DeleteResult, UpdateResult } from 'typeorm';
import { ApiPaginatedResponse } from '../common/types/api-responses.interface';
import { ProjectUser } from './entities/project-user.entity';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectRepository } from './repositories/project.repository';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockClsService: jest.Mocked<ClsService>;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn().mockImplementation(entity => ({ id: 1, ...entity })),
          delete: jest.fn().mockResolvedValue({ raw: [], affected: 1 }),
        }),
      },
    };

    mockProjectRepository = {
      findAllWithParams: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as any;

    mockClsService = {
      get: jest.fn().mockReturnValue({ userId: 1 }),
      set: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectRepository, useValue: mockProjectRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated response of projects', async () => {
      const projects: Project[] = [
        { id: 1, name: 'Test Project' } as Project,
      ];
      const total = 1;

      mockProjectRepository.findAllWithParams.mockResolvedValue([projects, total]);

      const result: ApiPaginatedResponse<Project> = {
        items: projects,
        pagination: {
          total,
          page: 0,
          pageSize: 10,
          totalPages: 1,
        },
      };

      expect(await service.findAll({})).toEqual(result);
      expect(mockClsService.get).toHaveBeenCalledWith('user');
      expect(mockProjectRepository.findAllWithParams).toHaveBeenCalledWith({}, 0, 10, 1);
    });
  });

  describe('create', () => {
    it('should create a new project and project user relation', async () => {
      const createDto = { name: 'New Project' };
      const mockNewProject = { id: 1, ...createDto };

      mockQueryRunner.manager.getRepository.mockImplementation((entity: typeof Project | typeof ProjectUser) => {
        if (entity === Project) {
          return { save: jest.fn().mockResolvedValue(mockNewProject) };
        }
        if (entity === ProjectUser) {
          return {
            save: jest.fn().mockResolvedValue({
              id: 1,
              project: mockNewProject,
              user: { id: 1 },
            }),
          };
        }
        return { save: jest.fn() };
      });

      const result = await service.create(createDto);

      expect(result).toEqual(mockNewProject);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockClsService.get).toHaveBeenCalledWith('user');
    });

    it('should rollback transaction on error', async () => {
      const createDto = { name: 'New Project' };

      mockQueryRunner.manager.getRepository.mockImplementation((entity: typeof Project | typeof ProjectUser) => {
        if (entity === Project) {
          return { save: jest.fn().mockRejectedValue(new Error('Test error')) };
        }
        return { save: jest.fn() };
      });

      await expect(service.create(createDto)).rejects.toThrow('Test error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const result = {
        id: expect.any(Number),
        name: 'Single Project',
      } as Project;
      mockProjectRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.findOne(1)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { name: 'Updated Project' };
      const result = { id: expect.any(Number), ...updateDto } as Project;
      const updateResult: UpdateResult = { generatedMaps: [], raw: [], affected: 1 };
      mockProjectRepository.update.mockResolvedValue(updateResult);
      mockProjectRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.update(1, updateDto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      const deleteResult: DeleteResult = { raw: [], affected: 1 };
      mockQueryRunner.manager.getRepository.mockReturnValue({
        delete: jest.fn().mockResolvedValue(deleteResult),
      });
      await expect(service.remove(1)).resolves.not.toThrow();
    });
  });
});
