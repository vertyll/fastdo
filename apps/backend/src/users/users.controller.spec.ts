import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateProfile: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('updateProfile', () => {
    it('should update the user profile', async () => {
      const userId = 1;
      const updateProfileDto: UpdateProfileDto = { email: 'newemail@example.com' };
      const updatedUser: User = { id: userId, email: 'newemail@example.com' } as User;

      jest.spyOn(usersService, 'updateProfile').mockResolvedValue(updatedUser);

      const result = await usersController.updateProfile(userId, updateProfileDto);
      expect(result).toEqual(updatedUser);
      expect(usersService.updateProfile).toHaveBeenCalledWith(userId, updateProfileDto);
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user profile', async () => {
      const userId = 1;
      const user: User = { id: userId, email: 'user@example.com' } as User;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await usersController.getCurrentUser(userId);
      expect(result).toEqual(user);
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
    });
  });
});
