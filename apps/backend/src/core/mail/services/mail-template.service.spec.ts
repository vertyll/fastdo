import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import * as Handlebars from 'handlebars';
import { MailTemplateService } from './mail-template.service';

jest.mock('fs/promises');
jest.mock('handlebars');

describe('MailTemplateService', () => {
  let service: MailTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailTemplateService],
    }).compile();

    service = module.get<MailTemplateService>(MailTemplateService);
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

      (fs.readFile as jest.Mock).mockResolvedValue(templateContent);
      (Handlebars.compile as jest.Mock).mockReturnValue(compileMock);

      const result = await service.getTemplate(templateName, data);

      expect(result).toBe(compiledTemplate);
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(`${templateName}.hbs`),
        'utf-8',
      );
      expect(Handlebars.compile).toHaveBeenCalledWith(templateContent);
      expect(compileMock).toHaveBeenCalledWith(data);
    });

    it('should throw an error if template file is not found', async () => {
      const templateName = 'nonExistentTemplate';
      const data = { name: 'John' };

      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(service.getTemplate(templateName, data)).rejects.toThrow('File not found');
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(`${templateName}.hbs`),
        'utf-8',
      );
    });
  });
});
