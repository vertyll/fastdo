import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailConfigService } from '../config/mail.config';
import { MailSendFailedException } from '../exceptions/mail-send-failed.exception';
import { IMailTemplate } from '../interfaces/mail-template.interface';
import { IMailTransport } from '../interfaces/mail-transport.interface';
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
          provide: 'IMailTransport',
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: 'IMailTemplate',
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
          provide: 'MailLogger',
          useValue: {
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailSenderService>(MailSenderService);
    transport = module.get('IMailTransport');
    templateService = module.get('IMailTemplate');
    mailConfig = module.get(MailConfigService);
    logger = module.get('MailLogger');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMail', () => {
    it('should send an email successfully', async () => {
      const options = {
        to: 'test@example.com',
        subject: 'Test Subject',
        templateName: 'testTemplate',
        templateData: { name: 'John' },
      };
      const config = {
        from: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        appUrl: 'http://example.com',
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
        templateName: 'testTemplate',
        templateData: { name: 'John' },
      };
      const config = {
        from: 'no-reply@example.com',
        host: 'smtp.example.com',
        port: 587,
        appUrl: 'http://example.com',
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
