import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findRoleByName: jest.fn(),
            addRoleToUser: jest.fn(),
            getUserRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    rolesService = module.get<RolesService>(RolesService);
  });

  it('should register a user', async () => {
    const registerDto = { email: 'test@example.com', password: 'password' };
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = {
      id: 1,
      email: registerDto.email,
      password: hashedPassword,
      isActive: true,
      dateCreation: new Date(),
      dateModyfication: null,
      userRoles: [],
    };

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(usersService, 'create').mockResolvedValue(newUser);
    jest.spyOn(rolesService, 'findRoleByName').mockResolvedValue({
      id: 1,
      name: Role.User,
      userRoles: [],
    });
    jest.spyOn(rolesService, 'addRoleToUser').mockResolvedValue(undefined);

    const result = await service.register(registerDto);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('email', registerDto.email);
  });
});
