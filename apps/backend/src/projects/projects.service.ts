import { Injectable } from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project.dto";
import { GetAllProjectsSearchParams } from "./dto/get-all-projects-search-params.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { Project } from "./entities/project.entity";
import { ProjectRepository } from "./repositories/project.repository";

@Injectable()
export class ProjectsService {
  constructor(private projectRepository: ProjectRepository) {}

  async findAll(params: GetAllProjectsSearchParams): Promise<Project[]> {
    return this.projectRepository.findAllWithParams(params);
  }

  create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  findOne(id: number): Promise<Project> {
    return this.projectRepository.findOneOrFail({ where: { id } });
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    await this.projectRepository.update(id, {
      ...updateProjectDto,
      dateModification: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
