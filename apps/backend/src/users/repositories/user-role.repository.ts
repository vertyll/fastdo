import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserRole } from "../entities/user-role.entity";

@Injectable()
export class UserRoleRepository extends Repository<UserRole> {
  constructor(private dataSource: DataSource) {
    super(UserRole, dataSource.createEntityManager());
  }
}
