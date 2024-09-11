import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call login method", async () => {
    const loginDto = { email: "test@example.com", password: "password" };
    jest
      .spyOn(authService, "login")
      .mockResolvedValue({ access_token: "token" });

    const result = await controller.login(loginDto);
    expect(result).toEqual({ access_token: "token" });
    expect(authService.login).toHaveBeenCalledWith(loginDto);
  });

  it("should call register method", async () => {
    const registerDto = { email: "test@example.com", password: "password" };
    jest.spyOn(authService, "register").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      password: "password",
      isActive: true,
      dateCreation: new Date(),
      dateModyfication: new Date(),
      userRoles: [],
    });

    const result = await controller.register(registerDto);
    expect(result).toEqual({
      id: 1,
      email: "test@example.com",
      password: "password",
      isActive: true,
      dateCreation: expect.any(Date),
      dateModyfication: expect.any(Date),
      userRoles: [],
    });
    expect(authService.register).toHaveBeenCalledWith(registerDto);
  });
});
