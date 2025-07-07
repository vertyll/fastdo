import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { RoleEnum } from '../../../../common/enums/role.enum';
import { RoleTranslation } from '../../../../roles/entities/role-translation.entity';
import { Role } from '../../../../roles/entities/role.entity';
import { Environment } from '../../../config/types/app.config.type';
import { Language } from '../../../language/entities/language.entity';
import { ISeeder } from '../interfaces/seeder.interface';
import { BaseSeederService } from '../services/base-seeder.service';
import { SeederFactoryService } from '../services/seeder-factory.service';

@Injectable()
@Seeder({
  environment: [Environment.DEVELOPMENT, Environment.PRODUCTION],
})
export class RoleSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(RoleTranslation) private readonly roleTranslationRepository: Repository<RoleTranslation>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(RoleSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const languages = await this.languageRepository.find();

      const rolesData = [
        {
          code: RoleEnum.User,
          translations: {
            en: { name: 'User', description: 'Regular user with basic permissions' },
            pl: { name: 'Użytkownik', description: 'Zwykły użytkownik z podstawowymi uprawnieniami' },
          },
        },
        {
          code: RoleEnum.Manager,
          translations: {
            en: { name: 'Manager', description: 'Manager with extended permissions' },
            pl: { name: 'Menedżer', description: 'Menedżer z rozszerzonymi uprawnieniami' },
          },
        },
        {
          code: RoleEnum.Admin,
          translations: {
            en: { name: 'Administrator', description: 'Administrator with full permissions' },
            pl: { name: 'Administrator', description: 'Administrator z pełnymi uprawnieniami' },
          },
        },
      ];

      for (const roleData of rolesData) {
        let role = await this.roleRepository.findOne({
          where: { code: roleData.code },
          relations: ['translations'],
        });

        if (!role) {
          role = this.roleRepository.create({
            code: roleData.code,
            isActive: true,
            dateCreation: new Date(),
            dateModification: new Date(),
          });
          await this.roleRepository.save(role);
          this.baseSeeder.getLogger().log(`Created role: ${roleData.code}`);
        }

        for (const language of languages) {
          const translationData = roleData.translations[language.code];
          if (translationData) {
            const existingTranslation = await this.roleTranslationRepository.findOne({
              where: {
                role: { id: role.id },
                language: { id: language.id },
              },
            });

            if (!existingTranslation) {
              const translation = this.roleTranslationRepository.create({
                name: translationData.name,
                description: translationData.description,
                dateCreation: new Date(),
                dateModification: new Date(),
                role: role,
                language: language,
              });
              await this.roleTranslationRepository.save(translation);
              this.baseSeeder.getLogger().log(`Created translation for role ${roleData.code} in ${language.code}`);
            }
          }
        }
      }
    });
  }
}
