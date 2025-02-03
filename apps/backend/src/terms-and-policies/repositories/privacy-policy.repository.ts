import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';
import { PrivacyPolicy } from '../entities/privacy-policy.entity';

@Injectable()
export class PrivacyPolicyRepository extends Repository<PrivacyPolicy> {
  constructor(private readonly dataSource: DataSource) {
    super(PrivacyPolicy, dataSource.createEntityManager());
  }

  public async getLatestPrivacyPolicy(): Promise<PrivacyPolicy | null> {
    const lang = I18nContext.current()?.lang || 'en';
    return this.createQueryBuilder('privacy_policy')
      .leftJoinAndSelect('privacy_policy.sections', 'section')
      .leftJoinAndSelect('section.translations', 'sectionTranslation')
      .where('sectionTranslation.languageCode = :lang', { lang })
      .orderBy('privacy_policy.dateEffective', 'DESC')
      .addOrderBy('section.order', 'ASC')
      .getOne();
  }
}
