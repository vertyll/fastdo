import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectQueryBuilder } from './repositories/project.repository';

describe('ProjectsService', () => {
  let service: ProjectsService;
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
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepository,
        },
        {
          provide: ProjectQueryBuilder,
          useValue: mockQueryBuilder,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const result = [{ id: 1, name: 'Test Project' }];
      mockQueryBuilder.buildQuery().getMany.mockResolvedValue(result);

      expect(await service.findAll({})).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const projectDto = { name: 'New Project' };
      const createdProject = { id: 1, ...projectDto };
      mockRepository.create.mockReturnValue(createdProject);
      mockRepository.save.mockResolvedValue(createdProject);

      expect(await service.create(projectDto)).toBe(createdProject);
    });
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const result = [{ id: 1, name: 'Test Project' }];
      mockQueryBuilder.buildQuery().getMany.mockResolvedValue(result);
      expect(await service.findAll({})).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createDto = { name: 'New Project' };
      const result = { id: 1, ...createDto };
      mockRepository.create.mockReturnValue(result);
      mockRepository.save.mockResolvedValue(result);
      expect(await service.create(createDto)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single project', async () => {
      const result = { id: 1, name: 'Single Project' };
      mockRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.findOne(1)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto = { name: 'Updated Project' };
      const result = { id: 1, ...updateDto };
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.update(1, updateDto)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      mockRepository.delete.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.not.toThrow();
    });
  });
});
