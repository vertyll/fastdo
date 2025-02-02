import { MultipartFile } from '@fastify/multipart';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';

export interface FileValidationOptions extends ValidationOptions {
    maxSize?: number;
    mimeTypes?: string[];
}

export function IsFile(options: FileValidationOptions = {}) {
    return function (target: object, propertyName: string) {
        registerDecorator({
            name: 'isFile',
            target: target.constructor,
            propertyName: propertyName,
            options: options,
            validator: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                validate(value: any, _args: ValidationArguments) {
                    if (!value) return true;
                    if (!value.type || value.type !== 'file') return false;

                    const file = value as MultipartFile;
                    const mimeTypes = options.mimeTypes || [];

                    if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) {
                        return false;
                    }

                    return !(options.maxSize && file.file.bytesRead > options.maxSize);


                },
                defaultMessage(args: ValidationArguments): string {
                    const file = args.value as MultipartFile;
                    const mimeTypes = options.mimeTypes || [];

                    if (!file?.type || file.type !== 'file') {
                        return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidFile')(args);
                    }

                    if (mimeTypes.length > 0 && !mimeTypes.includes(file.mimetype)) {
                        return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidMimeType', {
                            args: {
                                allowed: mimeTypes.join(', ')
                            }
                        })(args);
                    }

                    if (options.maxSize && file.file.bytesRead > options.maxSize) {
                        return i18nValidationMessage<I18nTranslations>('messages.File.errors.fileTooLarge', {
                            args: {
                                maxSize: `${Math.floor(options.maxSize / 1024 / 1024)}MB`
                            }
                        })(args);
                    }

                    return i18nValidationMessage<I18nTranslations>('messages.File.errors.invalidFile')(args);
                }
            }
        });
    };
}