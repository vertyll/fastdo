import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ClsService } from 'nestjs-cls';
import { I18nService } from 'nestjs-i18n';
import { IConfirmationTokenService } from 'src/auth/interfaces/confirmation-token-service.interface';
import { IRefreshTokenService } from 'src/auth/interfaces/refresh-token-service.interface';
import { IConfirmationTokenServiceToken } from 'src/auth/tokens/confirmation-token-service.token';
import { IRefreshTokenServiceToken } from 'src/auth/tokens/refresh-token-service.token';
import { CustomClsStore } from 'src/core/config/types/app.config.type';
import { FileFacade } from 'src/core/file/facade/file.facade';
import { IMailService } from 'src/core/mail/interfaces/mail-service.interface';
import { IMailServiceToken } from 'src/core/mail/tokens/mail-service.token';
import { I18nTranslations } from 'src/generated/i18n/i18n.generated';
import { DataSource, DeepPartial } from 'typeorm';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UserEmailHistory } from '../entities/user-email-history.entity';
import { User } from '../entities/user.entity';
import { IUsersService } from '../interfaces/users-service.interface';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    @Inject(IMailServiceToken) private readonly mailService: IMailService,
    private readonly fileFacade: FileFacade,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @Inject(IConfirmationTokenServiceToken) private readonly confirmationTokenService: IConfirmationTokenService,
    @Inject(IRefreshTokenServiceToken) private readonly refreshTokenService: IRefreshTokenService,
    private readonly cls: ClsService<CustomClsStore>,
  ) {}

  public async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['avatar'],
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  public async updateProfile(
    updateProfileDto: UpdateProfileDto,
  ): Promise<User | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userId = this.cls.get('user').userId;
      const user = await this.findOne(userId);
      if (!user) throw new NotFoundException(this.i18n.t('messages.User.errors.userNotFound'));

      const updateData: DeepPartial<User> = {
        dateModification: new Date(),
      };

      if (updateProfileDto.password) {
        const isPasswordValid = await bcrypt.compare(updateProfileDto.password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException(this.i18n.t('messages.User.errors.invalidPassword'));
      }

      if (updateProfileDto.newPassword) {
        const saltRounds = this.configService.get<number>('app.security.bcryptSaltRounds') ?? 10;
        updateData.password = await bcrypt.hash(updateProfileDto.newPassword, saltRounds);

        await this.refreshTokenService.deleteAllUserTokens(userId);
      }

      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingUser = await this.findByEmail(updateProfileDto.email);
        if (existingUser) throw new UnauthorizedException(this.i18n.t('messages.User.errors.emailAlreadyExists'));

        const emailChangeToken = this.confirmationTokenService.generateToken(user.email);
        const emailChangeTokenExpiry = new Date();
        emailChangeTokenExpiry.setHours(emailChangeTokenExpiry.getHours() + 24);

        await queryRunner.manager.getRepository(UserEmailHistory).save({
          oldEmail: user.email,
          newEmail: updateProfileDto.email,
          user: user,
        });

        updateData.emailChangeToken = emailChangeToken;
        updateData.pendingEmail = updateProfileDto.email;
        updateData.emailChangeTokenExpiry = emailChangeTokenExpiry;

        try {
          await this.mailService.sendEmailChangeConfirmation(
            updateProfileDto.email,
            emailChangeToken,
          );
        } catch {
          throw new UnauthorizedException(this.i18n.t('messages.User.errors.emailSendFailed'));
        }
      }

      if (updateProfileDto.avatar) {
        try {
          if (user.avatar) await this.fileFacade.delete(user.avatar.id);

          const { id: fileId } = await this.fileFacade.upload(updateProfileDto.avatar);

          updateData.avatar = { id: fileId };
        } catch {
          throw new UnauthorizedException(this.i18n.t('messages.User.errors.avatarUploadFailed'));
        }
      }

      await queryRunner.manager.getRepository(User).update(userId, updateData);
      await queryRunner.commitTransaction();

      return this.findOne(userId);
    } finally {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }
}
