import { Language } from 'src/app/core/models/Language';
import { LegalSectionEnum } from '../enum/legal-section.enum';

export type SectionTranslation = {
  id: number;
  language: Language;
  title: string;
  content?: string;
  items?: string[];
};

export type Section = {
  id: number;
  order: number;
  type: LegalSectionEnum;
  translations: SectionTranslation[];
};
