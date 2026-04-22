import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ProjectInvitation } from '../entities/project-invitation.entity';

@Injectable()
export class ProjectInvitationRepository extends Repository<ProjectInvitation> {
  constructor(dataSource: DataSource) {
    super(ProjectInvitation, dataSource.createEntityManager());
  }
}
