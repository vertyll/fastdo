import { ApiProperty } from '@nestjs/swagger';
import { File } from '../../core/file/entities/file.entity';
import { User } from '../../users/entities/user.entity';

export class TaskCommentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  dateCreation: Date;

  @ApiProperty()
  dateModification: Date;

  @ApiProperty({ type: () => User })
  author: User;

  @ApiProperty({ type: () => File, isArray: true })
  attachments: File[];
}
