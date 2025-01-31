import { Section } from '../types/terms-and-policies.types';

export type PrivacyPolicy = {
  id: number;
  version: string;
  dateEffective: number;
  dateCreation: number;
  dateModification: number | null;
  sections: Section[];
};
