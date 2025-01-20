import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function findRootPath(): string {
  const backendPath = join(__dirname, '../../../');

  const uploadsPath = join(backendPath, 'uploads');
  if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath, { recursive: true });
  }

  return backendPath;
}
