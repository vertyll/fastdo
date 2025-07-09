import { LegalSectionEnum } from '../enum/legal-section.enum';


export type SectionTranslation = {
  id: number;
  language: {
    id: number;
    code: string;
    name: string;
  };
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
