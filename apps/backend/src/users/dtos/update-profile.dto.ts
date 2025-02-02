import {ApiProperty, PartialType} from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n/i18n.generated';
import {RegisterDto} from "../../auth/dtos/register.dto";
import {MultipartFile} from "@fastify/multipart";
import {IsFile} from "../../common/decorators/is-file.decorator";

export class UpdateProfileDto extends PartialType(RegisterDto) {
    @ApiProperty({ description: 'New password', required: false })
    @IsOptional()
    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/, {
        message: i18nValidationMessage<I18nTranslations>('messages.Validation.uppercaseLetter'),
    })
    @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
        message: i18nValidationMessage<I18nTranslations>('messages.Validation.specialCharacter'),
    })
    newPassword?: string;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false,
        description: 'Avatar image (JPEG or PNG, max 5MB)'
    })
    @IsOptional()
    @IsFile({
        mimeTypes: ['image/jpeg', 'image/png'],
        maxSize: 5 * 1024 * 1024, // 5MB
    })
    avatar?: MultipartFile | null;
}