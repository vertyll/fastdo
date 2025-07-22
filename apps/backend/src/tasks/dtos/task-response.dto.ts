import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from '../../common/dtos/translation.dto';
import { File } from '../../core/file/entities/file.entity';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { TaskCommentDto } from './task-comment.dto';

export class TaskResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  additionalDescription: string | null;

  @ApiProperty({ description: 'Price estimation in hours (0-100, where 100 = 1 hour)' })
  priceEstimation: number;

  @ApiProperty({ description: 'Worked time in hours (0-100, where 100 = 1 hour)' })
  workedTime: number;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'number' },
      code: { type: 'string' },
      isActive: { type: 'boolean' },
      dateCreation: { type: 'string', format: 'date-time' },
      dateModification: { type: 'string', format: 'date-time', nullable: true },
      translations: { type: 'array', items: { type: 'object' } },
    },
    required: ['id', 'code', 'isActive', 'dateCreation', 'translations'],
    nullable: true,
  })
  accessRole?: {
    id: number;
    code: string;
    isActive: boolean;
    dateCreation: Date;
    dateModification: Date | null;
    translations: TranslationDto[];
  };

  @ApiProperty({ type: () => Date })
  dateCreation: Date;

  @ApiProperty({ type: () => Date, nullable: true })
  dateModification: Date | null;

  @ApiProperty({ type: () => Project })
  project: Project;

  @ApiProperty({ type: () => User, isArray: true })
  assignedUsers: User[];

  @ApiProperty({ type: () => User })
  createdBy: User;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'number' },
      code: { type: 'string' },
      color: { type: 'string' },
      isActive: { type: 'boolean' },
      dateCreation: { type: 'string', format: 'date-time' },
      dateModification: { type: 'string', format: 'date-time', nullable: true },
      translations: { type: 'array', items: { type: 'object' } },
    },
    required: ['id', 'code', 'color', 'isActive', 'dateCreation', 'translations'],
    nullable: true,
  })
  priority?: {
    id: number;
    code: string;
    color: string;
    isActive: boolean;
    dateCreation: Date;
    dateModification: Date | null;
    translations: TranslationDto[];
  };

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        color: { type: 'string' },
        isActive: { type: 'boolean' },
        translations: { type: 'array', items: { type: 'object' } },
      },
      required: ['id', 'color', 'isActive', 'translations'],
    },
  })
  categories: Array<{
    id: number;
    color: string;
    isActive: boolean;
    translations: TranslationDto[];
  }>;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'number' },
      color: { type: 'string' },
      isActive: { type: 'boolean' },
      translations: { type: 'array', items: { type: 'object' } },
    },
    required: ['id', 'color', 'isActive', 'translations'],
    nullable: true,
  })
  status: {
    id: number;
    color: string;
    isActive: boolean;
    translations: TranslationDto[];
  } | null;

  @ApiProperty({ type: () => File, isArray: true })
  attachments: File[];

  @ApiProperty({ type: () => TaskCommentDto, isArray: true })
  comments: TaskCommentDto[];
}
