export interface SimpleNameItem {
  id: number;
  name: string;
}

export interface TranslationItem {
  lang: string;
  name?: string;
}

export interface TranslatableOptionItem {
  id: number;
  name?: string;
  code?: string;
  translations?: TranslationItem[];
}
