import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { MailTemplateService } from './mail-template.service';

jest.mock('fs/promises');
jest.mock('handlebars');
jest.mock('path');

describe('MailTemplateService', () => {
  let service: MailTemplateService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailTemplateService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailTemplateService>(MailTemplateService);
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplate', () => {
    it('should return the compiled template', async () => {
      const templateName = 'testTemplate';
      const data = { name: 'John' };
      const templateContent = 'Hello, {{name}}!';
      const compiledTemplate = 'Hello, John!';
      const compileMock = jest.fn().mockReturnValue(compiledTemplate);

      configService.getOrThrow.mockReturnValue('src/mail/templates');
      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compileMock);
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));

      const result = await service.getTemplate(templateName, data);

      expect(result).toBe(compiledTemplate);
      expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining(`${templateName}.hbs`), 'utf-8');
      expect(Handlebars.compile).toHaveBeenCalledWith(templateContent);
      expect(compileMock).toHaveBeenCalledWith(data);
    });

    it('should throw an error if template file is not found', async () => {
      const templateName = 'nonExistentTemplate';
      const data = { name: 'John' };

      configService.getOrThrow.mockReturnValue('src/mail/templates');
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));

      await expect(service.getTemplate(templateName, data)).rejects.toThrow('File not found');
      expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining(`${templateName}.hbs`), 'utf-8');
    });
  });
});
