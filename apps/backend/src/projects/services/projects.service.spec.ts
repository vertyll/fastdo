import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { FileFacade } from 'src/core/file/facade/file.facade';
import { INotificationsService } from 'src/notifications/interfaces/notifications-service.interface';
import { INotificationsServiceToken } from 'src/notifications/tokens/notifications-service.token';
import { IUsersService } from 'src/users/interfaces/users-service.interface';
import { IUsersServiceToken } from 'src/users/tokens/users-service.token';
import { DataSource, DeleteResult, UpdateResult } from 'typeorm';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { ProjectRole } from '../entities/project-role.entity';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { Project } from '../entities/project.entity';
import { ProjectInvitationRepository } from '../repositories/project-invitation.repository';
import { ProjectUserRoleRepository } from '../repositories/project-user-role.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { ProjectRolesService } from './project-roles.service';
import { ProjectUserRolesService } from './project-user-roles.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockProjectRepository: jest.Mocked<ProjectRepository>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockClsService: jest.Mocked<ClsService>;
  let mockFileFacade: jest.Mocked<FileFacade>;
  let mockProjectRoleService: jest.Mocked<ProjectRolesService>;
  let mockNotificationService: jest.Mocked<INotificationsService>;
  let mockUsersService: jest.Mocked<IUsersService>;
  let mockProjectUserRoleService: jest.Mocked<ProjectUserRolesService>;
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
      getRepository: jest.fn().mockImplementation((entity: any) => {
        if (entity?.name === 'ProjectUserRole') {
          return {
            findOne: jest.fn().mockResolvedValue({
              projectRole: {
                code: 'manager',
                translations: [],
                permissions: [{ code: 'EDIT_PROJECT' }, { code: 'DELETE_PROJECT' }],
              },
            }),
            find: jest.fn().mockResolvedValue([]),
            remove: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
            delete: jest.fn(),
            update: jest.fn(),
          };
        }
        if (entity?.name === 'Project') {
          return {
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          };
        }
        return {
          findOne: jest.fn(),
          find: jest.fn(),
          save: jest.fn(),
          remove: jest.fn(),
          createQueryBuilder: jest.fn().mockReturnValue({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          }),
          delete: jest.fn(),
          update: jest.fn(),
        };
      }),
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

    const mockProjectUserRole = {
      id: 1,
      project: { id: 1 },
      user: { id: 1 },
      projectRole: {
        id: 1,
        code: 'manager',
        translations: [],
        permissions: [{ code: 'EDIT_PROJECT' }, { code: 'DELETE_PROJECT' }],
      },
    };

    const mockProjectUserRoleRepository = {
      find: jest.fn().mockResolvedValue([mockProjectUserRole]),
      findOne: jest.fn().mockResolvedValue(mockProjectUserRole),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProjectUserRole]),
      }),
      delete: jest.fn(),
      update: jest.fn(),
    };

    const mockNotificationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      delete: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectRepository, useValue: mockProjectRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: ClsService, useValue: mockClsService },
        { provide: FileFacade, useValue: mockFileFacade },
        { provide: ProjectRolesService, useValue: mockProjectRoleService },
        { provide: ProjectUserRolesService, useValue: mockProjectUserRoleService },
        { provide: ProjectInvitationRepository, useValue: mockProjectInvitationRepository },
        { provide: INotificationsServiceToken, useValue: mockNotificationService },
        { provide: IUsersServiceToken, useValue: mockUsersService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ProjectUserRoleRepository, useValue: mockProjectUserRoleRepository },
        { provide: 'NotificationRepository', useValue: mockNotificationRepository },
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
      const projects: Project[] = [{ id: 1, name: 'Test Project' } as Project];
      const total = 1;

      mockProjectRepository.findAllWithParams.mockResolvedValue([projects, total]);

      const expectedResult = {
        items: [
          {
            id: 1,
            name: 'Test Project',
            description: undefined,
            isPublic: undefined,
            icon: null,
            dateCreation: undefined,
            dateModification: undefined,
            type: undefined,
            isActive: undefined,
            permissions: ['EDIT_PROJECT', 'DELETE_PROJECT'],
          },
        ],
        pagination: {
          total,
          page: 0,
          pageSize: 10,
          totalPages: 1,
        },
      };

      expect(await service.findAll({})).toEqual(expectedResult);
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
        permissions: [],
      } as ProjectRole;

      mockProjectRoleService.findOneByCode.mockResolvedValue(mockManagerRole);

      mockQueryRunner.manager.getRepository.mockImplementation((entity: any) => {
        if (entity === Project) {
          return {
            create: jest.fn().mockReturnValue(mockNewProject),
            save: jest.fn().mockResolvedValue(mockNewProject),
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

      await expect(service.create(createDto)).rejects.toThrow('messages.Projects.errors.managerRoleNotFound');
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

      mockProjectRepository.findOne.mockResolvedValueOnce(mockProject).mockResolvedValueOnce(mockProject);

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

      mockProjectRepository.findOne.mockResolvedValueOnce(mockProject).mockResolvedValueOnce(mockProject);

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
