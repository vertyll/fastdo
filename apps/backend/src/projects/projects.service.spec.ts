import { Test, TestingModule } from '@nestjs/testing';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ApiPaginatedResponse } from '../common/interfaces/api-responses.interface';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectRepository } from './repositories/project.repository';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;

  beforeEach(async () => {
    mockProjectRepository = {
      findAllWithParams: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectRepository, useValue: mockProjectRepository },
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
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = { name: 'New Project' };
      const result = { id: expect.any(Number), ...createDto } as Project;
      mockProjectRepository.create.mockReturnValue(result);
      mockProjectRepository.save.mockResolvedValue(result);
      expect(await service.create(createDto)).toEqual(result);
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
      mockProjectRepository.delete.mockResolvedValue(deleteResult);
      await expect(service.remove(1)).resolves.not.toThrow();
    });
  });
});
