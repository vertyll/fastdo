import { TemplateData } from '../types/template-data.interface';

export interface IMailTemplate {
  getTemplate(templateName: string, data: TemplateData): Promise<string>;
}
