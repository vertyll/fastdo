import { Test, TestingModule } from "@nestjs/testing";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { Task } from "./entities/task.entity";

describe("TasksController", () => {
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

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const taskDto = { name: "New Task", projectId: 1 };
      const createdTask: Task = {
        id: 1,
        ...taskDto,
        isDone: false,
        isUrgent: false,
        dateCreation: new Date(),
        dateModification: null,
        project: {
          id: 1,
          name: "Test Project",
          dateCreation: new Date(),
          dateModification: null,
          tasks: [],
        },
      };
      mockTasksService.create.mockResolvedValue(createdTask);

      expect(await controller.create(taskDto)).toEqual(createdTask);
    });
  });

  describe("findAll", () => {
    it("should return an array of tasks", async () => {
      const result: Task[] = [
        {
          id: 1,
          name: "Test Task",
          isDone: false,
          isUrgent: false,
          projectId: 1,
          dateCreation: new Date(),
          dateModification: null,
          project: null,
        },
      ];
      mockTasksService.findAll.mockResolvedValue(result);
      expect(await controller.findAll({})).toEqual(result);
    });
  });

  describe("findAllByProjectId", () => {
    it("should return tasks for a specific project", async () => {
      const result: Task[] = [
        {
          id: 1,
          name: "Project Task",
          isDone: false,
          isUrgent: false,
          projectId: 1,
          dateCreation: new Date(),
          dateModification: null,
          project: {
            id: 1,
            name: "Test Project",
            dateCreation: new Date(),
            dateModification: null,
            tasks: [],
          },
        },
      ];
      mockTasksService.findAllByProjectId.mockResolvedValue(result);
      expect(await controller.findAllByProjectId("1", {})).toEqual(result);
    });
  });

  describe("findOne", () => {
    it("should return a single task", async () => {
      const result: Task = {
        id: 1,
        name: "Single Task",
        isDone: false,
        isUrgent: false,
        projectId: 1,
        dateCreation: new Date(),
        dateModification: null,
        project: null,
      };
      mockTasksService.findOne.mockResolvedValue(result);
      expect(await controller.findOne("1")).toEqual(result);
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const updateDto = { name: "Updated Task" };
      const result: Task = {
        id: 1,
        ...updateDto,
        isDone: false,
        isUrgent: false,
        projectId: 1,
        dateCreation: new Date(),
        dateModification: new Date(),
        project: null,
      };
      mockTasksService.update.mockResolvedValue(result);
      expect(await controller.update("1", updateDto)).toEqual(result);
    });
  });

  describe("remove", () => {
    it("should remove a task", async () => {
      await controller.remove("1");
      expect(mockTasksService.remove).toHaveBeenCalledWith(1);
    });
  });
});
