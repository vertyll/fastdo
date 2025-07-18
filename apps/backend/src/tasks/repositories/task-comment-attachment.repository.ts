import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TaskCommentAttachment } from '../entities/task-comment-attachment.entity';

@Injectable()
export class TaskCommentAttachmentRepository extends Repository<TaskCommentAttachment> {
  constructor(private readonly dataSource: DataSource) {
    super(TaskCommentAttachment, dataSource.createEntityManager());
  }
}
