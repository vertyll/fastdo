import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import { ApiPaginatedResponse } from '../common/interfaces/api-responses.interface';
import { CustomClsStore } from '../core/config/types/app.config.type';
import { CreateProjectDto } from './dtos/create-project.dto';
import { GetAllProjectsSearchParams } from './dtos/get-all-projects-search-params.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { ProjectUser } from './entities/project-user.entity';
import { Project } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly dataSource: DataSource,
    private readonly cls: ClsService<CustomClsStore>,
  ) {}

  public async findAll(params: GetAllProjectsSearchParams): Promise<ApiPaginatedResponse<Project>> {
    const page = Number(params.page) || 0;
    const pageSize = Number(params.pageSize) || 10;
    const skip = page * pageSize;
    const userId = this.cls.get('user').userId;

    const [items, total] = await this.projectRepository.findAllWithParams(params, skip, pageSize, userId);

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  public async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userId = this.cls.get('user').userId;
      const newProject = await queryRunner.manager.getRepository(Project).save(createProjectDto);

      await queryRunner.manager.getRepository(ProjectUser).save({
        project: { id: newProject.id },
        user: { id: userId },
      });

      await queryRunner.commitTransaction();
      return newProject;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public findOne(id: number): Promise<Project> {
    return this.projectRepository.findOneOrFail({ where: { id } });
  }

  public async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
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
