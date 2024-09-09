import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should validate a user", async () => {
    const user = {
      id: 1,
      email: "test@example.com",
      password: await bcrypt.hash("password", 10),
      isActive: true,
    };
    jest.spyOn(usersService, "findByEmail").mockResolvedValue(user);

    const result = await service.validateUser("test@example.com", "password");
    expect(result).toEqual({ id: 1, email: "test@example.com", isActive: true });
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
    const user = { id: 1, email: "test@example.com" };
    const token = "token";
    jest.spyOn(jwtService, "sign").mockReturnValue(token);

    const result = await service.login(user);
    expect(result).toEqual({ access_token: token });
  });

  it("should register a user", async () => {
    const registerDto = { email: "test@example.com", password: "password" };
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    jest.spyOn(usersService, "create").mockResolvedValue({
      id: 1,
      email: registerDto.email,
      password: hashedPassword,
      isActive: true,
    });

    const result = await service.register(
      registerDto.email,
      registerDto.password
    );
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email", registerDto.email);
  });
});
