import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty()
  @IsNumber()
  invitationId: number;
}
