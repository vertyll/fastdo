import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Terms } from '../entities/terms.entity';

@Injectable()
export class TermsRepository extends Repository<Terms> {
  constructor(private readonly dataSource: DataSource) {
    super(Terms, dataSource.createEntityManager());
  }

  public async getLatestTermsWithTranslations(): Promise<Terms | null> {
    return this.createQueryBuilder('terms')
      .leftJoinAndSelect('terms.sections', 'section')
      .leftJoinAndSelect('section.translations', 'sectionTranslation')
      .leftJoinAndSelect('sectionTranslation.language', 'language')
      .orderBy('terms.dateEffective', 'DESC')
      .addOrderBy('section.order', 'ASC')
      .getOne();
  }
}
