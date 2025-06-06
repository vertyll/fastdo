import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { IUsersFacade } from '../interfaces/users-facade.interface';
import { UsersService } from '../users.service';

@Injectable()
export class UsersFacadeService implements IUsersFacade {
  constructor(private readonly usersService: UsersService) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  public async findOne(id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }
}
