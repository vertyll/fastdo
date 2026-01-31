import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';
import { RoleEnum } from '../../common/enums/role.enum';
import { IMailService } from '../../core/mail/interfaces/mail-service.interface';
import { IMailServiceToken } from '../../core/mail/tokens/mail-service.token';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import { IRolesService } from '../../roles/interfaces/roles-service.interface';
import { RoleRepository } from '../../roles/repositories/role.repository';
import { IRolesServiceToken } from '../../roles/tokens/roles-service.token';
import { UserRole } from '../../users/entities/user-role.entity';
import { User } from '../../users/entities/user.entity';
import { IUsersService } from '../../users/interfaces/users-service.interface';
import { UserRepository } from '../../users/repositories/user.repository';
import { IUsersServiceToken } from '../../users/tokens/users-service.token';
import { ConfirmEmailChangeResponseDto } from '../dtos/confirm-email-change-response.dto';
import { ConfirmEmailResponseDto } from '../dtos/confirm-email-response.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { IAuthService } from '../interfaces/auth-service.interface';
import { IConfirmationTokenService } from '../interfaces/confirmation-token-service.interface';
import { IRefreshTokenService } from '../interfaces/refresh-token-service.interface';
import { IConfirmationTokenServiceToken } from '../tokens/confirmation-token-service.token';
import { IRefreshTokenServiceToken } from '../tokens/refresh-token-service.token';
import { JwtPayload } from '../types/jwt-payload.interface';
import { JwtRefreshPayload } from '../types/jwt-refresh-payload.interface';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(IUsersServiceToken) private readonly usersService: IUsersService,
    private readonly jwtService: JwtService,
    @Inject(IRolesServiceToken) private readonly rolesService: IRolesService,
    @Inject(IMailServiceToken) private readonly mailService: IMailService,
    @Inject(IConfirmationTokenServiceToken) private readonly confirmationTokenService: IConfirmationTokenService,
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
    @Inject(IRefreshTokenServiceToken) private readonly refreshTokensService: IRefreshTokenService,
  ) {}

  public async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _, ...result } = user;
    return result;
  }

  public async register(registerDto: RegisterDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
      if (existingUser) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.userAlreadyExists'));

      const role = await this.roleRepository.findOne({ where: { code: RoleEnum.User } });
      if (!role) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.roleNotFound'));

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
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }

  public async confirmEmail(token: string): Promise<ConfirmEmailResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email } = this.confirmationTokenService.verifyToken(token);
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user || user.isEmailConfirmed || user.confirmationToken !== token || !user.confirmationTokenExpiry) {
        return { success: false, email };
      }

      if (user.confirmationTokenExpiry < new Date()) {
        return { success: false, email };
      }

      await this.userRepository.update(user.id, {
        isEmailConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpiry: null,
      });

      await queryRunner.commitTransaction();
      return { success: true, email };
    } finally {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }

  public async confirmEmailChange(token: string): Promise<ConfirmEmailChangeResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email } = this.confirmationTokenService.verifyToken(token);
      const user = await this.userRepository.findOne({ where: { email } });

      if (user?.emailChangeToken !== token || !user.emailChangeTokenExpiry) {
        return { success: false, email };
      }

      if (user.emailChangeTokenExpiry < new Date()) {
        return { success: false, email };
      }

      await this.userRepository.update(user.id, {
        email: user.pendingEmail ?? user.email,
        emailChangeToken: null,
        emailChangeTokenExpiry: null,
        pendingEmail: null,
        dateModification: new Date(),
      });

      await this.refreshTokenRepository.delete({ user: { id: user.id } });

      await queryRunner.commitTransaction();
      return { success: true, email: user.pendingEmail ?? user.email };
    } finally {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }

  public async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidCredentials'));

    if (!user.isEmailConfirmed) throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.emailNotConfirmed'));

    const roles = await this.rolesService.getUserRoles(user.id);
    const accessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
    });

    const refreshToken = this.generateRefreshToken({
      sub: user.id,
    });

    await this.refreshTokensService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const decoded = this.jwtService.verify<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.get<string>('app.security.jwt.refreshToken.secret'),
      });

      const user = await queryRunner.manager.findOne(User, {
        where: { id: decoded.sub },
      });

      if (!user || !user.isActive || !user.isEmailConfirmed) {
        throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidRefreshToken'));
      }

      const validToken = await this.refreshTokensService.validateRefreshToken(user.id, refreshToken);
      await this.refreshTokensService.removeToken(validToken);

      const roles = await this.rolesService.getUserRoles(user.id);
      const newRefreshToken = this.generateRefreshToken({ sub: user.id });

      await this.refreshTokensService.saveRefreshToken(user.id, newRefreshToken);
      await queryRunner.commitTransaction();

      return {
        accessToken: this.generateAccessToken({
          sub: user.id,
          email: user.email,
          roles,
        }),
        refreshToken: newRefreshToken,
      };
    } finally {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }

  public async logout(userId: number, refreshToken: string): Promise<void> {
    const storedTokens = await this.refreshTokensService.getUserRefreshTokens(userId);
    const matchingToken = await this.refreshTokensService.findMatchingRefreshToken(storedTokens, refreshToken);

    if (matchingToken) {
      await this.refreshTokensService.removeToken(matchingToken);
    }
  }

  public async logoutFromAllDevices(userId: number): Promise<void> {
    await this.refreshTokensService.deleteAllUserTokens(userId);
  }

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) return;

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
        !user ||
        user.confirmationToken !== resetPasswordDto.token ||
        !user.confirmationTokenExpiry ||
        user.confirmationTokenExpiry < new Date()
      )
        throw new UnauthorizedException(this.i18n.t('messages.Auth.errors.invalidToken'));

      const saltRounds = this.configService.get<number>('app.security.bcryptSaltRounds') ?? 10;
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, saltRounds);

      await this.refreshTokenRepository.delete({ user: { id: user.id } });

      await this.userRepository.update(user.id, {
        password: hashedPassword,
        confirmationToken: null,
        confirmationTokenExpiry: null,
        dateModification: new Date(),
      });

      await queryRunner.commitTransaction();
    } finally {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('app.security.jwt.accessToken.secret'),
      expiresIn: this.configService.get('app.security.jwt.accessToken.expiresIn') || '15m',
    });
  }

  private generateRefreshToken(payload: JwtRefreshPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('app.security.jwt.refreshToken.secret'),
      expiresIn: this.configService.get('app.security.jwt.refreshToken.expiresIn') || '7d',
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredTokens(): Promise<void> {
    this.logger.log('Removing expired tokens...');
    const affected = await this.refreshTokensService.deleteExpiredTokens();
    this.logger.log(`Removed ${affected} expired tokens`);
  }
}
