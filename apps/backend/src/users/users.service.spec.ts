import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { DataSource, UpdateResult } from 'typeorm';
import { ConfirmationTokenService } from '../auth/confirmation-token.service';
import { FileFacade } from '../core/file/facade/file.facade';
import { MailService } from '../core/mail/services/mail.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UserRepository;
  let mailService: MailService;
  let i18nService: I18nService;
  let confirmationTokenService: ConfirmationTokenService;
  let queryRunner: any;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn(),
          update: jest.fn(),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmailChangeConfirmation: jest.fn(),
          },
        },
        {
          provide: FileFacade,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
        {
          provide: ConfirmationTokenService,
          useValue: {
            generateToken: jest.fn(),
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

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UserRepository>(UserRepository);
    mailService = module.get<MailService>(MailService);
    i18nService = module.get<I18nService>(I18nService);
    confirmationTokenService = module.get<ConfirmationTokenService>(ConfirmationTokenService);
  });

  describe('updateProfile', () => {
    it('should update the user profile successfully', async () => {
      const userId = 1;
      const updateProfileDto: UpdateProfileDto = { email: 'newemail@example.com' };
      const user: User = { id: userId, email: 'oldemail@example.com', password: 'hashedpassword' } as User;
      const updatedUser: User = { ...user, email: 'newemail@example.com' };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(queryRunner.manager.getRepository(User), 'update').mockResolvedValueOnce(
        { affected: 1 } as UpdateResult,
      );
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(updatedUser);
      jest.spyOn(confirmationTokenService, 'generateToken').mockReturnValue('token');
      jest.spyOn(mailService, 'sendEmailChangeConfirmation').mockResolvedValueOnce(undefined);

      const result = await service.updateProfile(updateProfileDto);

      expect(result).toEqual(updatedUser);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(3);
      expect(queryRunner.manager.getRepository(User).update).toHaveBeenCalledWith(userId, expect.any(Object));
      expect(mailService.sendEmailChangeConfirmation).toHaveBeenCalledWith('newemail@example.com', 'token');
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(i18nService, 't').mockReturnValue('User not found');

      await expect(service.updateProfile({} as UpdateProfileDto)).rejects.toThrow(NotFoundException);
      expect(i18nService.t).toHaveBeenCalledWith('messages.User.errors.userNotFound');
    });
  });
});
