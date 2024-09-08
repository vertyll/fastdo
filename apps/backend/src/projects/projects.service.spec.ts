import { Test, TestingModule } from "@nestjs/testing";
import { ProjectsService } from "./projects.service";
import { ProjectRepository } from "./repositories/project.repository";
import { Project } from "./entities/project.entity";

describe("ProjectsService", () => {
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
        {
          provide: ProjectRepository,
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of projects", async () => {
      const result = [{ id: 1, name: "Test Project" }] as Project[];
      mockProjectRepository.findAllWithParams.mockResolvedValue(result);
      expect(await service.findAll({})).toBe(result);
    });
  });

  describe("create", () => {
    it("should create a new project", async () => {
      const createDto = { name: "New Project" };
      const result = { id: 1, ...createDto } as Project;
      mockProjectRepository.create.mockReturnValue(result);
      mockProjectRepository.save.mockResolvedValue(result);
      expect(await service.create(createDto)).toBe(result);
    });
  });

  describe("findOne", () => {
    it("should return a single project", async () => {
      const result = { id: 1, name: "Single Project" } as Project;
      mockProjectRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.findOne(1)).toBe(result);
    });
  });

  describe("update", () => {
    it("should update a project", async () => {
      const updateDto = { name: "Updated Project" };
      const result = { id: 1, ...updateDto } as Project;
      mockProjectRepository.update.mockResolvedValue(undefined);
      mockProjectRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.update(1, updateDto)).toBe(result);
    });
  });

  describe("remove", () => {
    it("should remove a project", async () => {
      mockProjectRepository.delete.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.not.toThrow();
    });
  });
});
