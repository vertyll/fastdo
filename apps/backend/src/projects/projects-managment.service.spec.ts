import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks/tasks.service';
import { ProjectManagementService } from './projects-managment.service';
import { ProjectsService } from './projects.service';

describe('ProjectManagementService', () => {
  let service: ProjectManagementService;
  let mockProjectsService;
  let mockTasksService;

  beforeEach(async () => {
    mockProjectsService = {
      remove: jest.fn(),
    };

    mockTasksService = {
      removeByProjectId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectManagementService,
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    service = module.get<ProjectManagementService>(ProjectManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('removeProjectWithTasks', () => {
    it('should remove project and its tasks', async () => {
      const projectId = 1;
      await service.removeProjectWithTasks(projectId);

      expect(mockTasksService.removeByProjectId).toHaveBeenCalledWith(
        projectId,
      );
      expect(mockProjectsService.remove).toHaveBeenCalledWith(projectId);
    });
  });
});
