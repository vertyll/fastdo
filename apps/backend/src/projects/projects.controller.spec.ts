import { Test, TestingModule } from "@nestjs/testing";
import { ProjectManagementService } from "./projects-managment.service";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { Project } from "./entities/project.entity";

describe("ProjectsController", () => {
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

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAll", () => {
    it("should return an array of projects", async () => {
      const result: Project[] = [
        {
          id: 1,
          name: "Test Project",
          createdAt: new Date(),
          updatedAt: null,
          tasks: [],
        },
      ];
      mockProjectsService.findAll.mockResolvedValue(result);

      expect(await controller.getAll({})).toEqual(result);
    });
  });

  describe("create", () => {
    it("should create a new project", async () => {
      const createDto = { name: "New Project" };
      const result: Project = {
        id: 1,
        ...createDto,
        createdAt: new Date(),
        updatedAt: null,
        tasks: [],
      };
      mockProjectsService.create.mockResolvedValue(result);
      expect(await controller.create(createDto)).toEqual(result);
    });
  });

  describe("findOne", () => {
    it("should return a single project", async () => {
      const result: Project = {
        id: 1,
        name: "Single Project",
        createdAt: new Date(),
        updatedAt: null,
        tasks: [],
      };
      mockProjectsService.findOne.mockResolvedValue(result);
      expect(await controller.findOne("1")).toEqual(result);
    });
  });

  describe("update", () => {
    it("should update a project", async () => {
      const updateDto = { name: "Updated Project" };
      const result: Project = {
        id: 1,
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [],
      };
      mockProjectsService.update.mockResolvedValue(result);
      expect(await controller.update("1", updateDto)).toEqual(result);
    });
  });

  describe("remove", () => {
    it("should remove a project with its tasks", async () => {
      await controller.remove("1");
      expect(
        mockProjectManagementService.removeProjectWithTasks
      ).toHaveBeenCalledWith(1);
    });
  });
});
