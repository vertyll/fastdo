import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { ApiPaginatedResponse } from 'src/common/types/api-responses.interface';
import { FileFacade } from 'src/core/file/facade/file.facade';
import { INotificationService } from 'src/notifications/interfaces/notification-service.interface';
import { INotificationServiceToken } from 'src/notifications/tokens/notification-service.token';
import { IUsersService } from 'src/users/interfaces/users-service.interface';
import { IUsersServiceToken } from 'src/users/tokens/users-service.token';
import { DataSource, DeleteResult, UpdateResult } from 'typeorm';
import { ProjectRole } from '../entities/project-role.entity';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { ProjectUser } from '../entities/project-user.entity';
import { Project } from '../entities/project.entity';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectInvitationRepository } from '../repositories/project-invitation.repository';
import { ProjectRoleService } from './project-role.service';
import { ProjectsService } from './projects.service';
import { ProjectUserRoleService } from './project-user-role.service';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockClsService: jest.Mocked<ClsService>;
  let mockFileFacade: jest.Mocked<FileFacade>;
  let mockProjectRoleService: jest.Mocked<ProjectRoleService>;
  let mockNotificationService: jest.Mocked<INotificationService>;
  let mockUsersService: jest.Mocked<IUsersService>;
  let mockProjectUserRoleService: jest.Mocked<ProjectUserRoleService>;
  let mockProjectInvitationRepository: any;
  let mockQueryRunner: any;
  let mockI18nService: jest.Mocked<I18nService<I18nTranslations>>;

  beforeEach(async () => {
    mockProjectUserRoleService = {
      getUserRoleCodeInProject: jest.fn(),
      hasManagerRole: jest.fn(),
      assignRole: jest.fn(),
      updateRole: jest.fn(),
      removeUser: jest.fn(),
    } as any;

    mockProjectInvitationRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          create: jest.fn().mockImplementation(entity => ({ id: 1, ...entity })),
          save: jest.fn().mockImplementation(entity => ({ id: 1, ...entity })),
          update: jest.fn().mockResolvedValue({ raw: [], affected: 1 }),
          delete: jest.fn().mockResolvedValue({ raw: [], affected: 1 }),
          findOne: jest.fn(),
        }),
      },
    };

    mockProjectRepository = {
      findAllWithParams: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      findOne: jest.fn(),
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

    mockFileFacade = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    } as any;

    mockProjectRoleService = {
      findOneByCode: jest.fn(),
      assignRoleToUserInProject: jest.fn(),
      removeUserFromProject: jest.fn(),
    } as any;

    mockNotificationService = {
      sendNotification: jest.fn(),
    } as any;

    mockUsersService = {
      findOne: jest.fn(),
    } as any;

    mockI18nService = {
      t: jest.fn((key: string) => key),
      translate: jest.fn((key: string) => key),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectRepository, useValue: mockProjectRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: ClsService, useValue: mockClsService },
        { provide: FileFacade, useValue: mockFileFacade },
        { provide: ProjectRoleService, useValue: mockProjectRoleService },
        { provide: ProjectUserRoleService, useValue: mockProjectUserRoleService },
        { provide: ProjectInvitationRepository, useValue: mockProjectInvitationRepository },
        { provide: INotificationServiceToken, useValue: mockNotificationService },
        { provide: IUsersServiceToken, useValue: mockUsersService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      const mockManagerRole: ProjectRole = {
        id: 1,
        code: 'manager',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        translations: [],
        userRoles: [],
      } as ProjectRole;

      mockProjectRoleService.findOneByCode.mockResolvedValue(mockManagerRole);

      mockQueryRunner.manager.getRepository.mockImplementation((entity: any) => {
        if (entity === Project) {
          return {
            create: jest.fn().mockReturnValue(mockNewProject),
            save: jest.fn().mockResolvedValue(mockNewProject),
          };
        }
        if (entity === ProjectUser) {
          return {
            create: jest.fn().mockReturnValue({
              id: 1,
              project: mockNewProject,
              user: { id: 1 },
            }),
            save: jest.fn().mockResolvedValue({
              id: 1,
              project: mockNewProject,
              user: { id: 1 },
            }),
          };
        }
        if (entity === ProjectUserRole) {
          return {
            save: jest.fn().mockResolvedValue({
              id: 1,
              project: mockNewProject,
              user: { id: 1 },
              projectRole: mockManagerRole,
            }),
          };
        }
        return {
          create: jest.fn(),
          save: jest.fn(),
        };
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
          return {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockRejectedValue(new Error('Test error')),
          };
        }
        return {
          create: jest.fn(),
          save: jest.fn(),
        };
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
      const mockProject = { id: 1, isPublic: false, projectUsers: [{ user: { id: 1 } }] } as any;
      const result = { id: 1, ...updateDto } as Project;
      const updateResult: UpdateResult = { generatedMaps: [], raw: [], affected: 1 };

      mockProjectRepository.findOne
        .mockResolvedValueOnce(mockProject)
        .mockResolvedValueOnce(mockProject);

      mockProjectRepository.findOneOrFail.mockResolvedValue(result);
      mockProjectRepository.update.mockResolvedValue(updateResult);

      expect(await service.update(1, updateDto)).toEqual(result);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw projectNotFound error if project does not exist', async () => {
      const updateDto = { name: 'Updated Project' };
      mockProjectRepository.findOne.mockResolvedValue(null);
      
      await expect(service.update(1, updateDto)).rejects.toThrow('messages.Projects.errors.projectNotFound');
    });
  });

  describe('remove', () => {
    it('should remove a project', async () => {
      const deleteResult: DeleteResult = { raw: [], affected: 1 };
      const mockProject = { id: 1, isPublic: false, projectUsers: [{ user: { id: 1 } }] } as any;

      mockProjectRepository.findOne
        .mockResolvedValueOnce(mockProject) 
        .mockResolvedValueOnce(mockProject); 

      mockQueryRunner.manager.getRepository.mockReturnValue({
        delete: jest.fn().mockResolvedValue(deleteResult),
      });

      await expect(service.remove(1)).resolves.not.toThrow();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw projectNotFound error if project does not exist', async () => {
      mockProjectRepository.findOne.mockResolvedValue(null);
      
      await expect(service.remove(1)).rejects.toThrow('messages.Projects.errors.projectNotFound');
    });
  });
});