import { Test } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { MailConfigService } from '../../config/mail.config';
import { NodemailerTransport } from './nodemailer-transport.service';

jest.mock('nodemailer');

describe('NodemailerTransport', () => {
  let transport: NodemailerTransport;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    } as any;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module = await Test.createTestingModule({
      providers: [
        NodemailerTransport,
        {
          provide: MailConfigService,
          useValue: {
            getConfig: jest.fn().mockReturnValue({
              host: 'smtp.example.com',
              port: 587,
              user: 'user',
              password: 'pass',
            }),
          },
        },
      ],
    }).compile();

    transport = module.get<NodemailerTransport>(NodemailerTransport);
  });

  it('should initialize with correct config', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      auth: {
        user: 'user',
        pass: 'pass',
      },
    });
  });

  describe('sendMail', () => {
    const mailOptions = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
    };

    it('should send mail successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({} as any);

      await transport.sendMail(mailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(mailOptions);
    });

    it('should propagate errors from transporter', async () => {
      const error = new Error('Send failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(transport.sendMail(mailOptions)).rejects.toThrow(error);
    });
  });
});
