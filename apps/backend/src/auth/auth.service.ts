import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { DataSource } from 'typeorm';
import { Role as RoleEnum } from '../common/enums/role.enum';
import { MailService } from '../core/mail/services/mail.service';
import { I18nTranslations } from '../generated/i18n/i18n.generated';
import { RoleRepository } from '../roles/repositories/role.repository';
import { RolesService } from '../roles/roles.service';
import { UserRole } from '../users/entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { ConfirmationTokenService } from './confirmation-token.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { IAuthService } from './interfaces/auth-service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    private readonly mailService: MailService,
    private readonly confirmationTokenService: ConfirmationTokenService,
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  public async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  public async register(registerDto: RegisterDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
      if (existingUser) {
        throw new UnauthorizedException(
          this.i18n.t('messages.Auth.errors.userAlreadyExists'),
        );
      }

      const role = await this.roleRepository.findOne({ where: { name: RoleEnum.User } });
      if (!role) {
        throw new UnauthorizedException(
          this.i18n.t('messages.Auth.errors.roleNotFound'),
        );
      }

      const { email, password, termsAccepted, privacyPolicyAccepted } = registerDto;
      const saltRounds = this.configService.get<number>('app.security.bcryptSaltRounds') ?? 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const confirmationToken = this.confirmationTokenService.generateToken(email);
      const confirmationTokenExpiry = new Date();
      confirmationTokenExpiry.setHours(confirmationTokenExpiry.getHours() + 24);

      const currentDate = new Date();

      const newUser = await queryRunner.manager.getRepository(User).save({
        email,
        password: hashedPassword,
        isEmailConfirmed: false,
        confirmationToken,
        confirmationTokenExpiry,
        termsAccepted,
        privacyPolicyAccepted,
        dateTermsAcceptance: termsAccepted ? currentDate : null,
        datePrivacyPolicyAcceptance: privacyPolicyAccepted ? currentDate : null,
      });

      await queryRunner.manager.getRepository(UserRole).save({
        user: { id: newUser.id },
        role: { id: role.id },
      });

      await this.mailService.sendConfirmationEmail(newUser.email, confirmationToken);

      await queryRunner.commitTransaction();
      return newUser;
    } finally {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      await queryRunner.release();
    }
  }

  public async confirmEmail(token: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email } = this.confirmationTokenService.verifyToken(token);

      const user = await this.userRepository.findOne({ where: { email } });

      if (
        !user
        || user.isEmailConfirmed
        || user.confirmationToken !== token
        || !user.confirmationTokenExpiry
      ) {
        throw new UnauthorizedException(
          this.i18n.t('messages.Auth.errors.invalidToken'),
        );
      }

      if (user.confirmationTokenExpiry < new Date()) {
        throw new UnauthorizedException(
          this.i18n.t('messages.Auth.errors.tokenExpired'),
        );
      }

      await this.userRepository.update(user.id, {
        isEmailConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null,
      });

      await queryRunner.commitTransaction();
    } finally {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      await queryRunner.release();
    }
  }

  public async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('messages.Auth.errors.invalidCredentials'),
      );
    }

    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException(
        this.i18n.t('messages.Auth.errors.emailNotConfirmed'),
      );
    }

    const roles = await this.rolesService.getUserRoles(user.id);
    const payload = { email: user.email, sub: user.id, roles };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
    };
  }

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return;
    }

    const resetToken = this.confirmationTokenService.generateToken(user.email);
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24);

    await this.userRepository.update(user.id, {
      confirmationToken: resetToken,
      confirmationTokenExpiry: resetTokenExpiry,
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email } = this.confirmationTokenService.verifyToken(resetPasswordDto.token);
      const user = await this.userRepository.findOne({ where: { email } });

      if (
        !user
        || user.confirmationToken !== resetPasswordDto.token
        || !user.confirmationTokenExpiry
        || user.confirmationTokenExpiry < new Date()
      ) {
        throw new UnauthorizedException(
          this.i18n.t('messages.Auth.errors.invalidToken'),
        );
      }

      const saltRounds = this.configService.get<number>('app.security.bcryptSaltRounds') ?? 10;
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, saltRounds);

      await this.userRepository.update(user.id, {
        password: hashedPassword,
        confirmationToken: null,
        confirmationTokenExpiry: null,
        dateModification: new Date(),
      });

      await queryRunner.commitTransaction();
    } finally {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      await queryRunner.release();
    }
  }
}
