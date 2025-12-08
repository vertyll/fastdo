import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
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
export class LanguageSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(LanguageSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const existingLanguages = await this.languageRepository.find();
      if (existingLanguages.length > 0) {
        this.baseSeeder.getLogger().log('Languages already exist, skipping seeding');
        return;
      }

      const languages = [
        {
          code: LanguageCodeEnum.POLISH,
          name: 'Polski',
          isActive: true,
          isDefault: true,
        },
        {
          code: LanguageCodeEnum.ENGLISH,
          name: 'English',
          isActive: true,
          isDefault: false,
        },
      ];

      for (const languageData of languages) {
        const language = this.languageRepository.create(languageData);
        await this.languageRepository.save(language);
        this.baseSeeder.getLogger().log(`Created language: ${languageData.name} (${languageData.code})`);
      }
    });
  }
}
