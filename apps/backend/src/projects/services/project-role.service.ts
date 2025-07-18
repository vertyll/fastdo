import { Injectable } from '@nestjs/common';
import { LanguageCodeEnum } from '../../core/language/enums/language-code.enum';
import { ProjectRoleResponseDto } from '../dtos/project-role-response.dto';
import { ProjectRole } from '../entities/project-role.entity';
import { ProjectRoleEnum } from '../enums/project-role.enum';
import { ProjectRoleRepository } from '../repositories/project-role.repository';

@Injectable()
export class ProjectRoleService {
  constructor(
    private readonly projectRoleRepository: ProjectRoleRepository,
  ) {}

  public async findAll(): Promise<ProjectRoleResponseDto[]> {
    return this.projectRoleRepository.findAll();
  }

  public async findOneByCode(code: ProjectRoleEnum): Promise<ProjectRole | null> {
    return this.projectRoleRepository.findOneByCode(code);
  }

  public async findOneById(id: number, lang: string = LanguageCodeEnum.POLISH): Promise<ProjectRole | null> {
    return this.projectRoleRepository.findOneById(id, lang);
  }
}
