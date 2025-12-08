import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../types/jwt-payload.interface';

export interface IJwtStrategy {
  validate(payload: JwtPayload): Promise<User & { roles: string[] }>;
}
