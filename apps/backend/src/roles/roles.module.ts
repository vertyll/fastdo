import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '../users/entities/user-role.entity';
import { UserRoleRepository } from '../users/repositories/user-role.repository';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';
import { RolesService } from './roles.service';
import { IRolesServiceToken } from './tokens/roles-service.token';

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole])],
  providers: [
    {
      provide: IRolesServiceToken,
      useClass: RolesService,
    },
    RoleRepository,
    UserRoleRepository,
  ],
  exports: [IRolesServiceToken, UserRoleRepository, RoleRepository],
})
export class RolesModule {}
