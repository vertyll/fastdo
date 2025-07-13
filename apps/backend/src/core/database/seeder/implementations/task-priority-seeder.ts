import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { TaskPriorityTranslation } from '../../../../tasks/entities/task-priority-translation.entity';
import { TaskPriority } from '../../../../tasks/entities/task-priority.entity';
import { TaskPriorityEnum } from '../../../../tasks/enums/task-priority.enum';
import { Environment } from '../../../config/types/app.config.type';
import { Language } from '../../../language/entities/language.entity';
import { LanguageCodeEnum } from '../../../language/enums/language-code.enum';
import { ISeeder } from '../interfaces/seeder.interface';

@Injectable()
@Seeder({
  environment: [Environment.DEVELOPMENT, Environment.PRODUCTION],
})
export class TaskPrioritySeeder implements ISeeder {
  constructor(
    @InjectRepository(TaskPriority) private readonly priorityRepository: Repository<TaskPriority>,
    @InjectRepository(TaskPriorityTranslation) private readonly priorityTranslationRepository: Repository<
      TaskPriorityTranslation
    >,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
  ) {}

  async seed(): Promise<void> {
    const existingPriorities = await this.priorityRepository.count();
    if (existingPriorities > 0) {
      return;
    }

    const languages = await this.languageRepository.find();
    const polishLang = languages.find(lang => lang.code === LanguageCodeEnum.POLISH);
    const englishLang = languages.find(lang => lang.code === LanguageCodeEnum.ENGLISH);

    if (!polishLang || !englishLang) {
      throw new Error('Languages not found. Please run language seeder first.');
    }

    const prioritiesData = [
      {
        code: TaskPriorityEnum.LOW,
        color: '#10B981',
        translations: [
          { language: polishLang, name: 'Niski', description: 'Niski priorytet' },
          { language: englishLang, name: 'Low', description: 'Low priority' },
        ],
      },
      {
        code: TaskPriorityEnum.MEDIUM,
        color: '#F59E0B',
        translations: [
          { language: polishLang, name: 'Średni', description: 'Średni priorytet' },
          { language: englishLang, name: 'Medium', description: 'Medium priority' },
        ],
      },
      {
        code: TaskPriorityEnum.HIGH,
        color: '#EF4444',
        translations: [
          { language: polishLang, name: 'Wysoki', description: 'Wysoki priorytet' },
          { language: englishLang, name: 'High', description: 'High priority' },
        ],
      },
    ];

    for (const priorityData of prioritiesData) {
      const priority = this.priorityRepository.create({
        code: priorityData.code,
        color: priorityData.color,
      });

      const savedPriority = await this.priorityRepository.save(priority);

      for (const translationData of priorityData.translations) {
        const translation = this.priorityTranslationRepository.create({
          name: translationData.name,
          description: translationData.description,
          language: translationData.language,
          priority: savedPriority,
        });

        await this.priorityTranslationRepository.save(translation);
      }
    }
  }
}
