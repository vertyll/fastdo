import { ApiProperty } from '@nestjs/swagger';
import {IsString} from "class-validator";
import {i18nValidationMessage} from "nestjs-i18n";
import {I18nTranslations} from "../../generated/i18n/i18n.generated";

export class RefreshTokenDto {
  @ApiProperty()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('messages.Validation.isString') })
  refreshToken: string;
}
