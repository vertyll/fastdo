import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from 'src/common/dtos/translation.dto';
import { ProjectRoleEnum } from '../enums/project-role.enum';

export class ProjectDetailsResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty({ required: false })
  icon: { url: string | null; } | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  dateCreation: Date;

  @ApiProperty({ required: false })
  dateModification?: Date | null;

  @ApiProperty({ required: false })
  type?: { id: number; name?: string; } | null;

  @ApiProperty({ type: [Object], required: false })
  categories?: Array<{ id: number; name: string; }>;

  @ApiProperty({ type: [Object], required: false })
  statuses?: Array<{ id: number; name: string; }>;

  @ApiProperty({ type: [String], required: false })
  permissions?: string[];

  @ApiProperty({ type: [Object], required: false })
  projectUserRoles?: Array<{
    user: { id: number; email: string; };
    projectRole: {
      code: ProjectRoleEnum;
      translations: TranslationDto[];
      name?: string;
      description?: string;
    };
  }>;
}
