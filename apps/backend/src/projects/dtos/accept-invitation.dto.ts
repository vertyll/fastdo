import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty()
  @IsNumber()
  public readonly invitationId: number;
}
