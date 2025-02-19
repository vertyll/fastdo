import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailChangeResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  email: string;
}
