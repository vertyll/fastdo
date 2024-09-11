import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesService } from "./roles.service";
import { Role } from "./entities/role.entity";
import { UserRole } from "../users/entities/user-role.entity";
import { RoleRepository } from "./repositories/role.repository";
import { UserRoleRepository } from "../users/repositories/user-role.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole])],
  providers: [RolesService, RoleRepository, UserRoleRepository],
  exports: [RolesService],
})
export class RolesModule {}
