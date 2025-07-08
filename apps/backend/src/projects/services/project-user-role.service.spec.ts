import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { AssignProjectRoleDto, UpdateProjectRoleDto } from '../dtos/project-user-role.dto';
import { ProjectUserRole } from '../entities/project-user-role.entity';
import { ProjectRoleEnum } from '../enums/project-role.enum';
import { ProjectUserRoleRepository } from '../repositories/project-user-role.repository';
import { ProjectUserRoleService } from './project-user-role.service';

describe('ProjectUserRoleService', () => {
  let service: ProjectUserRoleService;
  let mockProjectUserRoleRepository: jest.Mocked<ProjectUserRoleRepository>;
  let mockI18nService: jest.Mocked<I18nService<I18nTranslations>>;

  beforeEach(async () => {
    mockProjectUserRoleRepository = {
      findByProjectAndUser: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      findByProjectId: jest.fn(),
      findByUserId: jest.fn(),
      findOne: jest.fn(),
    } as any;

    mockI18nService = {
      t: jest.fn((key: string) => key),
      translate: jest.fn((key: string) => key),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectUserRoleService,
        { provide: ProjectUserRoleRepository, useValue: mockProjectUserRoleRepository },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<ProjectUserRoleService>(ProjectUserRoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignRole', () => {
    it('should update existing role when user already has a role in project', async () => {
      const assignDto: AssignProjectRoleDto = {
        projectId: 1,
        userId: 1,
        role: 2,
      };
      const existingRole = {
        id: 1,
        projectRole: { id: 1 },
      } as ProjectUserRole;
      const updatedRole = {
        id: 1,
        projectRole: { id: 2 },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(existingRole);
      mockProjectUserRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.assignRole(assignDto);

      expect(result).toEqual(updatedRole);
      expect(mockProjectUserRoleRepository.findByProjectAndUser).toHaveBeenCalledWith(1, 1);
      expect(mockProjectUserRoleRepository.save).toHaveBeenCalledWith({
        id: 1,
        projectRole: { id: 2 },
      });
    });

    it('should create new role when user does not have a role in project', async () => {
      const assignDto: AssignProjectRoleDto = {
        projectId: 1,
        userId: 1,
        role: 2,
      };
      const newRole = {
        id: 1,
        project: { id: 1 },
        user: { id: 1 },
        projectRole: { id: 2 },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(null);
      mockProjectUserRoleRepository.create.mockReturnValue(newRole);
      mockProjectUserRoleRepository.save.mockResolvedValue(newRole);

      const result = await service.assignRole(assignDto);

      expect(result).toEqual(newRole);
      expect(mockProjectUserRoleRepository.create).toHaveBeenCalledWith({
        project: { id: 1 },
        user: { id: 1 },
        projectRole: { id: 2 },
      });
      expect(mockProjectUserRoleRepository.save).toHaveBeenCalledWith(newRole);
    });
  });

  describe('updateRole', () => {
    it('should update existing role', async () => {
      const updateDto: UpdateProjectRoleDto = { role: 3 };
      const existingRole = {
        id: 1,
        projectRole: { id: 2 },
      } as ProjectUserRole;
      const updatedRole = {
        id: 1,
        projectRole: { id: 3 },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(existingRole);
      mockProjectUserRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.updateRole(1, 1, updateDto);

      expect(result).toEqual(updatedRole);
      expect(mockProjectUserRoleRepository.findByProjectAndUser).toHaveBeenCalledWith(1, 1);
      expect(mockProjectUserRoleRepository.save).toHaveBeenCalledWith({
        id: 1,
        projectRole: { id: 3 },
      });
    });

    it('should throw error when role does not exist', async () => {
      const updateDto: UpdateProjectRoleDto = { role: 3 };

      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(null);

      await expect(service.updateRole(1, 1, updateDto)).rejects.toThrow(
        'messages.ProjectUserRole.errors.roleNotFound'
      );
      expect(mockI18nService.t).toHaveBeenCalledWith('messages.ProjectUserRole.errors.roleNotFound');
    });
  });

  describe('removeRole', () => {
    it('should remove existing role', async () => {
      const existingRole = {
        id: 1,
        projectRole: { id: 2 },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(existingRole);
      mockProjectUserRoleRepository.remove.mockResolvedValue(existingRole);

      await service.removeRole(1, 1);

      expect(mockProjectUserRoleRepository.findByProjectAndUser).toHaveBeenCalledWith(1, 1);
      expect(mockProjectUserRoleRepository.remove).toHaveBeenCalledWith(existingRole);
    });

    it('should not throw error when role does not exist', async () => {
      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(null);

      await expect(service.removeRole(1, 1)).resolves.not.toThrow();
      expect(mockProjectUserRoleRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getProjectRoles', () => {
    it('should return all roles for a project', async () => {
      const projectRoles = [
        { id: 1, project: { id: 1 }, user: { id: 1 }, projectRole: { id: 2 } },
        { id: 2, project: { id: 1 }, user: { id: 2 }, projectRole: { id: 3 } },
      ] as ProjectUserRole[];

      mockProjectUserRoleRepository.findByProjectId.mockResolvedValue(projectRoles);

      const result = await service.getProjectRoles(1);

      expect(result).toEqual(projectRoles);
      expect(mockProjectUserRoleRepository.findByProjectId).toHaveBeenCalledWith(1);
    });
  });

  describe('getUserRoles', () => {
    it('should return all roles for a user', async () => {
      const userRoles = [
        { id: 1, project: { id: 1 }, user: { id: 1 }, projectRole: { id: 2 } },
        { id: 2, project: { id: 2 }, user: { id: 1 }, projectRole: { id: 3 } },
      ] as ProjectUserRole[];

      mockProjectUserRoleRepository.findByUserId.mockResolvedValue(userRoles);

      const result = await service.getUserRoles(1);

      expect(result).toEqual(userRoles);
      expect(mockProjectUserRoleRepository.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('getUserRoleInProject', () => {
    it('should return role id when user has role in project', async () => {
      const userRole = {
        id: 1,
        projectRole: { id: 2 },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(userRole);

      const result = await service.getUserRoleInProject(1, 1);

      expect(result).toBe(2);
      expect(mockProjectUserRoleRepository.findByProjectAndUser).toHaveBeenCalledWith(1, 1);
    });

    it('should return null when user has no role in project', async () => {
      mockProjectUserRoleRepository.findByProjectAndUser.mockResolvedValue(null);

      const result = await service.getUserRoleInProject(1, 1);

      expect(result).toBe(null);
    });
  });

  describe('getUserRoleCodeInProject', () => {
    it('should return role code when user has role in project', async () => {
      const userRole = {
        id: 1,
        projectRole: { id: 2, code: 'member' },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findOne.mockResolvedValue(userRole);

      const result = await service.getUserRoleCodeInProject(1, 1);

      expect(result).toBe('member');
      expect(mockProjectUserRoleRepository.findOne).toHaveBeenCalledWith({
        where: {
          project: { id: 1 },
          user: { id: 1 },
        },
        relations: ['projectRole'],
      });
    });

    it('should return null when user has no role in project', async () => {
      mockProjectUserRoleRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserRoleCodeInProject(1, 1);

      expect(result).toBe(null);
    });
  });

  describe('hasManagerRole', () => {
    it('should return true when user has manager role', async () => {
      const userRole = {
        id: 1,
        projectRole: { id: 1, code: ProjectRoleEnum.MANAGER },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findOne.mockResolvedValue(userRole);

      const result = await service.hasManagerRole(1, 1);

      expect(result).toBe(true);
    });

    it('should return false when user has different role', async () => {
      const userRole = {
        id: 1,
        projectRole: { id: 2, code: 'member' },
      } as ProjectUserRole;

      mockProjectUserRoleRepository.findOne.mockResolvedValue(userRole);

      const result = await service.hasManagerRole(1, 1);

      expect(result).toBe(false);
    });

    it('should return false when user has no role', async () => {
      mockProjectUserRoleRepository.findOne.mockResolvedValue(null);

      const result = await service.hasManagerRole(1, 1);

      expect(result).toBe(false);
    });
  });
});