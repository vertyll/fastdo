import { LegalSection } from '../enum/legal-section.enum';

export type SectionTranslation = {
  id: number;
  languageCode: string;
  title: string;
  content?: string;
  items?: string[];
};

export type Section = {
  id: number;
  order: number;
  type: LegalSection;
  translations: SectionTranslation[];
};
