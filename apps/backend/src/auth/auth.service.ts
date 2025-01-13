import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { ValidatedUser } from '../common/interfaces/auth.interface';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly rolesService: RolesService,
  ) {}

  public async validateUser(email: string, password: string): Promise<ValidatedUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  public async register(registerDto: RegisterDto) {
    const user = await this.usersService.findByEmail(registerDto.email);
    if (user) {
      throw new UnauthorizedException('User already exists');
    }
    const role = await this.rolesService.findRoleByName(Role.User);
    if (!role) {
      throw new UnauthorizedException('Role does not exist');
    }

    const { email, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.create({
      email,
      password: hashedPassword,
    });
    await this.rolesService.addRoleToUser(newUser.id, Role.User);
    return newUser;
  }

  public async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }

    const roles = await this.rolesService.getUserRoles(user.id);
    const payload = { email: user.email, sub: user.id, roles };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }
}
