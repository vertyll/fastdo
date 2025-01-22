import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Role as RoleEnum } from '../common/enums/role.enum';
import { MailService } from '../core/mail/services/mail.service';
import { RoleRepository } from '../roles/repositories/role.repository';
import { RolesService } from '../roles/roles.service';
import { User } from '../users/entities/user.entity';
import { UserRoleRepository } from '../users/repositories/user-role.repository';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { ConfirmationTokenService } from './confirmation-token.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
    private readonly mailService: MailService,
    private readonly confirmationTokenService: ConfirmationTokenService,
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly configService: ConfigService,
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
        throw new UnauthorizedException('User already exists');
      }

      const role = await this.roleRepository.findOne({ where: { name: RoleEnum.User } });

      if (!role) {
        throw new UnauthorizedException('Role does not exist');
      }

      const { email, password } = registerDto;
      const saltRounds = this.configService.get<number>('app.security.bcryptSaltRounds') ?? 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const confirmationToken = this.confirmationTokenService.generateToken(email);
      const confirmationTokenExpiry = new Date();
      confirmationTokenExpiry.setHours(confirmationTokenExpiry.getHours() + 24);

      const newUser = await this.userRepository.save({
        email,
        password: hashedPassword,
        isEmailConfirmed: false,
        confirmationToken,
        confirmationTokenExpiry,
      });

      await this.userRoleRepository.save({
        user: { id: newUser.id },
        role: { id: role.id },
      });

      await this.mailService.sendConfirmationEmail(
        newUser.email,
        confirmationToken,
      );

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
        throw new UnauthorizedException('Invalid confirmation token');
      }

      if (user.confirmationTokenExpiry < new Date()) {
        throw new UnauthorizedException('Confirmation token expired');
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
      throw new UnauthorizedException();
    }

    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException('Please confirm your email first');
    }

    const roles = await this.rolesService.getUserRoles(user.id);
    const payload = { email: user.email, sub: user.id, roles };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
    };
  }
}
