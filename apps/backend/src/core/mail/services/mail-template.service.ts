import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { IMailTemplate } from '../interfaces/mail-template.interface';

@Injectable()
export class MailTemplateService implements IMailTemplate {
  private templatesDir = path.join(process.cwd(), 'src/core/mail/templates');

  async getTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template(data);
  }
}
