import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs/promises';
import * as Handlebars from 'handlebars';
import * as path from 'node:path';
import { IMailTemplate } from '../interfaces/mail-template.interface';

@Injectable()
export class MailTemplateService implements IMailTemplate {
  constructor(private readonly configService: ConfigService) {}

  private readonly templatePath: string = this.configService.getOrThrow<string>('app.mail.templatesPath');
  private readonly templatesDir: string = path.join(process.cwd(), this.templatePath);

  public async getTemplate(templateName: string, data: any): Promise<string> {
    const templatePath: string = path.join(this.templatesDir, `${templateName}.hbs`);
    const templateContent: string = await fs.readFile(templatePath, 'utf-8');
    const template: HandlebarsTemplateDelegate = Handlebars.compile(templateContent);
    return template(data);
  }
}
