import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailSenderService } from './mail-sender.service';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let mailSender: jest.Mocked<MailSenderService>;
  let configService: jest.Mocked<ConfigService>;

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
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailSender = module.get(MailSenderService);
    configService = module.get(ConfigService);
  });

  describe('sendConfirmationEmail', () => {
    it('should send a confirmation email', async () => {
      const to = 'test@example.com';
      const token = 'testToken';
      const appUrl = 'http://localhost:3000';

      configService.get.mockReturnValue(appUrl);

      await service.sendConfirmationEmail(to, token);

      expect(configService.get).toHaveBeenCalledWith('app.appUrl');
      expect(mailSender.sendMail).toHaveBeenCalledWith({
        to,
        subject: 'Confirm your email',
        templateName: 'confirmation',
        templateData: {
          confirmationUrl: `${appUrl}/auth/confirm-email?token=${token}`,
        },
      });
    });
  });
});
