import { MultipartFile } from '@fastify/multipart';
import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export interface FileValidationOptions extends ValidationOptions {
  maxSize?: number;
  mimeTypes?: string[];
}

export function IsFile(options: FileValidationOptions = {}) {
  return function(target: object, propertyName: string): void {
    registerDecorator({
      name: 'isFile',
      target: target.constructor,
      propertyName: propertyName,
      options: options,
      validator: {
        validate(value: any, _args: ValidationArguments): boolean {
          if (value === 'null') return true;
          if (!value) return true;

          // Handle array of files
          if (Array.isArray(value)) {
            return value.every(file => {
              if (!file.type || file.type !== 'file') return false;
              const mimeTypes = options.mimeTypes || [];
              if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) return false;
              return !(options.maxSize && file.file.bytesRead > options.maxSize);
            });
          }

          // Handle single file
          if (!value.type || value.type !== 'file') return false;
          const file = value as MultipartFile;
          const mimeTypes = options.mimeTypes || [];
          if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) return false;
          return !(options.maxSize && file.file.bytesRead > options.maxSize);
        },
        defaultMessage(args: ValidationArguments): string {
          const value = args.value;
          const mimeTypes = options.mimeTypes || [];

          if (value === 'null') {
            return '';
          }

          // Handle array of files
          if (Array.isArray(value)) {
            const invalidFile = value.find(file => {
              if (!file?.type || file.type !== 'file') return true;
              if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) return true;
              if (options.maxSize && file.file.bytesRead > options.maxSize) return true;
              return false;
            });

            if (invalidFile) {
              if (!invalidFile?.type || invalidFile.type !== 'file') {
                return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidFile')(args);
              }
              if (mimeTypes.length > 0 && !mimeTypes.includes(invalidFile.mimetype)) {
                return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidMimeType', {
                  args: { allowed: mimeTypes.join(', ') },
                })(args);
              }
              if (options.maxSize && invalidFile.file.bytesRead > options.maxSize) {
                return i18nValidationMessage<I18nTranslations>('messages.File.errors.fileTooLarge', {
                  args: { maxSize: `${Math.floor(options.maxSize / 1024 / 1024)}MB` },
                })(args);
              }
            }
          } else {
            // Handle single file
            const file = value as MultipartFile;
            if (!file?.type || file.type !== 'file') {
              return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidFile')(args);
            }
            if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) {
              return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidMimeType', {
                args: { allowed: mimeTypes.join(', ') },
              })(args);
            }
            if (options.maxSize && file.file.bytesRead > options.maxSize) {
              return i18nValidationMessage<I18nTranslations>('messages.File.errors.fileTooLarge', {
                args: { maxSize: `${Math.floor(options.maxSize / 1024 / 1024)}MB` },
              })(args);
            }
          }

          return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidFile')(args);
        },
      },
    });
  };
}
