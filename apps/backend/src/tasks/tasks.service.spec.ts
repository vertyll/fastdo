import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";
import { TaskRepository } from "./repositories/task.repository";
import { Task } from "./entities/task.entity";
import { Project } from "../projects/entities/project.entity";

describe("TasksService", () => {
  let service: TasksService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllWithParams: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: mockTaskRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const createDto = { name: "New Task", projectId: 1 };
      const result = {
        id: expect.any(Number),
        ...createDto,
        isDone: false,
        isUrgent: false,
        dateCreation: expect.any(Date),
        dateModification: expect.any(Date),
        project: { id: 1 } as Project,
      } as Task;
      mockTaskRepository.create.mockReturnValue(result);
      mockTaskRepository.save.mockResolvedValue(result);
      expect(await service.create(createDto)).toEqual(result);
    });
  });

  describe("findAll", () => {
    it("should return an array of tasks", async () => {
      const result = [{ id: expect.any(Number), name: "Test Task" }] as Task[];
      mockTaskRepository.findAllWithParams.mockResolvedValue(result);
      expect(await service.findAll({})).toEqual(result);
    });
  });

  describe("findAllByProjectId", () => {
    it("should return tasks for a specific project", async () => {
      const result = [
        { id: expect.any(Number), name: "Project Task" },
      ] as Task[];
      mockTaskRepository.findAllWithParams.mockResolvedValue(result);
      expect(await service.findAllByProjectId(1, {})).toEqual(result);
    });
  });

  describe("findOne", () => {
    it("should return a single task", async () => {
      const result = { id: expect.any(Number), name: "Single Task" } as Task;
      mockTaskRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.findOne(1)).toEqual(result);
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const updateDto = { name: "Updated Task" };
      const result = { id: expect.any(Number), ...updateDto } as Task;
      mockTaskRepository.update.mockResolvedValue(undefined);
      mockTaskRepository.findOneOrFail.mockResolvedValue(result);
      expect(await service.update(1, updateDto)).toEqual(result);
    });
  });

  describe("remove", () => {
    it("should remove a task", async () => {
      mockTaskRepository.delete.mockResolvedValue(undefined);
      await expect(service.remove(1)).resolves.not.toThrow();
    });
  });

  describe("removeByProjectId", () => {
    it("should remove tasks by project id", async () => {
      mockTaskRepository.delete.mockResolvedValue(undefined);
      await expect(service.removeByProjectId(1)).resolves.not.toThrow();
    });
  });
});
