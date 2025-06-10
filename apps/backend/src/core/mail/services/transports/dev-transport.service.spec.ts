import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import * as nodemailer from 'nodemailer';
import { Environment } from '../../../config/types/app.config.type';
import { MailConfigService } from '../../config/mail.config';
import { MailSendFailedException } from '../../exceptions/mail-send-failed.exception';
import { MailLoggerToken } from '../../tokens/mail-logger.token';
import { DevTransport } from './dev-transport.service';

jest.mock('nodemailer');

describe('DevTransport', () => {
  let transport: DevTransport;
  let configService: ConfigService;
  let logger: Logger;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;

  beforeEach(async () => {
    mockTransporter = {
      verify: jest.fn(),
      sendMail: jest.fn(),
    } as any;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module = await Test.createTestingModule({
      providers: [
        DevTransport,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: MailConfigService,
          useValue: {
            getDevConfig: jest.fn().mockReturnValue({
              host: 'localhost',
              port: 1025,
            }),
          },
        },
        {
          provide: MailLoggerToken,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            t: jest.fn().mockReturnValue('translated error'),
            translate: jest.fn().mockReturnValue('translated error'),
          },
        },
      ],
    }).compile();

    transport = module.get<DevTransport>(DevTransport);
    configService = module.get<ConfigService>(ConfigService);
    logger = module.get<Logger>(MailLoggerToken);
  });

  it('should initialize successfully when MailDev is available', async () => {
    mockTransporter.verify.mockResolvedValue(true);
    await transport['initializeTransporter']();

    expect(transport['isMailDevAvailable']).toBe(true);
    expect(logger.log).toHaveBeenCalledWith('MailDev is available');
  });

  it('should handle initialization failure', async () => {
    mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
    await transport['initializeTransporter']();

    expect(transport['isMailDevAvailable']).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith('MailDev is not available. Emails will not be sent in development mode.');
  });

  describe('sendMail', () => {
    const mailOptions = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
    };

    it('should send mail successfully when MailDev is available', async () => {
      transport['isMailDevAvailable'] = true;
      mockTransporter.sendMail.mockResolvedValue({} as any);

      await transport.sendMail(mailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(mailOptions);
    });

    it('should not throw in development when MailDev is unavailable', async () => {
      transport['isMailDevAvailable'] = false;
      jest.spyOn(configService, 'get').mockReturnValue(Environment.DEVELOPMENT);

      await transport.sendMail(mailOptions);

      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw MailSendFailedException in production when MailDev is unavailable', async () => {
      transport['isMailDevAvailable'] = false;
      jest.spyOn(configService, 'get').mockReturnValue(Environment.PRODUCTION);

      await expect(transport.sendMail(mailOptions)).rejects.toThrow(MailSendFailedException);
    });

    it('should throw MailSendFailedException when sendMail fails', async () => {
      transport['isMailDevAvailable'] = true;
      mockTransporter.sendMail.mockRejectedValue(new Error('Send failed'));

      await expect(transport.sendMail(mailOptions)).rejects.toThrow(MailSendFailedException);
    });
  });
});
