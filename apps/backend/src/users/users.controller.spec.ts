import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './entities/user.entity';
import { IUsersService } from './interfaces/users-service.interface';
import { IUsersServiceToken } from './tokens/users-service.token';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: IUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: IUsersServiceToken,
          useValue: {
            updateProfile: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue({ userId: 1 }),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<IUsersService>(IUsersServiceToken);
  });

  describe('updateProfile', () => {
    it('should update the user profile', async () => {
      const userId = 1;
      const updateProfileDto: UpdateProfileDto = { email: 'newemail@example.com' };
      const updatedUser: User = { id: userId, email: 'newemail@example.com' } as User;

      jest.spyOn(usersService, 'updateProfile').mockResolvedValue(updatedUser);

      const result = await usersController.updateProfile(updateProfileDto);
      expect(result).toEqual(updatedUser);
      expect(usersService.updateProfile).toHaveBeenCalledWith(updateProfileDto);
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user profile', async () => {
      const userId = 1;
      const user: User = { id: userId, email: 'user@example.com' } as User;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await usersController.getCurrentUser();
      expect(result).toEqual(user);
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
    });
  });
});
