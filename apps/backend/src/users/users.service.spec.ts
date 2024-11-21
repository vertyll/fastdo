import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: UserRepository;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUser = { email: 'new@example.com' };
      const mockCreatedUser = { id: 2, ...mockUser };
      mockRepository.create.mockReturnValue(mockCreatedUser);
      mockRepository.save.mockResolvedValue(mockCreatedUser);

      const result = await service.create(mockUser);
      expect(result).toEqual(mockCreatedUser);
      expect(mockRepository.create).toHaveBeenCalledWith(mockUser);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedUser);
    });
  });
});
