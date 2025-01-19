export interface ITemplateData {
  confirmationUrl?: string;
  resetUrl?: string;
}

export interface IMailTemplate {
  getTemplate(templateName: string, data: ITemplateData): Promise<string>;
}
