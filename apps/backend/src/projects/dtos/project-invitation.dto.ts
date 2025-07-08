import { ApiProperty } from '@nestjs/swagger';
import { ProjectInvitationStatusEnum } from '../enums/project-invitation.enum';

export class ProjectInvitationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  inviterId: number;

  @ApiProperty({ required: false })
  roleId?: number;

  @ApiProperty({ enum: ProjectInvitationStatusEnum })
  status: ProjectInvitationStatusEnum;

  @ApiProperty()
  dateCreated: Date;

  @ApiProperty()
  dateUpdated: Date;
}
