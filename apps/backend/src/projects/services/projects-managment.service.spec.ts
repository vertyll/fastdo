import { Test, TestingModule } from '@nestjs/testing';
import { ITasksService } from '../../tasks/interfaces/tasks-service.interface';
import { ITasksServiceToken } from '../../tasks/tokens/tasks-service.token';
import { ProjectManagementService } from './projects-managment.service';
import { ProjectsService } from './projects.service';

describe('ProjectManagementService', () => {
  let service: ProjectManagementService;
  let mockProjectsService: jest.Mocked<ProjectsService>;
  let mockTasksService: jest.Mocked<ITasksService>;

  beforeEach(async () => {
    mockProjectsService = {
      remove: jest.fn(),
    } as any;

    mockTasksService = {
      removeByProjectId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectManagementService,
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: ITasksServiceToken, useValue: mockTasksService },
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

      expect(mockTasksService.removeByProjectId).toHaveBeenCalledWith(projectId);
      expect(mockProjectsService.remove).toHaveBeenCalledWith(projectId);
    });

    it('should throw an error if task removal fails', async () => {
      const projectId = 1;
      const error = new Error('Task removal failed');
      mockTasksService.removeByProjectId.mockRejectedValue(error);

      await expect(service.removeProjectWithTasks(projectId)).rejects.toThrow('Task removal failed');
      expect(mockProjectsService.remove).not.toHaveBeenCalled();
    });

    it('should throw an error if project removal fails', async () => {
      const projectId = 1;
      const error = new Error('Project removal failed');
      mockProjectsService.remove.mockRejectedValue(error);

      await expect(service.removeProjectWithTasks(projectId)).rejects.toThrow('Project removal failed');
      expect(mockTasksService.removeByProjectId).toHaveBeenCalledWith(projectId);
    });
  });
});
