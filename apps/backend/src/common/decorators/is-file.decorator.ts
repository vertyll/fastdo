import { MultipartFile } from '@fastify/multipart';
import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export interface FileValidationOptions extends ValidationOptions {
  maxSize?: number;
  mimeTypes?: string[];
}

function isFileValid(file: any, mimeTypes: string[], maxSize?: number): boolean {
  if (!file?.type || file.type !== 'file') return false;
  if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) return false;
  if (maxSize && file.file.bytesRead > maxSize) return false;
  return true;
}

function buildFileErrorMessage(
  file: any,
  mimeTypes: string[],
  maxSize: number | undefined,
  args: ValidationArguments,
): string {
  const invalidFile = i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidFile')(args);
  if (!file?.type || file.type !== 'file') {
    return invalidFile;
  }
  if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) {
    return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidMimeType', {
      args: { allowed: mimeTypes.join(', ') },
    })(args);
  }
  if (maxSize && file.file.bytesRead > maxSize) {
    return i18nValidationMessage<I18nTranslations>('messages.File.errors.fileTooLarge', {
      args: { maxSize: `${Math.floor(maxSize / 1024 / 1024)}MB` },
    })(args);
  }
  return invalidFile;
}

function pickInvalidFile(value: unknown, mimeTypes: string[], maxSize: number | undefined): any {
  if (Array.isArray(value)) {
    return value.find(file => !isFileValid(file, mimeTypes, maxSize)) ?? value[0];
  }
  return value;
}

export function IsFile(options: FileValidationOptions = {}) {
  return function (target: object, propertyName: string): void {
    registerDecorator({
      name: 'isFile',
      target: target.constructor,
      propertyName: propertyName,
      options: options,
      validator: {
        validate(value: any, _args: ValidationArguments): boolean {
          if (value === 'null') return true;
          if (!value) return true;

          const mimeTypes = options.mimeTypes || [];

          if (Array.isArray(value)) {
            return value.every(file => isFileValid(file, mimeTypes, options.maxSize));
          }

          return isFileValid(value as MultipartFile, mimeTypes, options.maxSize);
        },
        defaultMessage(args: ValidationArguments): string {
          if (args.value === 'null') return '';
          const mimeTypes = options.mimeTypes || [];
          const fileToCheck = pickInvalidFile(args.value, mimeTypes, options.maxSize);
          return buildFileErrorMessage(fileToCheck, mimeTypes, options.maxSize, args);
        },
      },
    });
  };
}
