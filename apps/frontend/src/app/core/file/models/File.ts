export type File = {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  encoding: string;
  size: number;
  storageType: StorageType;
  url?: string;
  metadata?: Record<string, any>;
  dateCreation: string;
  dateModification: string;
  dateDeletion?: string;
};

type StorageType = 'LOCAL' | 'CLOUD';
