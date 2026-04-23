import { ApiProperty } from '@nestjs/swagger';
import { File } from '../../core/file/entities/file.entity';
import { User } from '../../users/entities/user.entity';

export class TaskCommentDto {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty()
  public readonly content: string;

  @ApiProperty({ type: () => Date })
  public readonly dateCreation: Date;

  @ApiProperty({ type: () => Date, nullable: true })
  public readonly dateModification: Date | null;

  @ApiProperty({ type: () => User })
  public readonly author: User;

  @ApiProperty({ type: () => File, isArray: true })
  public readonly attachments: File[];
}
