import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { GetAllProjectsSearchParams } from "../dto/get-all-projects-search-params.dto";
import { Project } from "../entities/project.entity";

@Injectable()
export class ProjectRepository extends Repository<Project> {
  constructor(private dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }

  async findAllWithParams(
    params: GetAllProjectsSearchParams
  ): Promise<Project[]> {
    const query = this.dataSource.createQueryBuilder(Project, "project");

    if (params.q) {
      query.andWhere("project.name LIKE :q", { q: `%${params.q}%` });
    }

    if (params.createdFrom && params.createdFrom !== "") {
      query.andWhere("project.createdAt >= :createdFrom", {
        createdFrom: params.createdFrom,
      });
    }

    if (params.createdTo && params.createdTo !== "") {
      query.andWhere("project.createdAt <= :createdTo", {
        createdTo: params.createdTo,
      });
    }

    if (params.updatedFrom && params.updatedFrom !== "") {
      query.andWhere("project.updatedAt >= :updatedFrom", {
        updatedFrom: params.updatedFrom,
      });
    }

    if (params.updatedTo && params.updatedTo !== "") {
      query.andWhere("project.updatedAt <= :updatedTo", {
        updatedTo: params.updatedTo,
      });
    }

    if (params.sortBy && params.orderBy) {
      query.orderBy(
        `project.${params.sortBy}`,
        params.orderBy.toUpperCase() as "ASC" | "DESC"
      );
    } else {
      query.orderBy("project.createdAt", "DESC");
    }

    return query.getMany();
  }
}
