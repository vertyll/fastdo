import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { RoleEnum } from '../../../../common/enums/role.enum';
import { Role } from '../../../../roles/entities/role.entity';
import { Environment } from '../../../config/types/app.config.type';
import { ISeeder } from '../interfaces/seeder.interface';
import { BaseSeederService } from '../services/base-seeder.service';
import { SeederFactoryService } from '../services/seeder-factory.service';

@Injectable()
@Seeder({
  environment: [Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.TEST],
})
export class RoleSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(RoleSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const roles: RoleEnum[] = [
        RoleEnum.Admin,
        RoleEnum.User,
      ];

      for (const roleName of roles) {
        const existingRole = await this.roleRepository.findOne({
          where: { name: roleName },
        });

        if (!existingRole) {
          const role = this.roleRepository.create({ name: roleName });
          await this.roleRepository.save(role);
          this.baseSeeder.getLogger().log(`Created role: ${roleName}`);
        }
      }
    });
  }
}
