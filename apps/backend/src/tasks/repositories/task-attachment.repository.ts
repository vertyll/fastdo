import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TaskAttachment } from '../entities/task-attachment.entity';

@Injectable()
export class TaskAttachmentRepository extends Repository<TaskAttachment> {
  constructor(dataSource: DataSource) {
    super(TaskAttachment, dataSource.createEntityManager());
  }
}
