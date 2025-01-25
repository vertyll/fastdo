import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageModule } from '../core/language/language.module';
import { UserRole } from '../users/entities/user-role.entity';
import { UserRoleRepository } from '../users/repositories/user-role.repository';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole]), LanguageModule],
  providers: [RolesService, RoleRepository, UserRoleRepository],
  exports: [RolesService, UserRoleRepository, RoleRepository],
})
export class RolesModule {}
