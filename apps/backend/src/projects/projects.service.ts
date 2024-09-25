import { Injectable } from "@nestjs/common";
import { CreateProjectDto } from "./dtos/create-project.dto";
import { GetAllProjectsSearchParams } from "./dtos/get-all-projects-search-params.dto";
import { UpdateProjectDto } from "./dtos/update-project.dto";
import { Project } from "./entities/project.entity";
import { ProjectRepository } from "./repositories/project.repository";

@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  public async findAll(params: GetAllProjectsSearchParams): Promise<Project[]> {
    return this.projectRepository.findAllWithParams(params);
  }

  public create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  public findOne(id: number): Promise<Project> {
    return this.projectRepository.findOneOrFail({ where: { id } });
  }

  public async update(
    id: number,
    updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    await this.projectRepository.update(id, {
      ...updateProjectDto,
      dateModification: new Date(),
    });
    return this.findOne(id);
  }

  public async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
