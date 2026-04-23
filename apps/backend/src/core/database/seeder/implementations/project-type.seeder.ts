import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { ProjectTypeTranslation } from '../../../../projects/entities/project-type-translation.entity';
import { ProjectType } from '../../../../projects/entities/project-type.entity';
import { ProjectTypeEnum } from '../../../../projects/enums/project-type.enum';
import { EnvironmentEnum } from '../../../config/types/app.config.type';
import { Language } from '../../../language/entities/language.entity';
import { LanguageCodeEnum } from '../../../language/enums/language-code.enum';
import { ISeeder } from '../interfaces/seeder.interface';
import { BaseSeederService } from '../services/base-seeder.service';
import { SeederFactoryService } from '../services/seeder-factory.service';

@Injectable()
@Seeder({
  environment: [EnvironmentEnum.DEVELOPMENT, EnvironmentEnum.PRODUCTION],
})
export class ProjectTypeSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(ProjectType) private readonly projectTypeRepository: Repository<ProjectType>,
    @InjectRepository(ProjectTypeTranslation)
    private readonly projectTypeTranslationRepository: Repository<ProjectTypeTranslation>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(ProjectTypeSeeder.name);
  }

  public async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const languages = await this.languageRepository.find();
      if (languages.length === 0) {
        this.baseSeeder.getLogger().error('No languages found. Please run language seeder first.');
        return;
      }

      const polishLang = languages.find(lang => lang.code === LanguageCodeEnum.POLISH);
      const englishLang = languages.find(lang => lang.code === LanguageCodeEnum.ENGLISH);

      const projectTypesData = [
        {
          code: ProjectTypeEnum.TICKETS,
          isActive: true,
          translations: {
            pl: {
              name: 'Zgłoszenia',
              description: 'Projekt typu zgłoszenia - obsługa zgłoszeń użytkowników',
            },
            en: {
              name: 'Tickets',
              description: 'Ticket-type project - handling user tickets',
            },
          },
        },
        {
          code: ProjectTypeEnum.BACKLOG,
          isActive: true,
          translations: {
            pl: {
              name: 'Backlog',
              description: 'Projekt typu backlog - zarządzanie listą zadań do wykonania',
            },
            en: {
              name: 'Backlog',
              description: 'Backlog-type project - managing list of tasks to be completed',
            },
          },
        },
      ];

      for (const typeData of projectTypesData) {
        const projectType = await this.ensureProjectType(typeData.code, typeData.isActive);

        await this.ensureTranslation(projectType, typeData.code, polishLang, typeData.translations.pl, 'pl');
        await this.ensureTranslation(projectType, typeData.code, englishLang, typeData.translations.en, 'en');
      }
    });
  }

  private async ensureProjectType(code: ProjectTypeEnum, isActive: boolean): Promise<ProjectType> {
    const existing = await this.projectTypeRepository.findOne({ where: { code } });
    if (existing) {
      return existing;
    }

    const projectType = this.projectTypeRepository.create({ code, isActive });
    await this.projectTypeRepository.save(projectType);
    this.baseSeeder.getLogger().log(`Created project type: ${code}`);
    return projectType;
  }

  private async ensureTranslation(
    projectType: ProjectType,
    code: ProjectTypeEnum,
    language: Language | undefined,
    translationData: { name: string; description: string } | undefined,
    languageLabel: string,
  ): Promise<void> {
    if (!language || !translationData) {
      return;
    }

    const existingTranslation = await this.projectTypeTranslationRepository.findOne({
      where: {
        projectType: { id: projectType.id },
        language: { id: language.id },
      },
    });

    if (existingTranslation) {
      return;
    }

    const translation = this.projectTypeTranslationRepository.create({
      name: translationData.name,
      description: translationData.description,
      language,
      projectType,
    });
    await this.projectTypeTranslationRepository.save(translation);
    this.baseSeeder.getLogger().log(`Created translation for project type ${code} in ${languageLabel}`);
  }
}
