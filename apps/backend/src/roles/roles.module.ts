import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from '../users/entities/user-role.entity';
import { UserRoleRepository } from '../users/repositories/user-role.repository';
import { RolesController } from './controllers/roles.controller';
import { RoleTranslation } from './entities/role-translation.entity';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';
import { RolesService } from './services/roles.service';
import { IRolesServiceToken } from './tokens/roles-service.token';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RoleTranslation, UserRole])],
  controllers: [RolesController],
  providers: [
    {
      provide: IRolesServiceToken,
      useClass: RolesService,
    },
    RolesService,
    RoleRepository,
    UserRoleRepository,
  ],
  exports: [IRolesServiceToken, UserRoleRepository, RoleRepository],
})
export class RolesModule {}
