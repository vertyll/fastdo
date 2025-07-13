import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { ProjectRoleTranslation } from '../../../../projects/entities/project-role-translation.entity';
import { ProjectRole } from '../../../../projects/entities/project-role.entity';
import { ProjectRoleEnum } from '../../../../projects/enums/project-role.enum';
import { Environment } from '../../../config/types/app.config.type';
import { Language } from '../../../language/entities/language.entity';
import { LanguageCodeEnum } from '../../../language/enums/language-code.enum';
import { ISeeder } from '../interfaces/seeder.interface';
import { BaseSeederService } from '../services/base-seeder.service';
import { SeederFactoryService } from '../services/seeder-factory.service';

@Injectable()
@Seeder({
  environment: [Environment.DEVELOPMENT, Environment.PRODUCTION],
})
export class ProjectRoleSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(ProjectRole) private readonly projectRoleRepository: Repository<ProjectRole>,
    @InjectRepository(ProjectRoleTranslation) private readonly projectRoleTranslationRepository: Repository<
      ProjectRoleTranslation
    >,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(ProjectRoleSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const existingRoles = await this.projectRoleRepository.find();
      if (existingRoles.length > 0) {
        this.baseSeeder.getLogger().log('Project roles already exist, skipping seeding');
        return;
      }

      const languages = await this.languageRepository.find();
      if (languages.length === 0) {
        this.baseSeeder.getLogger().error('No languages found. Please run language seeder first.');
        return;
      }

      const polishLang = languages.find(lang => lang.code === LanguageCodeEnum.POLISH);
      const englishLang = languages.find(lang => lang.code === LanguageCodeEnum.ENGLISH);

      const projectRolesData = [
        {
          code: ProjectRoleEnum.MANAGER,
          translations: [
            {
              language: polishLang,
              name: 'Menedżer',
              description: 'Zarządza projektem i ma pełne uprawnienia',
            },
            {
              language: englishLang,
              name: 'Manager',
              description: 'Manages the project and has full permissions',
            },
          ],
        },
        {
          code: ProjectRoleEnum.CLIENT,
          translations: [
            {
              language: polishLang,
              name: 'Klient',
              description: 'Klient projektu, może przeglądać postęp',
            },
            {
              language: englishLang,
              name: 'Client',
              description: 'Project client, can view progress',
            },
          ],
        },
        {
          code: ProjectRoleEnum.MEMBER,
          translations: [
            {
              language: polishLang,
              name: 'Członek zespołu',
              description: 'Członek zespołu pracujący nad projektem',
            },
            {
              language: englishLang,
              name: 'Team Member',
              description: 'Team member working on the project',
            },
          ],
        },
      ];

      for (const roleData of projectRolesData) {
        const projectRole = this.projectRoleRepository.create({
          code: roleData.code,
          isActive: true,
        });

        const savedRole = await this.projectRoleRepository.save(projectRole);

        for (const translationData of roleData.translations) {
          if (translationData.language) {
            const translation = this.projectRoleTranslationRepository.create({
              projectRole: savedRole,
              language: translationData.language,
              name: translationData.name,
              description: translationData.description,
            });

            await this.projectRoleTranslationRepository.save(translation);
          }
        }

        this.baseSeeder.getLogger().log(`Created project role: ${roleData.code}`);
      }

      this.baseSeeder.getLogger().log('Project roles seeding completed');
    });
  }
}
