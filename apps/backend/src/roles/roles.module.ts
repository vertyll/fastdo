import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '../users/entities/user-role.entity';
import { UserRoleRepository } from '../users/repositories/user-role.repository';
import { Role } from './entities/role.entity';
import { RolesFacadeService } from './facades/roles-facade.service';
import { RoleRepository } from './repositories/role.repository';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole])],
  providers: [RolesService, RolesFacadeService, RoleRepository, UserRoleRepository],
  exports: [RolesFacadeService, UserRoleRepository, RoleRepository],
})
export class RolesModule {}
