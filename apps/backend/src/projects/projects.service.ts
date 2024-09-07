import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { GetAllProjectsSearchParams } from './dto/get-all-projects-search-params.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectQueryBuilder } from './utils/project-query.builder';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
    private queryBuilder: ProjectQueryBuilder,
  ) {}

  async findAll(params: GetAllProjectsSearchParams): Promise<Project[]> {
    const query = this.queryBuilder.buildQuery(this.projectsRepository, params);
    return query.getMany();
  }

  create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);
    return this.projectsRepository.save(project);
  }

  findOne(id: number): Promise<Project> {
    return this.projectsRepository.findOneOrFail({ where: { id } });
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    await this.projectsRepository.update(id, {
      ...updateProjectDto,
      updatedAt: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}
