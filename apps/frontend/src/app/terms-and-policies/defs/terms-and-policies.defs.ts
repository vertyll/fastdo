import { Language } from 'src/app/core/defs/core.defs';

export enum LegalSectionEnum {
  HEADER = 'header',
  LIST = 'list',
  PARAGRAPH = 'paragraph',
}

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

export type PrivacyPolicy = {
  id: number;
  version: string;
  dateEffective: number;
  dateCreation: number;
  dateModification: number | null;
  sections: Section[];
};

export type Terms = {
  id: number;
  version: string;
  dateEffective: number;
  dateCreation: number;
  dateModification: number | null;
  sections: Section[];
};
