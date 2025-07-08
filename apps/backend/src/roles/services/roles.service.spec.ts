import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n/i18n.generated';
import { UserRole } from 'src/users/entities/user-role.entity';
import { UserRoleRepository } from 'src/users/repositories/user-role.repository';
import { Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { RolesService } from './roles.service';

jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn().mockReturnValue({ lang: 'en' }),
  },
  I18nService: jest.fn().mockImplementation(() => ({
    translate: jest.fn(),
  })),
}));

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: jest.Mocked<RoleRepository>;
  let userRoleRepository: jest.Mocked<UserRoleRepository>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;

  beforeEach(async () => {
    const mockRoleRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockUserRoleRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const mockI18nService = {
      translate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
        {
          provide: UserRoleRepository,
          useValue: mockUserRoleRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get(RoleRepository);
    userRoleRepository = module.get(UserRoleRepository);
    i18nService = module.get(I18nService);
  });

  describe('findRoleByCode', () => {
    it('should find a role by code', async () => {
      const mockRole: Role = {
        id: 1,
        code: 'admin',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        userRoles: [],
        translations: [],
      } as Role;
      roleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.findRoleByCode('admin');

      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { code: 'admin' } });
      expect(result).toEqual(mockRole);
    });

    it('should return null if role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);

      const result = await service.findRoleByCode('nonexistent');

      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { code: 'nonexistent' } });
      expect(result).toBeNull();
    });
  });

  describe('addRoleToUser', () => {
    it('should add role to user successfully', async () => {
      const mockRole: Role = {
        id: 1,
        code: 'admin',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        userRoles: [],
        translations: [],
      } as Role;

      const mockUserRole: Partial<UserRole> = {
        id: 1,
        user: { id: 1 } as any,
        role: { id: 1 } as Role,
      };

      roleRepository.findOne.mockResolvedValue(mockRole);
      userRoleRepository.create.mockReturnValue(mockUserRole as UserRole);
      userRoleRepository.save.mockResolvedValue(mockUserRole as UserRole);

      await service.addRoleToUser(1, 'admin');

      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { code: 'admin' } });
      expect(userRoleRepository.create).toHaveBeenCalledWith({
        user: { id: 1 },
        role: { id: mockRole.id },
      });
      expect(userRoleRepository.save).toHaveBeenCalledWith(mockUserRole);
    });

    it('should throw NotFoundException with translated message if role does not exist', async () => {
      const roleCode = 'nonexistent';
      roleRepository.findOne.mockResolvedValue(null);
      i18nService.translate.mockReturnValue('Translated error message');

      await expect(service.addRoleToUser(1, roleCode))
        .rejects
        .toThrow(new NotFoundException('Translated error message'));

      expect(i18nService.translate).toHaveBeenCalledWith('messages.Roles.errors.roleNotFound', {
        args: { roleCode },
      });
      expect(userRoleRepository.create).not.toHaveBeenCalled();
      expect(userRoleRepository.save).not.toHaveBeenCalled();
    });

    it('should bubble up repository errors', async () => {
      const mockRole: Role = {
        id: 1,
        code: 'admin',
        isActive: true,
        dateCreation: new Date(),
        dateModification: new Date(),
        userRoles: [],
        translations: [],
      } as Role;
      roleRepository.findOne.mockResolvedValue(mockRole);
      userRoleRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.addRoleToUser(1, 'admin'))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles codes', async () => {
      const mockUserRoles: Partial<UserRole>[] = [
        {
          id: 1,
          role: { id: 1, code: 'admin' } as Role,
          user: { id: 1 } as any,
        },
        {
          id: 2,
          role: { id: 2, code: 'user' } as Role,
          user: { id: 1 } as any,
        },
      ];
      userRoleRepository.find.mockResolvedValue(mockUserRoles as UserRole[]);

      const result = await service.getUserRoles(1);

      expect(userRoleRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['role'],
      });
      expect(result).toEqual(['admin', 'user']);
    });

    it('should return empty array when user has no roles', async () => {
      userRoleRepository.find.mockResolvedValue([]);

      const result = await service.getUserRoles(1);

      expect(userRoleRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['role'],
      });
      expect(result).toEqual([]);
    });

    it('should bubble up repository errors', async () => {
      userRoleRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getUserRoles(1))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getAllRoles', () => {
    it('should return all active roles with translations', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      } as any;

      const mockRoles = [
        {
          id: 1,
          code: 'admin',
          translations: [{ name: 'Administrator', description: 'Admin role', language: { code: 'en' } }],
        },
        {
          id: 2,
          code: 'user',
          translations: [{ name: 'User', description: 'User role', language: { code: 'en' } }],
        },
      ];

      roleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockRoles);

      const result = await service.getAllRoles();

      expect(roleRepository.createQueryBuilder).toHaveBeenCalledWith('role');
      expect(result).toEqual([
        { id: 1, code: 'admin', name: 'Administrator', description: 'Admin role' },
        { id: 2, code: 'user', name: 'User', description: 'User role' },
      ]);
    });
  });
});
