export enum FileScopeEnum {
  USER_AVATAR = 'USER_AVATAR',
  PROJECT_ICON = 'PROJECT_ICON',
  TASK_ATTACHMENT = 'TASK_ATTACHMENT',
}

export enum UploadStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELETED = 'DELETED',
}

export type UploadTicket = {
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
  maxSizeBytes: number;
};

export type DownloadTicket = {
  fileId: string;
  downloadUrl: string;
  originalName: string;
  contentType: string;
  expiresAt: string;
};

export type StoredFile = {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  status: UploadStatusEnum;
  scope: FileScopeEnum;
  scopeId: string | null;
  createdAt: string;
};

export type RequestUploadPayload = {
  originalName: string;
  contentType: string;
  declaredSizeBytes: number;
  scope: FileScopeEnum;
  scopeId?: string | null;
};
