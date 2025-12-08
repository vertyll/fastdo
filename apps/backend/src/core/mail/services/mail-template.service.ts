import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { IMailTemplate } from '../interfaces/mail-template.interface';

@Injectable()
export class MailTemplateService implements IMailTemplate {
  constructor(private readonly configService: ConfigService) {}

  private templatePath: string = this.configService.getOrThrow<string>('app.mail.templatesPath');
  private templatesDir: string = path.join(process.cwd(), this.templatePath);

  public async getTemplate(templateName: string, data: any): Promise<string> {
    const templatePath: string = path.join(this.templatesDir, `${templateName}.hbs`);
    const templateContent: string = await fs.readFile(templatePath, 'utf-8');
    const template: HandlebarsTemplateDelegate = Handlebars.compile(templateContent);
    return template(data);
  }
}
