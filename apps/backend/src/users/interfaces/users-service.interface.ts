import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../entities/user.entity';

export interface IUsersService {
  findOne(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateProfile(updateProfileDto: UpdateProfileDto): Promise<User | null>;
}
