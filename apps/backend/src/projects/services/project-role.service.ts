import { Injectable } from '@nestjs/common';
import { ProjectRole } from '../entities/project-role.entity';
import { ProjectRoleRepository } from '../repositories/project-role.repository';

@Injectable()
export class ProjectRoleService {
  constructor(
    private readonly projectRoleRepository: ProjectRoleRepository,
  ) {}

  public async findAll(): Promise<
    { id: number; translations: { lang: string; name: string; description?: string; }[]; }[]
  > {
    return this.projectRoleRepository.findAllWithTranslations();
  }

  public async findOneByCode(code: string): Promise<ProjectRole | null> {
    return this.projectRoleRepository.findOneByCode(code);
  }

  public async findOneById(id: number, languageCode: string = 'pl'): Promise<ProjectRole | null> {
    return this.projectRoleRepository.findOneById(id, languageCode);
  }
}
