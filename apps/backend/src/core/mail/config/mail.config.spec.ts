import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n/i18n.generated';
import { MailConfig } from '../../config/types/app.config.type';
import { IMailConfig } from '../interfaces/mail-config.interface';
import { MailConfigService } from './mail.config';

describe('MailConfigService', () => {
  let service: MailConfigService;
  let configService: jest.Mocked<ConfigService>;
  let i18nService: jest.Mocked<I18nService<I18nTranslations>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailConfigService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          } as Partial<jest.Mocked<ConfigService>>,
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => {
              const translations: Record<string, string> = {
                'messages.Mail.errors.missingMailConfiguration': 'Missing mail configuration',
              };
              return translations[key] || key;
            }),
          } as Partial<jest.Mocked<I18nService<I18nTranslations>>>,
        },
      ],
    }).compile();

    service = module.get<MailConfigService>(MailConfigService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    i18nService = module.get<I18nService>(I18nService) as jest.Mocked<I18nService<I18nTranslations>>;
  });

  describe('getConfig', () => {
    it('should return the mail configuration', () => {
      const mailConfig: MailConfig = {
        dev: { host: '', port: 0 },
        templatesPath: '',
        host: 'smtp.example.com',
        port: 587,
        user: 'user',
        password: 'password',
        from: 'noreply@example.com',
      };
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(mailConfig);

      const expectedConfig: IMailConfig = {
        host: 'smtp.example.com',
        port: 587,
        user: 'user',
        password: 'password',
        from: 'noreply@example.com',
      };

      const result: IMailConfig = service.getConfig();

      expect(result).toEqual(expectedConfig);
    });

    it('should throw an error if mail configuration is missing required fields', () => {
      const mailConfig: MailConfig = {
        dev: { host: '', port: 0 },
        templatesPath: '',
        host: '',
        port: 0,
        user: 'user',
        password: 'password',
        from: '',
      };
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(mailConfig);
      jest.spyOn(i18nService, 't').mockReturnValue('Missing mail configuration');

      expect(() => service.getConfig()).toThrow('Missing mail configuration');
    });
  });

  describe('getDevConfig', () => {
    it('should return the development mail configuration', () => {
      const mailConfig: MailConfig = {
        templatesPath: '',
        host: 'smtp.example.com',
        port: 587,
        user: 'user',
        password: 'password',
        from: 'noreply@example.com',
        dev: {
          host: 'dev.smtp.example.com',
          port: 1025,
        },
      };
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(mailConfig);

      const expectedDevConfig: IMailConfig = {
        host: 'dev.smtp.example.com',
        port: 1025,
        from: 'noreply@example.com',
      };

      const result: IMailConfig = service.getDevConfig();

      expect(result).toEqual(expectedDevConfig);
    });

    it('should throw an error if mail configuration is missing the "from" field', () => {
      const mailConfig: MailConfig = {
        templatesPath: '',
        host: 'smtp.example.com',
        port: 587,
        user: 'user',
        password: 'password',
        from: '',
        dev: {
          host: 'dev.smtp.example.com',
          port: 1025,
        },
      };
      jest.spyOn(configService, 'getOrThrow').mockReturnValue(mailConfig);
      jest.spyOn(i18nService, 't').mockReturnValue('Missing mail configuration');

      expect(() => service.getDevConfig()).toThrow('Missing mail configuration');
    });
  });
});
