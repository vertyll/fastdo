import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';
import { Terms } from '../entities/terms.entity';

@Injectable()
export class TermsRepository extends Repository<Terms> {
  constructor(private readonly dataSource: DataSource) {
    super(Terms, dataSource.createEntityManager());
  }

  async getLatestTerms(): Promise<Terms | null> {
    const lang = I18nContext.current()?.lang || 'en';
    return this.createQueryBuilder('terms')
      .leftJoinAndSelect('terms.sections', 'section')
      .leftJoinAndSelect('section.translations', 'sectionTranslation')
      .where('sectionTranslation.languageCode = :lang', { lang })
      .orderBy('terms.dateEffective', 'DESC')
      .addOrderBy('section.order', 'ASC')
      .getOne();
  }
}
