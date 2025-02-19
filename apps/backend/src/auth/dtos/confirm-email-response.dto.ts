import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  email: string;
}
