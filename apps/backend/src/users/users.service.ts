import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { DataSource, DeepPartial } from 'typeorm';
import { ConfirmationTokenService } from '../auth/confirmation-token.service';
import { FileService } from '../core/file/services/file.service';
import { MailService } from '../core/mail/services/mail.service';
import { I18nTranslations } from '../generated/i18n/i18n.generated';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UserEmailHistory } from './entities/user-email-history.entity';
import { User } from './entities/user.entity';
import { UserEmailHistoryRepository } from './repositories/user-email-history.repository';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly fileService: FileService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
    private readonly userEmailHistoryRepository: UserEmailHistoryRepository,
    private readonly dataSource: DataSource,
    private readonly confirmationTokenService: ConfirmationTokenService,
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

  public async findByConfirmationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { confirmationToken: token } });
  }

  public async getEmailHistory(userId: number): Promise<UserEmailHistory[]> {
    return this.userEmailHistoryRepository.find({
      where: { user: { id: userId } },
      order: { dateChange: 'DESC' },
    });
  }

  public async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  public async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
          if (user.avatar) await this.fileService.deleteFile(user.avatar.id);

          const { id: fileId } = await this.fileService.uploadFile(updateProfileDto.avatar);

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
