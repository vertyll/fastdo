import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RejectInvitationDto {
  @ApiProperty()
  @IsNumber()
  invitationId: number;
}
