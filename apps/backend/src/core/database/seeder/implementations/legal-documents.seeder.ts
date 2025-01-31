import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seeder } from '../../../../common/decorators/seeder.decorator';
import { PrivacyPolicy } from '../../../../terms-and-policies/entities/privacy-policy.entity';
import { Terms } from '../../../../terms-and-policies/entities/terms.entity';
import { LegalSectionType } from '../../../../terms-and-policies/enums/legal-section-type.enum';
import { Environment } from '../../../config/types/app.config.type';
import { ISeeder } from '../interfaces/seeder.interface';
import { BaseSeederService } from '../services/base-seeder.service';
import { SeederFactoryService } from '../services/seeder-factory.service';

@Injectable()
@Seeder({
  environment: [Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.TEST],
})
export class LegalDocumentsSeeder implements ISeeder {
  private readonly baseSeeder: BaseSeederService;

  constructor(
    @InjectRepository(Terms) private readonly termsRepository: Repository<Terms>,
    @InjectRepository(PrivacyPolicy) private readonly privacyPolicyRepository: Repository<PrivacyPolicy>,
    private readonly seederFactory: SeederFactoryService,
  ) {
    this.baseSeeder = this.seederFactory.createSeederService(LegalDocumentsSeeder.name);
  }

  async seed(): Promise<void> {
    await this.baseSeeder.execute(async (): Promise<void> => {
      const terms = this.termsRepository.create({
        version: '1.0',
        dateEffective: new Date(),
        sections: [
          {
            order: 1,
            type: LegalSectionType.HEADER,
            translations: [
              {
                languageCode: 'en',
                title: 'About the Application',
                content: 'This is a demonstration application created as part of a developers portfolio.',
              },
              {
                languageCode: 'pl',
                title: 'O Aplikacji',
                content: 'To jest aplikacja demonstracyjna stworzona jako część portfolio programisty.',
              },
            ],
          },
          {
            order: 2,
            type: LegalSectionType.LIST,
            translations: [
              {
                languageCode: 'en',
                title: 'Registration Requirements',
                items: [
                  'Valid email address for account verification',
                  'Secure password meeting specified requirements',
                ],
              },
              {
                languageCode: 'pl',
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
            type: LegalSectionType.PARAGRAPH,
            translations: [
              {
                languageCode: 'en',
                title: 'Demo Purpose',
                content:
                  'This is a portfolio demonstration application. While it implements real security features and data protection, it is primarily for demonstration purposes.',
              },
              {
                languageCode: 'pl',
                title: 'Cel Demonstracyjny',
                content:
                  'To jest aplikacja demonstracyjna w portfolio. Chociaż implementuje rzeczywiste funkcje bezpieczeństwa i ochrony danych, służy przede wszystkim celom demonstracyjnym.',
              },
            ],
          },
        ],
      });

      const privacyPolicy = this.privacyPolicyRepository.create({
        version: '1.0',
        dateEffective: new Date(),
        sections: [
          {
            order: 1,
            type: LegalSectionType.HEADER,
            translations: [
              {
                languageCode: 'en',
                title: 'Data Collection',
                content:
                  'For demonstration purposes, we collect only essential data required for the application functionality.',
              },
              {
                languageCode: 'pl',
                title: 'Zbieranie Danych',
                content:
                  'W celach demonstracyjnych zbieramy tylko niezbędne dane wymagane do funkcjonowania aplikacji.',
              },
            ],
          },
          {
            order: 2,
            type: LegalSectionType.LIST,
            translations: [
              {
                languageCode: 'en',
                title: 'Collected Information',
                items: [
                  'Email address (for verification only)',
                  'Password (stored in encrypted form)',
                ],
              },
              {
                languageCode: 'pl',
                title: 'Zbierane Informacje',
                items: [
                  'Adres email (tylko do weryfikacji)',
                  'Hasło (przechowywane w formie zaszyfrowanej)',
                ],
              },
            ],
          },
          {
            order: 3,
            type: LegalSectionType.PARAGRAPH,
            translations: [
              {
                languageCode: 'en',
                title: 'Data Usage',
                content:
                  'Your data is used solely to demonstrate the applications security features and email verification process.',
              },
              {
                languageCode: 'pl',
                title: 'Wykorzystanie Danych',
                content:
                  'Twoje dane są wykorzystywane wyłącznie do zademonstrowania funkcji bezpieczeństwa aplikacji i procesu weryfikacji email.',
              },
            ],
          },
        ],
      });

      await this.termsRepository.save(terms);
      await this.privacyPolicyRepository.save(privacyPolicy);

      this.baseSeeder.getLogger().log('Legal documents seeded');
    });
  }
}
