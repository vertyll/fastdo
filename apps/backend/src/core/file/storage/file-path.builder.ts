import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilePathBuilder {
  public buildPath(filename: string, customPath?: string): string {
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const sanitizedFilename = this.sanitizeFilename(filename);

    if (customPath) return join(customPath, `${uniqueId}-${sanitizedFilename}`);

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return join(
      year.toString(),
      month,
      day,
      `${uniqueId}-${sanitizedFilename}`,
    );
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');
  }
}
