import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { MailConfigService } from '../config/mail.config';
import { MailTemplateNameEnum } from '../enums/mail-template-name.enum';
import { MailSendFailedException } from '../exceptions/mail-send-failed.exception';
import { IMailTemplate } from '../interfaces/mail-template.interface';
import { IMailTransport } from '../interfaces/mail-transport.interface';
import { MailLoggerToken } from '../tokens/mail-logger.token';
import { IMailTemplateToken } from '../tokens/mail-template.token';
import { IMailTransportToken } from '../tokens/mail-transport.token';
import { MailSenderService } from './mail-sender.service';

describe('MailSenderService', () => {
  let service: MailSenderService;
  let transport: jest.Mocked<IMailTransport>;
  let templateService: jest.Mocked<IMailTemplate>;
  let mailConfig: jest.Mocked<MailConfigService>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailSenderService,
        {
          provide: IMailTransportToken,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: IMailTemplateToken,
          useValue: {
            getTemplate: jest.fn(),
          },
        },
        {
          provide: MailConfigService,
          useValue: {
            getConfig: jest.fn(),
          },
        },
        {
          provide: MailLoggerToken,
          useValue: {
            warn: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn((key: string) => key),
            translate: jest.fn((key: string) => key),
          },
        },
      ],
    }).compile();

    service = module.get<MailSenderService>(MailSenderService);
    transport = module.get(IMailTransportToken);
    templateService = module.get(IMailTemplateToken);
    mailConfig = module.get(MailConfigService);
    logger = module.get(MailLoggerToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMail', () => {
    it('should send an email successfully', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        templateName: MailTemplateNameEnum.Confirmation,
        templateData: { name: 'John' },
      };
      const config = {
        from: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        templatesPath: 'templates',
        dev: {
          host: 'localhost',
          port: 1025,
        },
      };
      const html = '<p>Hello, John!</p>';

      mailConfig.getConfig.mockReturnValue(config);
      templateService.getTemplate.mockResolvedValue(html);
      transport.sendMail.mockResolvedValue(undefined);

      await service.sendMail(options);

      expect(mailConfig.getConfig).toHaveBeenCalled();
      expect(templateService.getTemplate).toHaveBeenCalledWith(options.templateName, options.templateData);
      expect(transport.sendMail).toHaveBeenCalledWith({
        from: config.from,
        to: options.to,
        subject: options.subject,
        html,
      });
    });

    it('should retry sending email on failure and eventually throw MailSendFailedException', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        templateName: MailTemplateNameEnum.Confirmation,
        templateData: { name: 'John' },
      };
      const config = {
        from: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        templatesPath: 'templates',
        dev: {
          host: 'localhost',
          port: 1025,
        },
      };
      const html = '<p>Hello, John!</p>';
      const error = new Error('Failed to send email');

      mailConfig.getConfig.mockReturnValue(config);
      templateService.getTemplate.mockResolvedValue(html);
      transport.sendMail.mockRejectedValue(error);

      await expect(service.sendMail(options)).rejects.toThrow(MailSendFailedException);

      expect(mailConfig.getConfig).toHaveBeenCalled();
      expect(templateService.getTemplate).toHaveBeenCalledWith(options.templateName, options.templateData);
      expect(transport.sendMail).toHaveBeenCalledTimes(3);
      expect(logger.warn).toHaveBeenCalledTimes(4); // 3 retries + final failure
    });
  });
});
