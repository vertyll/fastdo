import { Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UserRepository } from "./repositories/user.repository";

@Injectable()
export class UsersService {
  constructor(private usersRepository: UserRepository) {}

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }
}
