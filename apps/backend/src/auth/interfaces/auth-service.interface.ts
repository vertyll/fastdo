import { User } from '../../users/entities/user.entity';
import { ConfirmEmailResponseDto } from '../dtos/confirm-email-response.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';

export interface IAuthService {
  validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null>;
  register(registerDto: RegisterDto): Promise<User>;
  confirmEmail(token: string): Promise<ConfirmEmailResponseDto>;
  login(loginDto: LoginDto): Promise<LoginResponseDto>;
}
