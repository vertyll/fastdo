import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { User } from './entities/user.entity';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  providers: [UsersService, UserRepository, UserRoleRepository],
  exports: [UsersService, UserRepository, UserRoleRepository],
})
export class UsersModule {}
