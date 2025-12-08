import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { PrivacyPolicy } from '../../../../terms-and-policies/entities/privacy-policy.entity';
import { Terms } from '../../../../terms-and-policies/entities/terms.entity';
import { LegalSectionTypeEnum } from '../../../../terms-and-policies/enums/legal-section-type.enum';
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
export class LegalDocumentsSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(Terms) private readonly termsRepository: Repository<Terms>,
    @InjectRepository(PrivacyPolicy) private readonly privacyPolicyRepository: Repository<PrivacyPolicy>,
    @InjectRepository(Language) private readonly languageRepository: Repository<Language>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(LegalDocumentsSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const languages = await this.languageRepository.find();
      if (languages.length === 0) {
        this.baseSeeder.getLogger().error('No languages found. Please run language seeder first.');
        return;
      }

      const polishLang = languages.find(lang => lang.code === LanguageCodeEnum.POLISH);
      const englishLang = languages.find(lang => lang.code === LanguageCodeEnum.ENGLISH);

      if (!polishLang || !englishLang) {
        this.baseSeeder.getLogger().error('Polish or English language not found.');
        return;
      }

      const existingTerms = await this.termsRepository.find();
      const existingPrivacyPolicy = await this.privacyPolicyRepository.find();

      if (existingTerms.length > 0 && existingPrivacyPolicy.length > 0) {
        this.baseSeeder.getLogger().log('Legal documents already exist, skipping seeding');
        return;
      }

      if (existingTerms.length === 0) {
        const terms = this.termsRepository.create({
          version: '1.0',
          dateEffective: new Date(),
          sections: [
            {
              order: 1,
              type: LegalSectionTypeEnum.HEADER,
              translations: [
                {
                  language: englishLang,
                  title: 'About the Application',
                  content: 'This is a demonstration application created as part of a developers portfolio.',
                },
                {
                  language: polishLang,
                  title: 'O Aplikacji',
                  content: 'To jest aplikacja demonstracyjna stworzona jako część portfolio programisty.',
                },
              ],
            },
            {
              order: 2,
              type: LegalSectionTypeEnum.LIST,
              translations: [
                {
                  language: englishLang,
                  title: 'Registration Requirements',
                  items: [
                    'Valid email address for account verification',
                    'Secure password meeting specified requirements',
                  ],
                },
                {
                  language: polishLang,
                  title: 'Wymagania Rejestracji',
                  items: [
                    'Prawidłowy adres email do weryfikacji konta',
                    'Bezpieczne hasło spełniające określone wymagania',
                  ],
                },
              ],
            },
            {
              order: 3,
              type: LegalSectionTypeEnum.PARAGRAPH,
              translations: [
                {
                  language: englishLang,
                  title: 'Demo Purpose',
                  content:
                    'This is a portfolio demonstration application. While it implements real security features and data protection, it is primarily for demonstration purposes.',
                },
                {
                  language: polishLang,
                  title: 'Cel Demonstracyjny',
                  content:
                    'To jest aplikacja demonstracyjna w portfolio. Chociaż implementuje rzeczywiste funkcje bezpieczeństwa i ochrony danych, służy przede wszystkim celom demonstracyjnym.',
                },
              ],
            },
          ],
        });

        await this.termsRepository.save(terms);
        this.baseSeeder.getLogger().log('Created Terms with translations');
      }

      if (existingPrivacyPolicy.length === 0) {
        const privacyPolicy = this.privacyPolicyRepository.create({
          version: '1.0',
          dateEffective: new Date(),
          sections: [
            {
              order: 1,
              type: LegalSectionTypeEnum.HEADER,
              translations: [
                {
                  language: englishLang,
                  title: 'Data Collection',
                  content:
                    'For demonstration purposes, we collect only essential data required for the application functionality.',
                },
                {
                  language: polishLang,
                  title: 'Zbieranie Danych',
                  content:
                    'W celach demonstracyjnych zbieramy tylko niezbędne dane wymagane do funkcjonowania aplikacji.',
                },
              ],
            },
            {
              order: 2,
              type: LegalSectionTypeEnum.LIST,
              translations: [
                {
                  language: englishLang,
                  title: 'Collected Information',
                  items: ['Email address (for verification only)', 'Password (stored in encrypted form)'],
                },
                {
                  language: polishLang,
                  title: 'Zbierane Informacje',
                  items: ['Adres email (tylko do weryfikacji)', 'Hasło (przechowywane w formie zaszyfrowanej)'],
                },
              ],
            },
            {
              order: 3,
              type: LegalSectionTypeEnum.PARAGRAPH,
              translations: [
                {
                  language: englishLang,
                  title: 'Data Usage',
                  content:
                    'Your data is used solely to demonstrate the applications security features and email verification process.',
                },
                {
                  language: polishLang,
                  title: 'Wykorzystanie Danych',
                  content:
                    'Twoje dane są wykorzystywane wyłącznie do zademonstrowania funkcji bezpieczeństwa aplikacji i procesu weryfikacji email.',
                },
              ],
            },
          ],
        });

        await this.privacyPolicyRepository.save(privacyPolicy);
        this.baseSeeder.getLogger().log('Created Privacy Policy with translations');
      }
    });
  }
}
