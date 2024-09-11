import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RolesService } from "../roles/roles.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
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
            findAll: jest.fn(),
            findById: jest.fn(),
            addRoleToUser: jest.fn(),
            getUserRoles: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    rolesService = module.get<RolesService>(RolesService);
  });

  it("should validate a user", async () => {
    const user = {
      id: 1,
      email: "test@example.com",
      password: await bcrypt.hash("password", 10),
      isActive: true,
      dateCreation: new Date(),
      dateModyfication: null,
      userRoles: [],
    };
    jest.spyOn(usersService, "findByEmail").mockResolvedValue(user);

    const result = await service.validateUser("test@example.com", "password");
    expect(result).toEqual({
      id: 1,
      email: "test@example.com",
      isActive: true,
      dateCreation: expect.any(Date),
      dateModyfication: null,
      userRoles: [],
    });
  });

  it("should return null for invalid user", async () => {
    jest.spyOn(usersService, "findByEmail").mockResolvedValue(null);

    const result = await service.validateUser(
      "test@example.com",
      "wrongpassword"
    );
    expect(result).toBeNull();
  });

  it("should login a user", async () => {
    const user = { id: 1, email: "test@example.com", password: "password" };
    jest.spyOn(service, "validateUser").mockResolvedValue(user);

    const token = "token";
    jest.spyOn(jwtService, "sign").mockReturnValue(token);

    const result = await service.login({
      email: user.email,
      password: user.password,
    });
    expect(result).toEqual({ access_token: token });
  });

  it("should register a user", async () => {
    const registerDto = { email: "test@example.com", password: "password" };
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

    jest.spyOn(usersService, "create").mockResolvedValue(newUser);
    jest.spyOn(rolesService, "addRoleToUser").mockResolvedValue(undefined);

    const result = await service.register(registerDto);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email", registerDto.email);
  });
});
