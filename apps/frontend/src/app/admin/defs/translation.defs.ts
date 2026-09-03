export type TranslationValue = {
  language: string;
  defaultValue: string | null;
  overrideValue: string | null;
  effectiveValue: string | null;
  isOverridden: boolean;
  updatedAt: string;
  version: number | null;
};

export type TranslationKeyDetails = {
  key: string;
  sourceService: string;
  description: string | null;
  values: TranslationValue[];
  missingLanguages: string[];
  createdAt: string;
  updatedAt: string;
};

export type RejectedPattern = {
  key: string;
  language: string;
  reason: string;
};

export type MissingTranslation = {
  key: string;
  language: string;
};

export type ImportReport = {
  applied: number;
  skippedUnknownKeys: string[];
  skippedUnknownLanguages: string[];
  rejectedPatterns: RejectedPattern[];
  missingAfterImport: MissingTranslation[];
};

export type TranslationSearchParams = {
  searchTerm?: string;
  sourceService?: string;
  onlyMissing?: boolean;
  page?: number;
  size?: number;
};
