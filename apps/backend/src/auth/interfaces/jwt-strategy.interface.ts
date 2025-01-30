import { User } from '../../users/entities/user.entity';

export interface IJwtStrategy {
  validate(payload: any): Promise<User & { roles: string[]; }>;
}
