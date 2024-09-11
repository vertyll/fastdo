import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UserRepository } from "./repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserRole } from "./entities/user-role.entity";
import { UserRoleRepository } from "./repositories/user-role.repository";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])],
  providers: [UsersService, UserRepository, UserRoleRepository],
  exports: [UsersService, UserRepository, UserRoleRepository],
})
export class UsersModule {}
