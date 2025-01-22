import { Test, TestingModule } from '@nestjs/testing';
import { MailConfigService } from '../config/mail.config';
import { MailSenderService } from './mail-sender.service';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailSender: jest.Mocked<MailSenderService>;
  let mailConfig: jest.Mocked<MailConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailSenderService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: MailConfigService,
          useValue: {
            getConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailSender = module.get(MailSenderService);
    mailConfig = module.get(MailConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendConfirmationEmail', () => {
    it('should send a confirmation email', async () => {
      const to = 'test@example.com';
      const token = 'testToken';
      const config = {
        appUrl: 'http://example.com',
        host: 'smtp.example.com',
        port: 587,
        from: 'no-reply@example.com',
      };

      mailConfig.getConfig.mockReturnValue(config);

      await service.sendConfirmationEmail(to, token);

      expect(mailConfig.getConfig).toHaveBeenCalled();
      expect(mailSender.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Confirm your email',
        templateName: 'confirmation',
        templateData: {
          confirmationUrl: `${config.appUrl}/auth/confirm-email?token=${token}`,
        },
      });
    });
  });
});
