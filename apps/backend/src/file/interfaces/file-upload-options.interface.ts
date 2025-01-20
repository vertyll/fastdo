export interface FileUploadOptions {
  path?: string;
  allowedMimeTypes?: string[];
  maxSize?: number;
  preserveOriginalName?: boolean;
  metadata?: Record<string, any>;
}
