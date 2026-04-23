import { ApiProperty } from '@nestjs/swagger';
import { TranslationDto } from 'src/common/dtos/translation.dto';
import { ProjectRoleEnum } from '../enums/project-role.enum';

export class ProjectDetailsResponseDto {
  @ApiProperty()
  public readonly id: number;

  @ApiProperty()
  public readonly name: string;

  @ApiProperty({ required: false })
  public readonly description?: string | null;

  @ApiProperty()
  public readonly isPublic: boolean;

  @ApiProperty({ required: false })
  public readonly icon: { url: string | null } | null;

  @ApiProperty()
  public readonly isActive: boolean;

  @ApiProperty()
  public readonly dateCreation: Date;

  @ApiProperty({ required: false })
  public readonly dateModification?: Date | null;

  @ApiProperty({ required: false })
  public readonly type?: { id: number; code: string; translations: TranslationDto[] };

  @ApiProperty({ type: [Object], required: false })
  public readonly categories?: Array<{ id: number; name: string; color: string }>;

  @ApiProperty({ type: [Object], required: false })
  public readonly statuses?: Array<{ id: number; name: string; color: string }>;

  @ApiProperty({ type: [String], required: false })
  public readonly permissions?: string[];

  @ApiProperty({ type: [Object], required: false })
  public readonly projectUserRoles?: Array<{
    user: { id: number; email: string };
    projectRole: {
      code: ProjectRoleEnum;
      translations: TranslationDto[];
      name?: string;
      description?: string;
    };
  }>;
}
