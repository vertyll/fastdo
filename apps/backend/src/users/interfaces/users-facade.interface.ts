import { User } from '../entities/user.entity';

export interface IUsersFacade {
  findByEmail(email: string): Promise<User | null>;
}
